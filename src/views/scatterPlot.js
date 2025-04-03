import Chart from './chart.js'
import * as d3 from 'd3'
import { factions, countries, moveTooltip } from './../utils.js'

// Rememeber that Chart cointains containerDiv, svg, width, height, dataset, controller, year, countries, factions
export default class ScatterPlot extends Chart {
  constructor (...args) {
    super(...args)
    this.brushedData = new Set()
    this.mode = 'zoom' // Interaction mode
    this.lastZoomTransform = d3.zoomIdentity // Store last zoom state
    this.coloring = 'faction' // Selected coloring
  }

  drawChart () {
    const margin = { top: 22, right: 12, bottom: 95, left: 45 }
    this.containerDiv.style.position = 'relative' // To position menu correctly

    // Position of zoom/select menu
    d3.select('.scatter-row')
      .style('left', `${margin.left - 40}px`)
      .style('top', `${margin.top - 22}px`)

    // Zoom behavior
    this.svg.call(d3.zoom()
      .scaleExtent([0.8, 8]) // Can also zoom out a little
      .on('zoom', (event) => {
        if (this.mode === 'zoom') {
          this.handleZoom(event.transform)
        }
      })
    )

    // Use selected filters
    this.data = this.dataset.filter(d => d.year === this.year && d.country in this.countries && d.family in this.factions)

    this.xScale = d3.scaleLinear()
      .domain([d3.min(this.dataset, d => d.mds1 - 1.5), d3.max(this.dataset, d => d.mds1 + 1.5)])
      .range([margin.left, this.width - margin.right])
    this.xScaleCurrent = this.xScale // Updated with zoom and pan

    this.yScale = d3.scaleLinear()
      .domain([d3.min(this.dataset, d => d.mds2 - 1), d3.max(this.dataset, d => d.mds2 + 1)])
      .range([this.height - margin.bottom, margin.top])
    this.yScaleCurrent = this.yScale // Updated with zoom and pan

    // How to compute circles radius
    const radius = d3.scaleSqrt() // Sqrt to avoid exponential growth
      .domain([d3.min(this.dataset, d => d.vote), d3.max(this.dataset, d => d.vote)])
      .range([4, 30])

    // Used for containing points' g and clip
    this.drawArea = this.svg.append('g')

    // Draw points
    this.drawArea.append('g')
      .attr('clip-path', 'url(#clip)') // Apply clip
      .selectAll('circle')
      .data(this.data.sort((a, b) => { // Bigger circles on the background
        return d3.descending(a.vote ?? 0, b.vote ?? 0) // 0 if null
      }))
      .enter()
      .append('circle')
      .attr('class', 'point')
      .attr('cx', d => this.xScale(d.mds1))
      .attr('cy', d => this.yScale(d.mds2))
      .attr('r', d => radius(d.vote))
      .on('mouseover', (event, d) => {
        this.timeout = setTimeout(() => {
          this.handleMouseOver(event, d) // Handle hovering
          this.callHandleOut = true
        }, 320) // Small delay so that you have time to hover small points contained in bigger points
      })
      .on('mousemove', (event) => {
        this.handleMouseMove(event)
      })
      .on('mouseout', (event, d) => {
        clearTimeout(this.timeout)
        if (this.callHandleOut) { // Call handleMouseOut (which implies reordering of data) only if the tooltip was effectively shown
          this.handleMouseOut(d)
          this.callHandleOut = false
        }
      })
    this.colorPoints()

    // Clipping path - cancels circles outside the axes
    this.drawArea.append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('x', margin.left)
      .attr('y', margin.top)
      .attr('width', this.width - margin.left - margin.right)
      .attr('height', this.height - margin.top - margin.bottom)

    // x axis
    this.xAxis = this.drawArea.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0, ${this.height - margin.bottom})`)
      .call(d3.axisBottom(this.xScale))

    // y axis
    this.yAxis = this.drawArea.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(this.yScale))

    // x axis legend
    this.svg.append('text')
      .attr('class', 'legend')
      .attr('x', this.width / 2)
      .attr('y', this.height - margin.bottom + 30)
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

    // Handle interaction mode
    const modeButtons = d3.selectAll('input[name="mode"]')
    modeButtons.on('change', event => {
      this.mode = event.target.value

      if (this.mode === 'zoom') {
        d3.select('.brushArea')
          .call(d3.brush().move, null) // Reset brush selection
          .remove() // Remove brush area

        // this.xScaleCurrent = this.xScale
        // this.yScaleCurrent = this.yScale

        // Resume from the last zoom state (instead of the jumping points bug)
        this.svg.transition()
          .duration(0)
          .call(d3.zoom().transform, this.lastZoomTransform)
      } else {
        this.startBrush()
      }
    })

    // Create row for drop-downs
    d3.select('#controls').remove()
    const controlsRow = d3.select(this.containerDiv)
      .append('div')
      .attr('id', 'controls')
      .style('position', 'absolute')
      .style('display', 'flex')
      .style('gap', '5px')
      .style('left', `${this.containerDiv.getBoundingClientRect().left + 2}px`)
      .style('top', `${this.containerDiv.getBoundingClientRect().bottom - margin.bottom + 30}px`)

    // Size label
    controlsRow.append('label')
      .attr('class', 'text-label')
      .text('SIZE: votes in national election (%)')
      .style('font-size', '12px')
      .style('margin-right', '15px')

    // Color label and drop-down
    controlsRow.append('label')
      .attr('class', 'text-label')
      .text('COLOR: ')
      .style('font-size', '12px')
      .style('margin-right', '0px')
    const dropdown = controlsRow.append('select')
      .attr('class', 'dropdown')

    // Add options
    dropdown.selectAll('option')
      .data(['faction', 'country'])
      .enter()
      .append('option')
      .attr('value', d => d)
      .text(d => d)

    dropdown.property('value', this.coloring)

    dropdown.on('change', (event) => {
      this.coloring = event.target.value
      this.colorPoints()
      this.updateLegend()
    })

    // Create row for color legend
    d3.select('#legend').remove()
    d3.select(this.containerDiv)
      .append('div')
      .attr('id', 'legend')
      .style('position', 'absolute')
      .style('display', 'flex')
      .style('flex-wrap', 'wrap')
      .style('gap', '2px')
      .style('row-gap', '0px')
      .style('left', `${this.containerDiv.getBoundingClientRect().left + 2}px`)
      .style('top', `${this.containerDiv.getBoundingClientRect().bottom - margin.bottom + 45}px`)
      .style('align-items', 'center')

    this.updateLegend()
  }

  colorPoints () {
    if (this.coloring === 'faction') {
      this.drawArea.selectAll('circle')
        .attr('fill', d => factionColors[d.family])
    } else {
      this.drawArea.selectAll('circle')
        .attr('fill', d => countryColors[d.country])
    }
  }

  // Zoom behavior
  handleZoom (transform) {
    if (this.mode !== 'zoom') {
      return
    }

    // Save the last zoom transform
    this.lastZoomTransform = transform

    // Update axes
    this.xScaleCurrent = transform.rescaleX(this.xScale)
    this.yScaleCurrent = transform.rescaleY(this.yScale)

    this.xAxis.call(d3.axisBottom(this.xScaleCurrent))
    this.yAxis.call(d3.axisLeft(this.yScaleCurrent))

    // Update points positions
    this.drawArea
      .selectAll('circle')
      .attr('cx', d => this.xScaleCurrent(d.mds1))
      .attr('cy', d => this.yScaleCurrent(d.mds2))

    // Scale brush for safety
    d3.select('.brushArea')
      .call(d3.brush().extent([
        [this.xScaleCurrent.range()[0], this.yScaleCurrent.range()[1]],
        [this.xScaleCurrent.range()[1], this.yScaleCurrent.range()[0]]
      ]))
  }

  // Hovering (call controller)
  // Make tooltip visible
  handleMouseOver (event, d) {
    const tooltip = d3.select('#tooltip')
      .style('visibility', 'visible')
      .html(`<b>${d.party}</b><br>${countries[d.country]} - ${factions[d.family]}<br>Votes: ${d.vote}%`)

    moveTooltip(event, tooltip)
    this.controller.applyHover(d.party_id)
  }

  // Move tooltip
  handleMouseMove (event) {
    moveTooltip(event, d3.select('#tooltip'))
  }

  // Hide tooltip
  handleMouseOut (d) {
    d3.select('#tooltip').style('visibility', 'hidden')
    this.controller.clearHover(d.party_id)
  }

  // Create g and brush
  startBrush () {
    if (this.mode !== 'select') {
      return
    }

    this.drawArea.append('g') // Create new g for the brush
      .attr('class', 'brushArea')
      .call(d3.brush()
        .extent([ // Scale brush with the current zoom
          [this.xScaleCurrent.range()[0], this.yScaleCurrent.range()[1]],
          [this.xScaleCurrent.range()[1], this.yScaleCurrent.range()[0]]
        ])
        .on('start brush end', ({ selection }) => this.handleBrush(selection)))
  }

  // Brushing (call controller)
  handleBrush (selection) {
    if (this.mode !== 'select') {
      return
    }

    this.brushedData.clear()

    if (selection) {
      const [[x0, y0], [x1, y1]] = selection
      this.data.filter(d => {
        const selectedPoints =
          x0 <= this.xScaleCurrent(d.mds1) && this.xScaleCurrent(d.mds1) <= x1 &&
          y0 <= this.yScaleCurrent(d.mds2) && this.yScaleCurrent(d.mds2) <= y1
        if (selectedPoints) {
          this.brushedData.add(d.party_id) // Add brushed points
        }
        return selectedPoints
      })
    }

    this.controller.applyBrushFromScatter(this.brushedData)
  }

  // Called by the controller to highlight the single point
  applyHover (id) {
    this.svg.selectAll('circle')
      .filter(d => d.party_id === id)
      .attr('fill', 'white')
      .raise()
  }

  clearHover (id) {
    this.svg.selectAll('circle') // Go back to original color
      .filter(d => d.party_id === id)
      .attr('fill', d => {
        if (this.coloring === 'faction') {
          return factionColors[d.family]
        } else {
          return countryColors[d.country]
        }
      })

    this.svg.selectAll('circle') // Original ordering of points
      .sort((a, b) => {
        return d3.descending(a.vote ?? 0, b.vote ?? 0)
      })

    this.controller.applyBrush() // Reorder according to the possible brushing
  }

  // Called by the controller to color the points
  applyBrush (selection) {
    if (!selection) {
      this.svg.selectAll('circle')
        .attr('class', 'point')
        .sort((a, b) => { // Bring back to original order when no brush
          return d3.descending(a.vote ?? 0, b.vote ?? 0)
        })

      return
    }

    this.svg.selectAll('circle')
      .filter(d => selection.has(d.party_id))
      .attr('class', 'point-brushed')
      .raise()
      .sort((a, b) => { // Ordering among the brushed points
        return d3.descending(a.vote ?? 0, b.vote ?? 0)
      })

    this.svg.selectAll('circle')
      .filter(d => !selection.has(d.party_id))
      .attr('class', 'point-deselected')
      .sort((a, b) => { // Ordering among the deselected points
        return d3.descending(a.vote ?? 0, b.vote ?? 0)
      })
  }

  updateLegend () {
    const legend = d3.select('#legend')
    legend.html('')

    if (this.coloring === 'faction') {
      Object.keys(factions).forEach(id => {
        if (id in factions) {
          // Container for circle + label
          const legendItem = legend.append('div')
            .style('display', 'flex')
            .style('align-items', 'center')
            .style('gap', '1px')

          // Add circle
          legendItem.append('div')
            .style('width', '10px')
            .style('height', '10px')
            .style('border-radius', '100%')
            .style('background-color', factionColors[id])

          // Add faction
          legendItem.append('text')
            .attr('class', 'text-label')
            .style('font-size', '11px')
            .text(factions[id])
        }
      })
    } else if (this.coloring === 'country') {
      Object.entries(countries)
        .sort((a, b) => a[1].localeCompare(b[1])) // Alphabetical order
        .forEach(([id, name]) => {
          if (id in countries) {
            // Container for circle + label
            const legendItem = legend.append('div')
              .style('display', 'flex')
              .style('align-items', 'center')
              .style('gap', '1px')

            // Add circle
            legendItem.append('div')
              .style('width', '10px')
              .style('height', '10px')
              .style('border-radius', '100%')
              .style('background-color', countryColors[id])

            // Add country
            legendItem.append('text')
              .attr('class', 'text-label')
              .style('font-size', '11px')
              .text(countries[id])
          }
        })
    }
  }
}

const factionColors = {
  1: '#1F77B4', 2: '#AEC7E8', 3: '#BCBD22', 4: '#9467BD', 5: '#FF9896', 6: '#D62728', 7: '#2CA02C', 8: '#8C564B', 9: '#7F7F7F', 10: '#E377C2', 11: '#FF7F0E'
}

const countryColors = { // From d3 category20
  1: '#1F77B4', 2: '#AEC7E8', 3: '#BCBD22', 4: '#9467BD', 5: '#FF9896', 6: '#D62728', 7: '#2CA02C', 8: '#8C564B', 10: '#7F7F7F', 11: '#E377C2', 12: '#FF7F0E', 13: '#17BECF', 14: '#DBDB8D', 16: '#C5B0D5', 20: '#98DF8A', 21: '#C49C94', 22: '#C7C7C7', 23: '#F7B6D2', 24: '#FFBB78', 25: '#9EDAE5', 26: '#474A09', 27: '#82269B', 28: '#274C56', 29: '#2F43F6', 31: '#F2C029', 40: '#38f0ac'
}
