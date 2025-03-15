import Chart from './chart.js'
import * as d3 from 'd3'

// Rememeber that Chart cointains containerDiv, svg, width, height, dataset, controller, year, countries, factions
export default class ScatterPlot extends Chart {
  drawChart () {
    const margin = { top: 10, right: 12, bottom: 35, left: 45 }

    // Use selected filters
    const data = this.dataset.filter(d => d.year === this.year && d.country in this.countries && d.family in this.factions)

    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.mds1))
      .range([margin.left, this.width - margin.right])

    const yScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.mds2))
      .range([this.height - margin.bottom, margin.top])

    // Draw points
    const brushableArea = this.svg.append('g')
    const points = brushableArea.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'point')
      .attr('fill', d => colors[d.family])
      .attr('cx', d => xScale(d.mds1))
      .attr('cy', d => yScale(d.mds2))
      .attr('r', d => d.vote * 0.4)

    // x axis
    this.svg.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0, ${this.height - margin.bottom})`)
      .call(d3.axisBottom(xScale))

    // y axis
    this.svg.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale))

    // x axis legend
    this.svg.append('text')
      .attr('class', 'legend')
      .attr('x', this.width / 2)
      .attr('y', this.height - 5)
      .attr('text-anchor', 'middle')
      .text('MDS dimension 1')

    // y axis legend
    this.svg.append('text')
      .attr('class', 'legend')
      .attr('transform', 'rotate(-90)')
      .attr('x', -this.height / 2)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .text('MDS dimension 2')

    // Brush
    brushableArea.call(d3.brush()
      .extent([[xScale.range()[0], yScale.range()[1]], [xScale.range()[1], yScale.range()[0]]])
      .on('start brush end', ({ selection }) => {
        if (selection) {
          const [[x0, y0], [x1, y1]] = selection
          points.style('stroke', 'gray') // Gray stroke for points outside the brush
            .filter(d => x0 <= xScale(d.mds1) && xScale(d.mds1) <= x1 && y0 <= yScale(d.mds2) && yScale(d.mds2) <= y1)
            .style('stroke', 'red') // Red stroke for points inside the brush
        } else {
          points.style('stroke', 'steelblue') // Return to blue if brush is deleted
        }
      })
    )
  }
}

const colors = { // Map (dictionary)
  1: 'black', 2: 'blue', 3: 'yellow', 4: 'white', 5: 'orange', 6: 'red', 7: 'green', 8: 'brown', 9: 'grey', 10: 'purple', 11: 'steelblue'
}
