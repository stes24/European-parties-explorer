import Chart from './chart.js'
import * as d3 from 'd3'
import { attributes, attributesExplanations, moveTooltip } from './../utils.js'

// Rememeber that Chart cointains containerDiv, svg, width, height, dataset, controller, year, countries, factions
export default class BoxPlot extends Chart {
  drawChart (brushedData = this.dataset) {
    this.svg.selectAll('*').remove() // Redraw when data is brushed

    const margin = { top: 15, bottom: 15 }
    const boxWidth = 35
    const axisOffset = 30
    const legendOffset = 55

    const usedAttributes = ['eu_position', 'immigrate_policy', 'sociallifestyle', 'environment']
    usedAttributes.forEach((attr, i) => {
      // Use selected filters
      const data = brushedData.filter(d => d.year === this.year && d.country in this.countries && d.family in this.factions)
        .map(d => d[attr])

      // Don't attempt to draw if no data
      if (data.length === 0) {
        return
      }

      // Adjust boxplots positions dinamically with respect to the div size
      const boxPosition = (this.width * i / 4) + this.width / 6

      // Box plot data
      const q1 = d3.quantile(data, 0.25)
      const median = d3.quantile(data, 0.5)
      const q3 = d3.quantile(data, 0.75)
      const min = d3.min(data)
      const max = d3.max(data)

      const domain = i === 0 ? [0, 7] : [0, 10]
      const yScale = d3.scaleLinear()
        .domain(domain)
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
      const axis = d3.axisLeft(yScale)
      if (i === 0) {
        axis.ticks(7)
      }

      this.svg.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(${boxPosition - axisOffset}, 0)`)
        .call(axis)

      // y axis legend
      this.svg.append('text')
        .attr('class', 'legend')
        .attr('transform', 'rotate(-90)')
        .attr('x', -this.height / 2)
        .attr('y', boxPosition - legendOffset)
        .attr('text-anchor', 'middle')
        .text(attributes[attr])
        .attr('attr', attr) // Needed for tooltip
    })

    d3.select(this.containerDiv).selectAll('.legend') // Handle hovering on legend
      .on('mouseover', (event) => this.handleMouseOver(event))
      .on('mousemove', (event) => this.handleMouseMove(event))
      .on('mouseout', () => this.handleMouseOut())
  }

  // Make tooltip visible
  handleMouseOver (event) {
    const attr = d3.select(event.target).attr('attr')
    const tooltip = d3.select('#tooltip')
      .style('visibility', 'visible')
      .html(`${attributesExplanations[attr]}`)

    moveTooltip(event, tooltip)
  }

  // Move tooltip
  handleMouseMove (event) {
    moveTooltip(event, d3.select('#tooltip'))
  }

  // Hide tooltip
  handleMouseOut () {
    d3.select('#tooltip').style('visibility', 'hidden')
  }

  // Called by the controller to update the boxplots according to the brushed data
  applyBrush (selection) {
    if (!selection) {
      this.drawChart(this.dataset)
      return
    }

    // Filter the data and redraw
    const filteredData = this.dataset.filter(d => selection.has(d.party_id))
    this.drawChart(filteredData)
  }
}
