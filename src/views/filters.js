import { years, countries, factions } from './../utils.js'

export default function createFilters (containerDiv, controller) {
  createYearRow(containerDiv, controller)
  createRow(containerDiv, controller, true)
  createRow(containerDiv, controller, false)
  createReset(containerDiv, controller)
}

// FIRST ROW
function createYearRow (containerDiv, controller) {
  // Create year label
  const yearLabel = document.createElement('label')
  yearLabel.textContent = 'YEAR:'
  yearLabel.className = 'text-label'
  yearLabel.style.color = 'white'

  // Create drop-down menu
  const yearSelect = document.createElement('select')
  yearSelect.style.marginTop = '3px'
  years.reverse().forEach(year => {
    const option = document.createElement('option')
    option.value = year
    option.textContent = year
    yearSelect.appendChild(option)
  })

  // Controller handles new year
  yearSelect.addEventListener('change', () => {
    controller.updateYear(parseInt(yearSelect.value))
  })

  // Create first row, append label and drop-down
  const yearRow = document.createElement('div')
  yearRow.style.alignItems = 'center'
  yearRow.className = 'filters-row'
  yearRow.appendChild(yearLabel)
  yearRow.appendChild(yearSelect)

  // Append first row to the div
  containerDiv.appendChild(yearRow)
}

// SECOND AND THIRD ROW
// They use the same procedure -> true = second row, false = third row
function createRow (containerDiv, controller, whichRow) {
  // Only different things are label text, use countries or factions, and class of the divs
  const labelText = whichRow ? 'COUNTRIES:' : 'FACTIONS:'
  const map = whichRow ? countries : factions
  const divClass = whichRow ? 'selectable-div-country' : 'selectable-div-faction'

  // Create text label
  const label = document.createElement('label')
  label.textContent = labelText
  label.className = 'text-label'
  label.style.color = 'white'

  // Create row, append label
  const row = document.createElement('div')
  row.style.flexWrap = 'wrap' // Puts elements in a new line when needed
  row.className = 'filters-row'
  row.appendChild(label)

  // For each country/faction, create a selectable div, then append it
  let entries
  whichRow
    ? entries = Object.entries(map).sort((a, b) => a[1].localeCompare(b[1])) // Alphabetical order if countries
    : entries = Object.entries(map)
  entries.forEach(element => {
    const elementDiv = document.createElement('div')
    elementDiv.classList.add(divClass, 'selected')
    elementDiv.dataset.id = element[0] // [id, name]
    elementDiv.textContent = element[1]

    elementDiv.addEventListener('click', () => {
      elementDiv.classList.toggle('selected') // Adds and removes selected

      if (whichRow) {
        if (elementDiv.classList.contains('selected')) { // A country was selected
          controller.addCountry(element[0], element[1])
        } else { // A country was deselected
          controller.removeCountry(element[0])
        }
      } else {
        if (elementDiv.classList.contains('selected')) { // A faction was selected
          controller.addFaction(element[0], element[1])
        } else { // A faction was deselected
          controller.removeFaction(element[0])
        }
      }
      updateCheckbox()
    })

    row.appendChild(elementDiv)
  })

  // Create select-all checkbox
  const selectAllCheckbox = document.createElement('input')
  selectAllCheckbox.type = 'checkbox'
  selectAllCheckbox.checked = true
  selectAllCheckbox.id = 'select-all'

  // Automatically select checkbox if all elements are selected, deselect it if there's one unselected element
  function updateCheckbox () {
    const allElementDivs = document.querySelectorAll(`.${divClass}`)
    // Creates an array from all elements, then checks whether they are all selected or not
    const allSelected = Array.from(allElementDivs).every(elementDiv => elementDiv.classList.contains('selected'))
    selectAllCheckbox.checked = allSelected
  }

  // Select-all behavior
  selectAllCheckbox.addEventListener('change', () => {
    const allElementDivs = document.querySelectorAll(`.${divClass}`)
    allElementDivs.forEach(elementDiv => {
      const id = elementDiv.dataset.id
      const name = elementDiv.textContent

      if (selectAllCheckbox.checked) { // If checkbox checked select all elements, else deselect all
        elementDiv.classList.add('selected')
        if (whichRow) {
          controller.addCountry(id, name)
        } else {
          controller.addFaction(id, name)
        }
      } else {
        elementDiv.classList.remove('selected')
        if (whichRow) {
          controller.removeCountry(id)
        } else {
          controller.removeFaction(id)
        }
      }
    })
  })

  // Create select-all label
  const selectAllLabel = document.createElement('label')
  selectAllLabel.textContent = 'Select all'
  selectAllLabel.style.fontSize = '12px'
  selectAllLabel.style.marginTop = '3px'
  selectAllLabel.className = 'text-label'
  selectAllLabel.style.color = 'white'

  // Put checkbox and label together
  const selectAllDiv = document.createElement('div')
  selectAllDiv.style.display = 'flex'
  selectAllDiv.alignItems = 'center'
  selectAllDiv.appendChild(selectAllCheckbox)
  selectAllDiv.appendChild(selectAllLabel)

  // Append second row to the div
  row.appendChild(selectAllDiv)
  containerDiv.appendChild(row)
}

function createReset (containerDiv, controller) {
  /* const button = document.createElement('button')
  button.type = 'button'
  button.textContent = 'Reset all selections'

  button.addEventListener('click', () => {
    controller.resetBrush()
  })

  const resetRow = document.createElement('div')
  resetRow.className = 'filters-row'
  resetRow.style.alignItems = 'center'
  resetRow.style.marginTop = '8px'

  resetRow.appendChild(button)
  containerDiv.appendChild(resetRow) */
}
