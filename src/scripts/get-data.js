import fs from 'fs'
import 'dotenv/config'
import YAML from 'yaml'
import { getSpreadsheetData } from './helpers/get-from-spreadsheet.js'
import { getEventsByMonth } from './helpers/get-events-by-month.js'
import { getFilters } from './helpers/get-filters.js'

const SPREADSHEET_ID = process.env.SPREADSHEET_ID
const DATE_END = new Date('2024-12-31')

const events = await getSpreadsheetData(SPREADSHEET_ID)
const months = getEventsByMonth(events, DATE_END)

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
const finalEvents = eventsWithCoords
  /**
   * Convert the Date objects into YYYY-MM-DD strings
   */
  .map(e => {
    e.date = [
      e.date.getFullYear(),
      (e.date.getMonth() + 1).toString().padStart(2, '0'),
      e.date.getDate().toString().padStart(2, '0'),
    ].join('-')
    return e
  })
  /**
   * Convert all filterable properties to their slug versions
   */
  .map(e => {
    filterTypes.forEach(type => {
      if (e[type] && e[type].length) {
        e[type] = e[type].map(value => {
          const slug = filters[type].find(option => option.name === value)
          if (slug) {
            return slug.value
          }
          throw new Error(`Couldn't find slug form of ${type} value ${value} in event id ${e.id}`)
        })
      }
    })
    return e
  })

/**
 * Check that all story events exist
 */
fs.readdirSync('./src/stories')
  .filter(file => file.includes('.md'))
  .forEach(md => {
    const frontmatter = fs
      .readFileSync(`./src/stories/${md}`, 'utf-8')
      .match(/(?<=---)([\.\s\S]*)(?=---)/m)
    const story = YAML.parse(frontmatter ? frontmatter[0] : '')
    const missingEvents = story.events.filter(event => !finalEvents.find(e => e.id === event.id))
    if (missingEvents.length) {
      throw new Error(`Couldn't find event(s) ${missingEvents.map(e => e.id)} for story ${story.title}`)
    }
  })

try {
  fs.writeFileSync('./src/data/events.json', JSON.stringify(finalEvents))
  fs.writeFileSync('./src/data/filters.json', JSON.stringify(filters))
  fs.writeFileSync('./src/data/chart-config.json', JSON.stringify(chartConfig))
  fs.writeFileSync('./public/data/events.json', JSON.stringify(finalEvents))
} catch (err) {
  throw new Error(err)
}

