import Chart from './chart.js'
import * as d3 from 'd3'

// Rememeber that Chart cointains containerDiv, svg, width, height, dataset, controller, year, countries, factions
export default class BoxPlot extends Chart {
  drawChart () {
    const margin = { top: 20, right: 10, bottom: 20, left: 50 }
    const boxWidth = 50
    const boxPosition = 90
    const axisOffset = 40
    const legendOffset = 65

    // Use selected filters
    const data = this.dataset.filter(d => d.year === this.year && d.country in this.countries && d.family in this.factions)
      .map(d => d.eu_position)

    const q1 = d3.quantile(data, 0.25)
    const median = d3.quantile(data, 0.5)
    const q3 = d3.quantile(data, 0.75)
    const min = d3.min(data)
    const max = d3.max(data)

    const yScale = d3.scaleLinear()
      .domain([0, 10])
      .range([this.height - margin.bottom, margin.top])

    // Vertical line
    this.svg.append('line')
      .attr('class', 'boxplot-line')
      .attr('x1', boxPosition)
      .attr('x2', boxPosition)
      .attr('y1', yScale(min))
      .attr('y2', yScale(max))

    // Box
    this.svg.append('rect')
      .attr('x', boxPosition - boxWidth / 2)
      .attr('y', yScale(q3))
      .attr('width', boxWidth)
      .attr('height', yScale(q1) - yScale(q3))
      .attr('stroke', '#CCCCCC')
      .attr('stroke-width', '2px')
      .attr('fill', 'steelblue')

    // Horizontal lines (min, median, max)
    this.svg.selectAll('horizontalLines')
      .data([min, median, max])
      .enter()
      .append('line')
      .attr('class', 'boxplot-line')
      .attr('x1', boxPosition - boxWidth / 2)
      .attr('x2', boxPosition + boxWidth / 2)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))

    // y axis
    this.svg.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(${boxPosition - axisOffset}, 0)`)
      .call(d3.axisLeft(yScale))

    // y axis legend
    this.svg.append('text')
      .attr('class', 'legend')
      .attr('transform', 'rotate(-90)')
      .attr('x', -this.height / 2)
      .attr('y', boxPosition - legendOffset)
      .attr('text-anchor', 'middle')
      .text('European Union')
  }
}
