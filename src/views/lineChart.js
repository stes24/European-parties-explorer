import * as d3 from 'd3'
import dataset from '../../public/merged_dataset.csv'

export default class LineChart {
  plot () {
    const margin = { top: 20, right: 30, bottom: 30, left: 40 }
    const chartWidth = 600
    const chartHeight = 500

    // Element containing the chart
    const div = d3.select('#root')
    const svg = div.append('svg')
      // .attr('width', div.node().getBoundingClientRect().width)
      // .attr('height', div.node().getBoundingClientRect().height)
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .attr('viewBox', `0 0 ${chartWidth} ${chartHeight}`)

    const xScale = d3.scaleLinear()
      .domain(d3.extent(dataset, d => d.year))
      .range([margin.left, chartWidth - margin.right])

    const yScale = d3.scaleLinear()
      .domain(d3.extent(dataset, d => d.eu_position))
      .range([chartHeight - margin.bottom, margin.top])

    // How to generate the lines
    const line = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale(d.eu_position))

    // Draw lines
    // Group the data (one line = one party over the years), give each party to one line
    const parties = d3.group(dataset, d => d.party_id)
    parties.forEach(party => {
      svg.append('path')
        .attr('class', 'line')
        .attr('d', line(party))
    })

    const xAxis = d3.axisBottom(xScale)
      .ticks(7)
      .tickValues([1999, 2002, 2006, 2010, 2014, 2019, 2024])
    svg.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0, ${chartHeight - margin.bottom})`)
      .call(xAxis)

    const yAxis = d3.axisLeft(yScale)
    svg.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(yAxis)
  }
}
