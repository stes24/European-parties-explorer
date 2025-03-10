import * as d3 from 'd3'
import dataset from '../../public/merged_dataset_mds_2019.csv'

export default class ScatterPlot {
  plot () {
    const margin = { top: 20, right: 30, bottom: 30, left: 40 }
    const chartWidth = 500
    const chartHeight = 400

    // Element containing the chart
    const div = d3.select('#root')
    const svg = div.append('svg')
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .attr('viewBox', `0 0 ${chartWidth} ${chartHeight}`)

    const xScale = d3.scaleLinear()
      .domain(d3.extent(dataset, d => d.mds1))
      .range([margin.left, chartWidth - margin.right])

    const yScale = d3.scaleLinear()
      .domain(d3.extent(dataset, d => d.mds2))
      .range([chartHeight - margin.bottom, margin.top])

    // Draw points
    svg.append('g')
      .selectAll('circle')
      .data(dataset)
      .enter()
      .append('circle')
      .attr('class', 'point')
      .attr('cx', d => xScale(d.mds1))
      .attr('cy', d => yScale(d.mds2))
      .attr('r', 4)

    // x axis
    svg.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0, ${chartHeight - margin.bottom})`)
      .call(d3.axisBottom(xScale))

    // y axis
    svg.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale))
  }
}
