import * as d3 from 'd3'

export default class Chart {
  // Save cointaining div and svg dimensions
  constructor (containerDiv) {
    this.containerDiv = containerDiv
    this.svg = null
    this.width = 0
    this.height = 0

    if (this.constructor === Chart) {
      throw new Error("Class is of abstract type and can't be instantiated")
    }
  }

  // Operations on create
  initialize () {
    this.updateDimensions()

    // Create svg
    this.svg = d3.select(this.containerDiv)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('viewBox', `0 0 ${this.width} ${this.height}`)

    window.addEventListener('resize', () => this.resize())

    this.drawChart()
  }

  // Retrieve width and height to use for the svg
  updateDimensions () {
    this.width = this.containerDiv.clientWidth
    this.height = this.containerDiv.clientHeight
  }

  // Operations on windows resize
  resize () {
    this.updateDimensions()

    this.svg
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('viewBox', `0 0 ${this.width} ${this.height}`)
    this.svg.selectAll('*').remove()
    this.drawChart()
  }

  // To be implemented by the extending class
  drawChart () {
  }
}
