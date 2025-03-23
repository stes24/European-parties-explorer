import Chart from './chart.js'
import * as d3 from 'd3'
import { years, dropDownAttributes } from './../utils.js'

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
    const data = this.dataset.filter(d => d.country in this.countries && d.family in this.factions)

    const xScale = d3.scaleLinear()
      .domain([1999, 2024])
      .range([margin.left, this.width - margin.right])

    const yScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d[selectedAttribute]))
      .range([this.height - margin.bottom, margin.top])

    // How to generate the lines
    const line = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale(d[selectedAttribute]))

    // Draw lines
    // Group the data (one line = one party over the years), give each party to one line
    const gPaths = this.svg.append('g')
    const parties = d3.group(data, d => d.party_id)
    parties.forEach(party => {
      gPaths.append('path')
        .attr('class', 'line')
        .attr('d', line(party))
    })

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
}
