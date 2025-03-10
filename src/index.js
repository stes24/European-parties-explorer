import './index.scss'
// import * as d3 from 'd3'
// import dataset from '../public/merged_dataset.csv'

import ScatterPlot from './views/scatterPlot'
import LineChart from './views/lineChart'
import ParallelCoordinates from './views/parallelCoordinates'

const charts = [
  new ScatterPlot(),
  new LineChart(),
  new ParallelCoordinates()
]

charts.forEach(c => c.plot())
