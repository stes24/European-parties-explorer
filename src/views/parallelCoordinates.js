import * as d3 from 'd3'
import dataset from '../../public/merged_dataset.csv'

export default class ParallelCoordinates {
  plot () {
    const attributes = ['family', 'eu_position', 'lrecon', 'environment']

    const margin = { top: 20, right: 30, bottom: 30, left: 40 }
    const chartWidth = 600
    const chartHeight = 500

    // Temporarily show data from 2019
    const data2019 = dataset.filter(d => d.year === 2019)

    // Element containing the chart
    const div = d3.select('#root')
    const svg = div.append('svg')
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .attr('viewBox', `0 0 ${chartWidth} ${chartHeight}`)

    const xScale = d3.scalePoint()
      .domain(attributes)
      .range([margin.left, chartWidth - margin.right])

    // Define more scales, one for each attribute
    const yScales = {}
    attributes.forEach(attr => {
      yScales[attr] = d3.scaleLinear() // Attributes will be used to find corresponding scale
        .domain(d3.extent(data2019, d => d[attr]))
        .range([chartHeight - margin.bottom, margin.top])
    })

    // How to generate the lines
    const line = d3.line()
      .defined(d => !isNaN(d[1])) // Ignore invalid values
      .x(d => xScale(d[0])) // d = [attribute name, value]
      .y(d => yScales[d[0]](d[1])) // Find right scale with attribute, then find the value

    // Draw lines
    svg.selectAll('path')
      .data(data2019)
      .enter()
      .append('path')
      .attr('class', 'line')
      .attr('d', d => line(attributes.map(attr => [attr, d[attr]])))
      // For each datum, create [attr, value] and give it to line (it connects the values of different attributes)

    svg.selectAll('axis') // Vertical axis to be inserted
      .data(attributes) // Bind one attribute to each axis
      .enter()
      .append('g')
      .attr('class', 'axis')
      .attr('transform', d => `translate(${xScale(d)}, 0)`) // Each attribute positions the corresponding axis
      .each(function (d) { d3.select(this).call(d3.axisLeft(yScales[d])) }) // Find corresponding scale, call axis like normally except many times
      .append('text') // Text operations
      .attr('y', margin.top - 10)
      .attr('text-anchor', 'middle')
      .text(d => d)
  }
}
