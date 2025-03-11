import './index.scss'
import ScatterPlot from './views/scatterPlot'
import LineChart from './views/lineChart'
import ParallelCoordinates from './views/parallelCoordinates'

document.addEventListener('DOMContentLoaded', () => {
  const scatterPlot = new ScatterPlot(document.getElementById('scatter-container'))
  const lineChart = new LineChart(document.getElementById('line-container'))
  const parallelCoordinates = new ParallelCoordinates(document.getElementById('parallel-container'))

  scatterPlot.initialize()
  lineChart.initialize()
  parallelCoordinates.initialize()
})
