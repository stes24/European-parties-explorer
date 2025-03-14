import Chart from './chart.js'
import * as d3 from 'd3'
import dataset from '../../public/merged_dataset.csv'
import { attributes } from '../utils.js'

// Rememeber that Chart cointains this.containerDiv, this.svg, this.width, this.height
export default class ParallelCoordinates extends Chart {
  constructor (containerDiv, controller) {
    super(containerDiv, controller)
    this.year = 2024 // Default year
  }

  drawChart () {
    const margin = { top: 35, right: 30, bottom: 10, left: 30 }

    // Use selected year
    const data = dataset.filter(d => d.year === this.year)

    const xScale = d3.scalePoint()
      .domain(attributes)
      .range([margin.left, this.width - margin.right])

    // Define more y scales, one for each attribute
    const yScales = {} // Will be a map
    attributes.forEach(attr => {
      yScales[attr] = d3.scaleLinear() // Key (attribute) -> will find value (scale associated to that attribute)
        .domain(d3.extent(data, d => d[attr]))
        .range([this.height - margin.bottom, margin.top])
    })

    // How to generate the lines
    const line = d3.line()
      .defined(d => !isNaN(d[1])) // Ignore invalid values
      .x(d => xScale(d[0])) // d = [attribute name, value]
      .y(d => yScales[d[0]](d[1])) // Find right scale with attribute, then find value in the scale

    // Draw lines
    this.svg.append('g')
      .selectAll('path')
      .data(data)
      .enter()
      .append('path')
      .attr('class', 'line')
      .attr('d', d => line(attributes.map(attr => [attr, d[attr]])))
      // For each datum, create [attr, value] and give it to line (it connects the values of different attributes)

    // y axis
    this.svg.selectAll('axis') // Vertical axis to be inserted
      .data(attributes) // Bind one attribute to each axis
      .enter()
      .append('g')
      .attr('class', 'axis')
      .attr('transform', d => `translate(${xScale(d)}, 0)`) // Each attribute positions the corresponding axis
      .each(function (d) { d3.select(this).call(d3.axisLeft(yScales[d])) }) // Find corresponding scale, call axis like normally except many times
      .append('text') // Text operations
      .attr('transform', 'rotate(-10)')
      .attr('y', margin.top - 15)
      .attr('text-anchor', 'middle')
      .text(d => d)
  }

  updateYear (year) {
    this.year = year
    this.svg.selectAll('*').remove()
    this.drawChart()
  }
}
