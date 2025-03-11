import Chart from './chart.js'
import * as d3 from 'd3'
import dataset from '../../public/merged_dataset.csv'

// Rememeber that Chart cointains this.containerDiv, this.svg, this.width, this.height
export default class LineChart extends Chart {
  drawChart () {
    const margin = { top: 20, right: 30, bottom: 30, left: 40 }

    const xScale = d3.scaleLinear()
      .domain(d3.extent(dataset, d => d.year))
      .range([margin.left, this.width - margin.right])

    const yScale = d3.scaleLinear()
      .domain(d3.extent(dataset, d => d.eu_position))
      .range([this.height - margin.bottom, margin.top])

    // How to generate the lines
    const line = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale(d.eu_position))

    // Draw lines
    // Group the data (one line = one party over the years), give each party to one line
    const gPaths = this.svg.append('g')
    const parties = d3.group(dataset, d => d.party_id)
    parties.forEach(party => {
      gPaths.append('path')
        .attr('class', 'line')
        .attr('d', line(party))
    })

    // x axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(7)
      .tickValues([1999, 2002, 2006, 2010, 2014, 2019, 2024])
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
