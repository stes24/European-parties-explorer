import './index.scss'
import ScatterPlot from './views/scatterPlot.js'
import LineChart from './views/lineChart.js'
import ParallelCoordinates from './views/parallelCoordinates.js'
import createFilters from './views/filters.js'

document.addEventListener('DOMContentLoaded', () => {
  const scatterPlot = new ScatterPlot(document.getElementById('scatter-container'))
  const lineChart = new LineChart(document.getElementById('line-container'))
  const parallelCoordinates = new ParallelCoordinates(document.getElementById('parallel-container'))

  scatterPlot.initialize()
  lineChart.initialize()
  createFilters(document.getElementById('filters-container'))
  parallelCoordinates.initialize()
})
