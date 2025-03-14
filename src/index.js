import './index.scss'
import ScatterPlot from './views/scatterPlot.js'
import LineChart from './views/lineChart.js'
import ParallelCoordinates from './views/parallelCoordinates.js'
import createFilters from './views/filters.js'
import { countries, factions } from 'utils.js'

document.addEventListener('DOMContentLoaded', () => {
  const controller = new Controller()
  console.log('Created ', controller)
})

// Handles interaction
export default class Controller {
  constructor () {
    this.scatterPlot = new ScatterPlot(document.getElementById('scatter-container'), this)
    this.lineChart = new LineChart(document.getElementById('line-container'), this)
    this.parallelCoordinates = new ParallelCoordinates(document.getElementById('parallel-container'), this)

    this.scatterPlot.initialize()
    this.lineChart.initialize()
    this.parallelCoordinates.initialize()
    createFilters(document.getElementById('filters-container'), this)

    this.year = 2024
    this.countries = countries
    this.factions = factions
  }

  // MAYBE MOVE DEFAULT YEAR HERE?

  // New year was selected, update charts
  updateYear (year) {
    this.year = year
    this.scatterPlot.updateYear(year)
    this.parallelCoordinates.updateYear(year)
  }
}
