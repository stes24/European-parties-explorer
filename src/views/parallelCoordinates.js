import Chart from './chart.js'
import * as d3 from 'd3'
import { attributes, factions, countries, moveTooltip } from './../utils.js'

// Rememeber that Chart cointains containerDiv, svg, width, height, dataset, controller, year, countries, factions
export default class ParallelCoordinates extends Chart {
  constructor (...args) {
    super(...args)
    this.brushedData = new Set()
    this.lines = null
  }

  drawChart () {
    const margin = { top: 50, right: 60, bottom: 10, left: 125 }
    const attributeIds = Object.keys(attributes)

    // Use selected filters
    const data = this.dataset.filter(d => d.year === this.year && d.country in this.countries && d.family in this.factions)

    const xScale = d3.scalePoint()
      .domain(attributeIds)
      .range([margin.left, this.width - margin.right])

    // Define more y scales, one for each attribute
    const yScales = {} // Will be a map
    attributeIds.forEach(attr => {
      if (attr === 'family') {
        yScales[attr] = d3.scaleLinear() // Key (attribute) -> will find value (scale associated to that attribute)
          .domain([1, 11])
          .range([this.height - margin.bottom, margin.top])
      } else if (attr === 'eu_position' || attr === 'eu_intmark' || attr === 'eu_foreign') {
        yScales[attr] = d3.scaleLinear()
          .domain([1, 7])
          .range([this.height - margin.bottom, margin.top])
      } else {
        yScales[attr] = d3.scaleLinear()
          .domain([0, 10])
          .range([this.height - margin.bottom, margin.top])
      }
    })

    // How to generate the lines
    const line = d3.line()
      .defined(d => d[1] !== null && !isNaN(d[1])) // Ignore invalid values
      .x(d => xScale(d[0])) // d = [attribute name, value]
      .y(d => yScales[d[0]](d[1])) // Find right scale with attribute, then find value in the scale

    // Draw lines
    this.lines = this.svg.append('g')
      .selectAll('path')
      .data(data)
      .enter()
      .append('path')
      .attr('class', 'line')
      .attr('d', d => line(attributeIds.map(attr => [attr, d[attr]])))
      // For each datum, create [attr, value] and give it to line (it connects the values of different attributes)
      .on('mouseover', (event, d) => this.handleMouseOver(event, d)) // Handle hovering
      .on('mousemove', (event) => this.handleMouseMove(event))
      .on('mouseout', (event, d) => this.handleMouseOut(d))

    // For adding and removing brushes
    const activeBrushes = {}

    // y axis
    this.svg.selectAll('axis') // Vertical axis to be inserted
      .data(attributeIds) // Bind one attribute to each axis
      .enter()
      .append('g')
      .attr('class', 'axis')
      .attr('transform', d => `translate(${xScale(d)}, 0)`) // Each attribute positions the corresponding axis
      .each(function (d) { // Find corresponding scale, call axis like normally except many times
        const axis = d3.axisLeft(yScales[d])

        if (d === 'family') {
          axis.tickFormat(id => factions[id])
        } else if (d === 'eu_position' || d === 'eu_intmark' || d === 'eu_foreign') {
          axis.ticks(7)
        }

        d3.select(this)
          .call(axis) // Create axis
          .call(d3.brushY() // Create brush for each axis
            .filter(event => event.target.tagName !== 'text') // Avoids the very bad bug
            .extent([[-8, yScales[d].range()[1]], [8, yScales[d].range()[0]]])
            .on('start brush end', ({ selection }) => {
              if (selection) {
                activeBrushes[d] = selection // Add brush to the set of brushes
              } else {
                delete activeBrushes[d] // Brush deleted
              }
              colorLines() // Tell the controller how to color lines
            })
          )

        d3.select(this)
          .append('text') // Text operations
          .attr('class', 'legend')
          .attr('transform', 'rotate(-13)')
          .attr('x', 10)
          .attr('y', margin.top - 18)
          .attr('text-anchor', 'middle')
          .text(attributes[d])
      })

    const colorLines = () => { // Defined as a constant so that 'this' is the instance of ParallelCoordinates
      this.brushedData.clear()

      if (Object.keys(activeBrushes).length > 0) { // There is at least one brush
        this.lines.filter(d => {
          const selectedLines = Object.entries(activeBrushes).every(([attr, [y0, y1]]) =>
            y0 <= yScales[attr](d[attr]) && yScales[attr](d[attr]) <= y1)
          if (selectedLines) {
            this.brushedData.add(d.party_id) // Add brushed lines
          }
          return selectedLines
        })
      }

      this.controller.applyBrushFromParallel(this.brushedData)
    }
  }

  // Hovering (call controller)
  // Make tooltip visible
  handleMouseOver (event, d) {
    const tooltip = d3.select('#tooltip')
      .style('visibility', 'visible')
      .html(`<b>${d.party}</b><br>${countries[d.country]} - ${factions[d.family]}<br>Votes: ${d.vote}%`)

    moveTooltip(event, tooltip)
    this.controller.applyHover(d.party_id)
  }

  // Move tooltip
  handleMouseMove (event) {
    moveTooltip(event, d3.select('#tooltip'))
  }

  // Hide tooltip
  handleMouseOut (d) {
    d3.select('#tooltip').style('visibility', 'hidden')
    this.controller.clearHover(d.party_id)
  }

  // Called by the controller to highlight the single point
  applyHover (id) {
    this.lines.filter(d => d.party_id === id)
      .each(function () {
        const line = d3.select(this)
        line.attr('original-class', line.attr('class')) // Take the line and save the current class
          .attr('class', 'line-hovered') // Change to hovered class
      })
      .raise()
  }

  clearHover (id) {
    this.lines.filter(d => d.party_id === id)
      .each(function () {
        const line = d3.select(this)
        const originalClass = line.attr('original-class')
        line.attr('class', originalClass) // Retrieve and apply the original class
        if (originalClass !== 'line-brushed') { // Only the brushed lines are kept raised
          line.lower()
        }
      })
  }

  // Called by the controller to color the lines
  applyBrush (selection) {
    if (!selection) {
      this.lines.attr('class', 'line')
      return
    }

    this.lines.filter(d => selection.has(d.party_id))
      .attr('class', 'line-brushed')
      .raise()

    this.lines.filter(d => !selection.has(d.party_id))
      .attr('class', 'line-deselected')
  }
}
