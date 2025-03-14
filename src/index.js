import './index.scss'
// import * as d3 from 'd3'
import Controller from './controller.js'
import dataset from '../public/merged_dataset_with_mds.csv'

async function loadData () {
  try {
    /* let dataset = await d3.csv('./merged_dataset_with_mds.csv')

    dataset = dataset.map(d => {
      return Object.fromEntries(
        Object.entries(d).map(([key, value]) => {
          if (key === 'party') {console.log(key, value, typeof value); return [key, value]} // Lascia la colonna 'party' come stringa
          if (value === '') {console.log(key, value, typeof value); return [key, '']} // Mantieni i valori vuoti come ''
          const num = +value
          console.log(key, +value, typeof +value)
          return [key, isNaN(num) ? value : num] // Converte in numero se possibile, altrimenti lascia il valore originale
        })
      )
    }) */

    const controller = new Controller(dataset)
    console.log('Data loaded, controller created', controller)
  } catch (e) {
    console.error('Error while loading data\n', e)
  }
}

loadData()
