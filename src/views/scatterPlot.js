import Chart from './chart.js'
import * as d3 from 'd3'

// Rememeber that Chart cointains containerDiv, svg, width, height, dataset, controller, year, countries, factions
export default class ScatterPlot extends Chart {
  constructor (...args) {
    super(...args)
    this.brushedData = new Set()
  }

  drawChart () {
    const margin = { top: 10, right: 12, bottom: 40, left: 45 }

    // Use selected filters
    const data = this.dataset.filter(d => d.year === this.year && d.country in this.countries && d.family in this.factions)

    const xScale = d3.scaleLinear()
      .domain(d3.extent(this.dataset, d => d.mds1))
      .range([margin.left, this.width - margin.right])

    const yScale = d3.scaleLinear()
      .domain(d3.extent(this.dataset, d => d.mds2))
      .range([this.height - margin.bottom, margin.top])

    // How to compute radius
    const radius = d3.scaleSqrt()
      .domain([d3.min(this.dataset, d => d.vote), d3.max(this.dataset, d => d.vote)])
      .range([2, 30])

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
      .attr('r', d => radius(d.vote))

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
      .attr('y', this.height - 8)
      .attr('text-anchor', 'middle')
      .text('MDS dimension 1')

    // y axis legend
    this.svg.append('text')
      .attr('class', 'legend')
      .attr('transform', 'rotate(-90)')
      .attr('x', -this.height / 2)
      .attr('y', 17)
      .attr('text-anchor', 'middle')
      .text('MDS dimension 2')

    // Brush
    brushableArea.call(d3.brush()
      .extent([[xScale.range()[0], yScale.range()[1]], [xScale.range()[1], yScale.range()[0]]])
      .on('start brush end', ({ selection }) => {
        this.brushedData.clear()

        if (selection) {
          const [[x0, y0], [x1, y1]] = selection
          points.filter(d => {
            const selectedPoints = x0 <= xScale(d.mds1) && xScale(d.mds1) <= x1 && y0 <= yScale(d.mds2) && yScale(d.mds2) <= y1
            if (selectedPoints) {
              this.brushedData.add(d.party_id) // Add brushed points
              brushableArea.select('.selection')
                .attr('opacity', 0.4)
                .attr('stroke-width', '2px')
            }
            return selectedPoints
          })
        }

        this.controller.applyBrushFromScatter(this.brushedData)
      })
    )
  }

  // Called by the controller to color the points
  applyBrush (selection) {
    if (!selection) {
      this.svg.selectAll('circle')
        .attr('class', 'point')
      return
    }

    this.svg.selectAll('circle')
      .attr('class', d => selection.has(d.party_id) ? 'point-brushed' : 'point-deselected')
  }
}

const colors = { // Map (dictionary)
  1: 'black', 2: 'blue', 3: 'yellow', 4: 'white', 5: 'orange', 6: 'red', 7: 'green', 8: 'brown', 9: 'grey', 10: 'purple', 11: 'steelblue'
}
