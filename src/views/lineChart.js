import Chart from './chart.js'
import * as d3 from 'd3'
import { years } from './../utils.js'

// Rememeber that Chart cointains containerDiv, svg, width, height, dataset, controller, year, countries, factions
export default class LineChart extends Chart {
  drawChart () {
    const margin = { top: 10, right: 25, bottom: 25, left: 35 }

    const xScale = d3.scaleLinear()
      .domain(d3.extent(this.dataset, d => d.year))
      .range([margin.left, this.width - margin.right])

    const yScale = d3.scaleLinear()
      .domain(d3.extent(this.dataset, d => d.eu_position))
      .range([this.height - margin.bottom, margin.top])

    // How to generate the lines
    const line = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale(d.eu_position))

    // Draw lines
    // Group the data (one line = one party over the years), give each party to one line
    const gPaths = this.svg.append('g')
    const parties = d3.group(this.dataset, d => d.party_id)
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
  }
}
