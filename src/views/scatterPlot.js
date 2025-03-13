import Chart from './chart.js'
import * as d3 from 'd3'
import dataset from '../../public/merged_dataset_mds_2019.csv'

// Rememeber that Chart cointains this.containerDiv, this.svg, this.width, this.height
export default class ScatterPlot extends Chart {
  drawChart () {
    const margin = { top: 10, right: 12, bottom: 35, left: 45 }

    const xScale = d3.scaleLinear()
      .domain(d3.extent(dataset, d => d.mds1))
      .range([margin.left, this.width - margin.right])

    const yScale = d3.scaleLinear()
      .domain(d3.extent(dataset, d => d.mds2))
      .range([this.height - margin.bottom, margin.top])

    // Draw points
    this.svg.append('g')
      .selectAll('circle')
      .data(dataset)
      .enter()
      .append('circle')
      .attr('class', 'point')
      .attr('fill', d => colors[d.family])
      .attr('cx', d => xScale(d.mds1))
      .attr('cy', d => yScale(d.mds2))
      .attr('r', 4)

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

    this.svg.append('text')
      .attr('class', 'legend')
      .attr('transform', 'rotate(-90)')
      .attr('x', -this.height / 2)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .text('MDS dimension 2')
  }
}

const colors = { // Map (dictionary)
  1: 'black', 2: 'blue', 3: 'yellow', 4: 'white', 5: 'orange', 6: 'red', 7: 'green', 8: 'brown', 9: 'grey', 10: 'purple', 11: 'steelblue'
}
