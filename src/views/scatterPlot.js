import Chart from './chart.js'
import * as d3 from 'd3'
import { factions, countries } from './../utils.js'

// Rememeber that Chart cointains containerDiv, svg, width, height, dataset, controller, year, countries, factions
export default class ScatterPlot extends Chart {
  constructor (...args) {
    super(...args)
    this.brushedData = new Set()
    this.mode = 'zoom'
  }

  drawChart () {
    const margin = { top: 30, right: 12, bottom: 40, left: 45 }

    this.containerDiv.style.position = 'relative' // To position selection menu correctly

    // Zoom/select menu
    d3.select(this.containerDiv).append('div')
      .html(`
        <label>Type of interaction:</label>
        <input type="radio" name="mode" value="zoom" checked> zoom, move and hover
        <input type="radio" name="mode" value="select"> select
      `)
      .style('color', '#CCCCCC')
      .style('font-size', '13px')
      .style('position', 'absolute')
      .style('left', `${margin.left - 40}px`)
      .style('top', `${margin.top - 28}px`)
      .on('change', (event) => { this.toggleMode(event) })

    // Use selected filters
    const data = this.dataset.filter(d => d.year === this.year && d.country in this.countries && d.family in this.factions)

    this.xScale = d3.scaleLinear()
      .domain([d3.min(this.dataset, d => d.mds1 - 1), d3.max(this.dataset, d => d.mds1 + 1)])
      .range([margin.left, this.width - margin.right])

    this.yScale = d3.scaleLinear()
      .domain([d3.min(this.dataset, d => d.mds1 - 0.5), d3.max(this.dataset, d => d.mds1 + 0.5)])
      .range([this.height - margin.bottom, margin.top])

    // How to compute radius
    const radius = d3.scaleSqrt()
      .domain([d3.min(this.dataset, d => d.vote), d3.max(this.dataset, d => d.vote)])
      .range([3.5, 40])

    // Area where to draw and brush
    this.brushableArea = this.svg.append('g')

    // Draw points
    this.points = this.brushableArea.selectAll('circle')
      .data(data.sort((a, b) => d3.descending(a.vote, b.vote))) // Bigger circles on the background
      .enter()
      .append('circle')
      .attr('class', 'point')
      .attr('fill', d => colors[d.family])
      .attr('cx', d => this.xScale(d.mds1))
      .attr('cy', d => this.yScale(d.mds2))
      .attr('r', d => radius(d.vote))
      .on('mouseover', (event, d) => this.handleMouseover(event, d)) // Handle hovering
      .on('mousemove', (event) => this.handleMouseMove(event))
      .on('mouseout', () => this.handleMouseOut())

    this.xAxisGenerator = d3.axisBottom(this.xScale)
    this.yAxisGenerator = d3.axisLeft(this.yScale)

    // x axis
    this.xAxis = this.svg.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0, ${this.height - margin.bottom})`)
      .call(this.xAxisGenerator)

    // y axis
    this.yAxis = this.svg.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(this.yAxisGenerator)

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
    this.brush = d3.brush()
      .extent([[this.xScale.range()[0], this.yScale.range()[1]], [this.xScale.range()[1], this.yScale.range()[0]]])
      .on('start brush end', ({ selection }) => this.handleBrush(selection, this.xScale, this.yScale))
  }

  // Zoom or brush
  toggleMode (event) {
    this.mode = event.target.value

    /* if (this.mode === 'zoom') {
      // this.brushableArea.call(d3.brush().clear) // Remove brush
      this.brushableArea.call(this.brush.move, null)
      this.brushableArea.on('.brush', null) // Disabilita brushing
      this.brushableArea.select('rect').call(this.zoom);
    } else {
      this.brushableArea.select('rect').on('.zoom', null);
      this.brushableArea.call(this.brush) // Enable brush
    } */
  }

  // Hovering (call controller)
  handleMouseover (event, d) {
    d3.select('#tooltip')
      .style('visibility', 'visible')
      .html(`<b>${d.party}</b><br>${countries[d.country]} - ${factions[d.family]}<br>Votes: ${d.vote}%`)
      .style('left', `${event.pageX + 10}px`)
      .style('top', `${event.pageY + 10}px`)

    this.controller.hover(d.party_id)
  }

  handleMouseMove (event) {
    d3.select('#tooltip')
      .style('left', `${event.pageX + 10}px`)
      .style('top', `${event.pageY + 10}px`)
  }

  handleMouseOut () {
    d3.select('#tooltip').style('visibility', 'hidden')
    this.controller.clearHover()
  }

  // Brushing (call controller)
  handleBrush (selection, xScale, yScale) {
    this.brushedData.clear()

    if (selection) {
      const [[x0, y0], [x1, y1]] = selection
      this.points.filter(d => {
        const selectedPoints = x0 <= xScale(d.mds1) && xScale(d.mds1) <= x1 && y0 <= yScale(d.mds2) && yScale(d.mds2) <= y1
        if (selectedPoints) {
          this.brushedData.add(d.party_id) // Add brushed points
        }
        return selectedPoints
      })
    }

    this.controller.applyBrushFromScatter(this.brushedData)
  }

  // Called by the controller to highlight the single point
  hover (id) {
    this.svg.selectAll('circle')
      .filter(d => d.party_id === id)
      .attr('fill', 'red')
      .style('stroke', 'orange')
    console.log('Hover', id)
  }

  clearHover () {
    this.svg.selectAll('circle')
      .attr('fill', d => colors[d.family])
      .style('stroke', 'black')
    console.log('Clear')
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

const colors = { // Map (dictionary) - Colors from ColorBrewer
  1: '#1f78b4', 2: '#a6cee3', 3: '#cab2d6', 4: '#6a3d9a', 5: '#fb9a99', 6: '#e31a1c', 7: '#33a02c', 8: '#ff7f00', 9: '#ffff99', 10: '#fdbf6f', 11: '#b2df8a'
}
