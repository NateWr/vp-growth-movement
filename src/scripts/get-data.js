import fs from 'fs'
import 'dotenv/config'
import { getSpreadsheetData } from './helpers/get-from-spreadsheet.js'
import { getEventsByMonth } from './helpers/get-events-by-month.js'
import { getFilters } from './helpers/get-filters.js'

const SPREADSHEET_ID = process.env.SPREADSHEET_ID

const events = await getSpreadsheetData(SPREADSHEET_ID)

const dateStart = new Date(events[0].date)
dateStart.setMonth(0)
const dateEnd = events[events.length - 1].date

const months = getEventsByMonth(events, dateStart, dateEnd)

/**
 * Get the chart data
 */
let chartColumns = months.length
let chartRows = 0;
chartRows = months.reduce((max, month) => Math.max(month.events.length, max), chartRows)

const TICK_INTERVAL = 5
const chartTicks = months
  .filter(m => m.month.getMonth() === 0)
  .map(m => {
    return {
      label: m.month.getFullYear(),
      major: m.month.getFullYear() % TICK_INTERVAL === 0,
      x: m.x,
    }
  })

const chartConfig = {
  columns: chartColumns,
  rows: chartRows,
  ticks: chartTicks,
}

/**
 * Get the x,y coordinate for each event
 *
 * To make the data center around the middle of the
 * chart, we calculate the y-position of the first
 * event based on the number of events in each month.
 *
 * For months with an odd number of events, we add an
 * event to make that month's row assignments consistent
 * with months that have even events.
 */
const eventsWithCoords = months
  .map((month, col) => {
    const eventsCount = month.events.length + month.events.length % 2
    const topRow = Math.floor((chartRows - eventsCount) / 2)

    return month.events.map((event, i) => {
      return {
        ...event,
        x: col,
        y: topRow + i,
      }
    })
  })
  .flat()
  .flat()
  .filter(e => e)

chartConfig.data = eventsWithCoords
  .map(({x, y}) => {
    return {x, y}
  })

const filterTypes = [
  'area',
  'campaign',
  'country',
  'region',
  'target',
]
const filters = getFilters(filterTypes, eventsWithCoords)

/**
 * Convert the Date objects into YYYY-MM-DD strings
 */
const eventsWithDates = eventsWithCoords
  .map(e => {
    e.dateFormatted = e.date.toLocaleDateString(
      'en-US',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }
    )
    e.date = [
      e.date.getFullYear(),
      (e.date.getMonth() + 1).toString().padStart(2, '0'),
      e.date.getDate().toString().padStart(2, '0'),
    ].join('-')
    return e
  })

try {
  fs.writeFileSync('./src/data/events.json', JSON.stringify(eventsWithDates))
  fs.writeFileSync('./src/data/filters.json', JSON.stringify(filters))
  fs.writeFileSync('./src/data/chart-config.json', JSON.stringify(chartConfig))
  fs.writeFileSync('./public/data/events.json', JSON.stringify(eventsWithDates))
} catch (err) {
  throw new Error(err)
}

