import Chart from './chart.js'
import * as d3 from 'd3'
import { years, dropDownAttributes, countries, factions, moveTooltip } from './../utils.js'

// Rememeber that Chart cointains containerDiv, svg, width, height, dataset, controller, year, countries, factions
export default class LineChart extends Chart {
  constructor (...args) {
    super(...args)
    this.selectedAttribute = 'vote'
  }

  drawChart (selectedAttribute = this.selectedAttribute) { // Default attribute
    this.svg.selectAll('*').remove() // Redraw when a new attribute is selected

    const margin = { top: 35, right: 25, bottom: 40, left: 35 }
    this.selectedAttribute = selectedAttribute

    // Use selected filters
    const partiesToDraw = new Set( // Draw the whole line if a party respects all filters in the selected year, even if in the other years it doesn't
      this.dataset.filter(d => d.year === this.year && d.country in this.countries && d.family in this.factions)
        .map(d => d.party_id)
    )
    const data = this.dataset.filter(d => partiesToDraw.has(d.party_id))

    const xScale = d3.scaleLinear()
      .domain([1999, 2024])
      .range([margin.left, this.width - margin.right])

    const yScale = d3.scaleLinear().range([this.height - margin.bottom, margin.top])
    if (selectedAttribute === 'vote' || selectedAttribute === 'seat' || selectedAttribute === 'epvote') {
      yScale.domain(d3.extent(data, d => d[selectedAttribute]))
    } else if (selectedAttribute === 'eu_position' || selectedAttribute === 'eu_intmark' || selectedAttribute === 'eu_foreign') {
      yScale.domain([1, 7])
    } else {
      yScale.domain([0, 10])
    }

    // How to generate the lines
    const line = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale(d[selectedAttribute]))
      .defined(d => d[selectedAttribute] !== null) // Correctly draw lines starting from a later year

    // Draw lines
    // Group the data (one line = one party over the years), give each party to one line
    const gPaths = this.svg.append('g')
    const parties = d3.group(data, d => d.party_id) // A dictionary -> id - array of dictionaries (one for each year)
    parties.forEach((party, partyId) => {
      if (party.length > 1) { // Party with at least two years -> a line
        const d = data.find(d => d.party_id === partyId && d.year === this.year) // Use the statistics for the current year
        gPaths.append('path')
          .attr('class', 'line')
          .attr('d', line(party))
          .attr('party-id', partyId)
          .on('mouseover', (event) => this.handleMouseOver(event, d)) // Handle hovering
          .on('mousemove', (event) => this.handleMouseMove(event))
          .on('mouseout', () => this.handleMouseOut(d))
      } else { // Party with only one year -> a point
        const d = party[0]
        gPaths.append('circle')
          .attr('class', 'point')
          .attr('cx', xScale(d.year))
          .attr('cy', yScale(d[selectedAttribute]))
          .attr('r', 4) // Dimensione del punto
          .attr('fill', 'steelblue')
          .attr('party-id', partyId)
          .on('mouseover', (event) => this.handleMouseOver(event, d))
          .on('mousemove', (event) => this.handleMouseMove(event))
          .on('mouseout', () => this.handleMouseOut(d))
      }
    })

    console.log(parties)

    // x axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(7)
      .tickValues(years)
    this.svg.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0, ${this.height - margin.bottom})`)
      .call(xAxis)

    // y axis
    const yAxis = d3.axisLeft(yScale)
    this.svg.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(yAxis)

    // x axis legend
    this.svg.append('text')
      .attr('class', 'legend')
      .attr('x', this.width / 2)
      .attr('y', this.height - 8)
      .attr('text-anchor', 'middle')
      .text('Year')

    // Create new drop-down menu
    d3.select(this.containerDiv).select('.dropdown').remove()
    const dropdown = d3.select(this.containerDiv)
      .append('select')
      .attr('class', 'dropdown')
      .style('position', 'absolute')
      .style('left', `${this.containerDiv.getBoundingClientRect().left + margin.left - 20}px`)
      .style('top', `${this.containerDiv.getBoundingClientRect().top + margin.top - 25}px`)

    // Add options
    dropdown.selectAll('option')
      .data(Object.keys(dropDownAttributes))
      .enter()
      .append('option')
      .attr('value', d => d)
      .text(d => dropDownAttributes[d])

    dropdown.property('value', this.selectedAttribute)

    // Change plotted attribute
    dropdown.on('change', (event) => {
      this.drawChart(event.target.value)
    })
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

  // Called by the controller to highlight the single line or point
  applyHover (id) {
    this.svg.selectAll('path')
      .each(function () {
        const line = d3.select(this)

        if (Number(line.attr('party-id')) === id) {
          line.attr('original-class', line.attr('class')) // Take the line and save the current class
            .attr('class', 'line-hovered') // Change to hovered class
            .raise()
        }
      })

    this.svg.selectAll('circle')
      .each(function () {
        const point = d3.select(this)

        if (Number(point.attr('party-id')) === id) {
          point.attr('original-class', point.attr('class')) // Take the point and save the current class
            .attr('fill', '#CCCCCC') // Directly change fill
            .raise()
        }
      })
  }

  clearHover (id) {
    this.svg.selectAll('path')
      .each(function () {
        const line = d3.select(this)

        if (Number(line.attr('party-id')) === id) {
          const originalClass = line.attr('original-class')
          line.attr('class', originalClass) // Retrieve and apply the original class
          if (originalClass !== 'line-brushed') { // Only the brushed lines are kept raised
            line.lower()
          }
        }
      })

    this.svg.selectAll('circle')
      .each(function () {
        const point = d3.select(this)

        if (Number(point.attr('party-id')) === id) {
          const originalClass = point.attr('original-class')
          point.attr('fill', 'steelblue') // Directly change fill back
          if (originalClass !== 'point-brushed') { // Only the brushed points are kept raised
            point.lower()
          }
        }
      })
  }

  // Called by the controller to color lines or points
  applyBrush (selection) {
    const lines = this.svg.selectAll('path')
    const points = this.svg.selectAll('circle')

    if (!selection) {
      lines.attr('class', 'line')
      points.attr('class', 'point')
      return
    }

    lines.each(function () {
      const line = d3.select(this)

      if (selection.has(Number(line.attr('party-id')))) {
        line.attr('class', 'line-brushed').raise()
      } else {
        line.attr('class', 'line')
      }
    })

    points.each(function () {
      const point = d3.select(this)

      if (selection.has(Number(point.attr('party-id')))) {
        point.attr('class', 'point-brushed').raise()
      } else {
        point.attr('class', 'point')
      }
    })
  }
}
