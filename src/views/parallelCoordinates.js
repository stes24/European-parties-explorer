import Chart from './chart.js'
import * as d3 from 'd3'
import dataset from '../../public/merged_dataset.csv'

// Rememeber that Chart cointains this.containerDiv, this.svg, this.width, this.height
export default class ParallelCoordinates extends Chart {
  drawChart () {
    const attributes = ['family', 'eu_position', 'eu_intmark', 'eu_foreign', 'lrgen', 'lrecon', 'spendvtax', 'deregulation',
      'redistribution', 'civlib_laworder', 'sociallifestyle', 'religious_principles', 'immigrate_policy', 'multiculturalism',
      'urban_rural', 'environment', 'regions', 'ethnic_minorities', 'nationalism', 'russian_intereference', 'anti_islam_rhetoric']
    const margin = { top: 25, right: 35, bottom: 10, left: 25 }

    // TEMPORARILY SHOW DATA FROM 2019
    const data2019 = dataset.filter(d => d.year === 2019)

    const xScale = d3.scalePoint()
      .domain(attributes)
      .range([margin.left, this.width - margin.right])

    // Define more y scales, one for each attribute
    const yScales = {} // Will be a map
    attributes.forEach(attr => {
      yScales[attr] = d3.scaleLinear() // Key (attribute) -> will find value (scale associated to that attribute)
        .domain(d3.extent(data2019, d => d[attr]))
        .range([this.height - margin.bottom, margin.top])
    })

    // How to generate the lines
    const line = d3.line()
      .defined(d => !isNaN(d[1])) // Ignore invalid values
      .x(d => xScale(d[0])) // d = [attribute name, value]
      .y(d => yScales[d[0]](d[1])) // Find right scale with attribute, then find value in the scale

    // Draw lines
    this.svg.append('g')
      .selectAll('path')
      .data(data2019)
      .enter()
      .append('path')
      .attr('class', 'line')
      .attr('d', d => line(attributes.map(attr => [attr, d[attr]])))
      // For each datum, create [attr, value] and give it to line (it connects the values of different attributes)

    // y axis
    this.svg.selectAll('axis') // Vertical axis to be inserted
      .data(attributes) // Bind one attribute to each axis
      .enter()
      .append('g')
      .attr('class', 'axis')
      .attr('transform', d => `translate(${xScale(d)}, 0)`) // Each attribute positions the corresponding axis
      .each(function (d) { d3.select(this).call(d3.axisLeft(yScales[d])) }) // Find corresponding scale, call axis like normally except many times
      .append('text') // Text operations
      .attr('y', margin.top - 10)
      .attr('text-anchor', 'middle')
      .text(d => d)
  }
}
