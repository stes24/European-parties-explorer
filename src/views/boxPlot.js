import Chart from './chart.js'
import * as d3 from 'd3'
import { attributes, attributesExplanations, moveTooltip } from './../utils.js'

// Remember that Chart cointains containerDiv, svg, width, height, dataset, controller, year, countries, factions
export default class BoxPlot extends Chart {
  drawChart (brushedData = this.dataset) {
    this.svg.selectAll('*').remove() // Redraw when data is brushed

    const margin = { top: 12, bottom: 25 }
    const boxWidth = 35
    const axisOffset = 30
    const legendOffset = 55

    const usedAttributes = ['eu_position', 'immigrate_policy', 'sociallifestyle', 'environment']
    const data = brushedData.filter(d => d.year === this.year && d.country in this.countries && d.family in this.factions)

    // Create row for number of parties
    d3.select('#count').remove()
    const countRow = d3.select(this.containerDiv)
      .append('div')
      .attr('id', 'count')
      .style('position', 'absolute')
      .style('display', 'flex')
      .style('gap', '5px')
      .style('left', `${this.containerDiv.getBoundingClientRect().left + this.width / 4}px`)
      .style('top', `${this.containerDiv.getBoundingClientRect().bottom - margin.bottom}px`)

    countRow.append('label')
      .attr('class', 'text-label')
      .text('Number of selected parties: ' + data.length)

    usedAttributes.forEach((attr, i) => {
      // Use selected filters
      const attrData = data.map(d => d[attr])

      // Don't attempt to draw if there are no parties or the attribute is not evaluated in the selected year
      if (attrData.length === 0 || attrData.every(function (a) { return a === null })) {
        return
      }

      // Adjust boxplots positions dinamically with respect to the div size
      const boxPosition = (this.width * i / 4) + this.width / 6

      // Box plot data
      const q1 = d3.quantile(attrData, 0.25)
      const median = d3.quantile(attrData, 0.5)
      const q3 = d3.quantile(attrData, 0.75)
      const min = d3.min(attrData)
      const max = d3.max(attrData)

      const domain = i === 0 ? [1, 7] : [0, 10]
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
