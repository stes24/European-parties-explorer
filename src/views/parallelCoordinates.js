import * as d3 from 'd3'
import dataset from '../../public/merged_dataset.csv'

export default class ParallelCoordinates {
  plot () {
    const dimensions = ['family', 'eu_position', 'lrecon', 'environment']

    const margin = { top: 20, right: 30, bottom: 30, left: 40 }
    const chartWidth = 1200
    const chartHeight = 800

    const data = dataset.filter(d => d.year === 2019)

    const svg = d3.select('#root').append('svg')
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .attr('viewBox', `0 0 ${chartWidth} ${chartHeight}`)

    const xScale = d3.scalePoint()
      .domain(dimensions)
      .range([margin.left, chartWidth - margin.right])

    const yScales = {}
    dimensions.forEach(dim => {
      yScales[dim] = d3.scaleLinear()
        .domain(d3.extent(data, d => d[dim]))
        .range([chartHeight - margin.bottom, margin.top])
    })

    const line = d3.line()
      .defined(d => !isNaN(d[1]))
      .x(d => xScale(d[0]))
      .y(d => yScales[d[0]](d[1]))

    svg.selectAll('path')
      .data(data)
      .enter()
      .append('path')
      .attr('class', 'line')
      .attr('d', d => line(dimensions.map(dim => [dim, d[dim]])))

    svg.selectAll('g.axis')
      .data(dimensions)
      .enter().append('g')
      .attr('class', 'axis')
      .attr('transform', d => `translate(${xScale(d)},0)`)
      .each(function (d) { d3.select(this).call(d3.axisLeft(yScales[d])) })
      .append('text')
      .attr('y', margin.top - 10)
      .attr('text-anchor', 'middle')
      .text(d => d)
  }
}
