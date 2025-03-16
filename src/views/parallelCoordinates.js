import Chart from './chart.js'
import * as d3 from 'd3'
import { attributes } from './../utils.js'

// Rememeber that Chart cointains containerDiv, svg, width, height, dataset, controller, year, countries, factions
export default class ParallelCoordinates extends Chart {
  constructor (...args) {
    super(...args)
    this.brushedData = new Set()
    this.lines = null
  }

  drawChart () {
    const margin = { top: 35, right: 30, bottom: 10, left: 30 }

    // Use selected filters
    const data = this.dataset.filter(d => d.year === this.year && d.country in this.countries && d.family in this.factions)

    const xScale = d3.scalePoint()
      .domain(attributes)
      .range([margin.left, this.width - margin.right])

    // Define more y scales, one for each attribute
    const yScales = {} // Will be a map
    attributes.forEach(attr => {
      if (attr === 'family') {
        yScales[attr] = d3.scaleLinear() // Key (attribute) -> will find value (scale associated to that attribute)
          .domain([0, 11])
          .range([this.height - margin.bottom, margin.top])
      } else if (attr === 'eu_position' || attr === 'eu_intmark' || attr === 'eu_foreign') {
        yScales[attr] = d3.scaleLinear() // Key (attribute) -> will find value (scale associated to that attribute)
          .domain([0, 7])
          .range([this.height - margin.bottom, margin.top])
      } else {
        yScales[attr] = d3.scaleLinear() // Key (attribute) -> will find value (scale associated to that attribute)
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
      .attr('d', d => line(attributes.map(attr => [attr, d[attr]])))
      // For each datum, create [attr, value] and give it to line (it connects the values of different attributes)

    // For adding and removing brushes
    const activeBrushes = {}

    // y axis
    this.svg.selectAll('axis') // Vertical axis to be inserted
      .data(attributes) // Bind one attribute to each axis
      .enter()
      .append('g')
      .attr('class', 'axis')
      .attr('transform', d => `translate(${xScale(d)}, 0)`) // Each attribute positions the corresponding axis
      .each(function (d) { // Find corresponding scale, call axis like normally except many times
        d3.select(this)
          .call(d3.axisLeft(yScales[d])) // Create axis

          .call(d3.brushY() // Create brush for each axis
            .extent([[-12, yScales[d].range()[1]], [12, yScales[d].range()[0]]])
            .on('start brush end', ({ selection }) => {
              if (selection) {
                activeBrushes[d] = selection // Add brush to the set of brushes
              } else {
                delete activeBrushes[d] // Brush deleted
              }
              colorLines() // Tell the controller how to color lines
            })
          )
      })
      .append('text') // Text operations
      .attr('transform', 'rotate(-10)')
      .attr('y', margin.top - 15)
      .attr('text-anchor', 'middle')
      .text(d => d)

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
