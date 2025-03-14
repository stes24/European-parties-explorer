import * as d3 from 'd3'
import { countries, factions } from './../utils.js'

export default class Chart {
  // Save cointaining div and svg dimensions
  constructor (containerDiv, dataset, controller) {
    this.containerDiv = containerDiv
    this.svg = null
    this.width = 0
    this.height = 0

    this.dataset = dataset
    this.controller = controller

    // Default filters
    this.year = 2024
    this.countries = countries
    this.factions = factions

    if (this.constructor === Chart) {
      throw new Error("Class is of abstract type and can't be instantiated")
    }
  }

  // Operations on create
  initialize () {
    setTimeout(() => { // Needed to wait for containerDiv complete rendering - computes correct width/height
      this.updateDimensions()

      // Create svg
      this.svg = d3.select(this.containerDiv)
        .append('svg')
        .attr('width', this.width)
        .attr('height', this.height)
        .attr('viewBox', `0 0 ${this.width} ${this.height}`)

      window.addEventListener('resize', () => this.resize())

      this.drawChart()
    }, 0)
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

  // Filter updates
  updateYear (year) {
    this.year = year
    this.svg.selectAll('*').remove()
    this.drawChart()
  }

  addCountry (id, name) {
    this.countries[id] = name
    this.svg.selectAll('*').remove()
    this.drawChart()
  }

  removeCountry (id) {
    delete this.countries[id]
    this.svg.selectAll('*').remove()
    this.drawChart()
  }

  addFaction (id, name) {
    this.factions[id] = name
    this.svg.selectAll('*').remove()
    this.drawChart()
  }

  removeFaction (id) {
    delete this.factions[id]
    this.svg.selectAll('*').remove()
    this.drawChart()
  }
}
