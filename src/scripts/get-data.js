import fs from 'fs'
import slugify from '@sindresorhus/slugify'
import { parse } from 'csv-parse/sync'
import 'dotenv/config'

const SPREADSHEET_ID = process.env.SPREADSHEET_ID
const URL = 'https://docs.google.com/spreadsheets/d/{{ID}}/gviz/tq?tqx=out:csv'
  .replace('{{ID}}', SPREADSHEET_ID)

const COL_ID = 'ID'
const COL_DATE = 'Date \nYYYY-MM-DD'
const COL_AREA = 'Campaign Area'
const COL_CAMPAIGN = 'Campaign'
const COL_HEADLINE = 'Headline'
const COL_SUMMARY = 'Summary'
const COL_CITY = 'City'
const COL_COUNTRY = 'Country'
const COL_REGION = 'Region ↗'
const COL_TARGET = 'Target'
const COL_SOURCE = 'Source'
const COL_COVERAGE1 = 'Coverage 1'
const COL_COVERAGE2 = 'Coverage 2'
const COL_COVERAGE3 = 'Coverage 3'

const REGEX_DOMAIN = /^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/?\n]+)/gi
const REGEX_DATE = /^[0-9]{4}-[0-1][0-9]-[0-3][0-9]$/

const validateRowData = row => {
    if (!row[COL_DATE]) {
      throw new Error(`Event missing date column:\n\n${JSON.stringify(row, null, 2)}`)
    }
    const dateMatches = row[COL_DATE].match(REGEX_DATE)
    if (!dateMatches || !dateMatches.length) {
      throw new Error(`Event date missing or invalid: ${row[COL_DATE]}\n\n${JSON.stringify(row, null, 2)}`)
    }
}

const getCommaSeparatedList = str => str.split(',').map(s => s.trim()).filter(s => s)

const formatDate = date => date.toISOString().split('T')[0]

const rows = await fetch(URL)
  .then(r => r.text())
  .then(csv => parse(csv, {columns: true, skip_empty_lines: true, trim: true}))
  .catch(err => {
    throw new Error(`Unable to fetch spreadsheet data: ${err}`)
  })

let i = 0;
const events = rows
  .map(row => {
    validateRowData(row)
    return {
      id: (i++).toString().padStart(15, '0'),
      date: new Date(row[COL_DATE]),
      area: getCommaSeparatedList(row[COL_AREA]),
      campaign: getCommaSeparatedList(row[COL_CAMPAIGN]),
      headline: row[COL_HEADLINE],
      summary: row[COL_SUMMARY],
      city: row[COL_CITY],
      country: getCommaSeparatedList(row[COL_COUNTRY]),
      region: getCommaSeparatedList(row[COL_REGION]),
      target: getCommaSeparatedList(row[COL_TARGET]),
      sources: [
          row[COL_SOURCE],
          row[COL_COVERAGE1],
          row[COL_COVERAGE2],
          row[COL_COVERAGE3],
        ]
        .filter(s => s)
        .map(url => {
          const matches = [...url.matchAll(REGEX_DOMAIN)]
          return {
            url,
            domain: matches[0]?.length
              ? matches[0][1] ?? matches[0][0] ?? ''
              : ''
          }
        })
        ,
    }
  })
  .sort((a, b) => a.date.getTime() - b.date.getTime())
  .map(event => {
    return event
  })

const dateStart = new Date(events[0].date)
dateStart.setMonth(0)
const dateEnd = events[events.length - 1].date

i = 0
let iDate = new Date(dateStart)
const months = []
while (iDate <= dateEnd) {
  months.push({
    x: i,
    month: new Date(iDate),
    events: events
      .filter(event => {
        return event.date.getFullYear() === iDate.getFullYear()
          && event.date.getMonth() === iDate.getMonth()
      }),
  })
  if (iDate.getMonth() === 11) {
    iDate.setFullYear(iDate.getFullYear() + 1)
    iDate.setMonth(0)
  } else {
    iDate.setMonth(iDate.getMonth() + 1)
  }
  i++
}

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

/**
 * Get the possible values for each filter type
 */
const getFilterOptions = (prop, events) => {
  let i = 0;
  return [...new Set(
      events
        .map(event => event[prop])
        .flat()
    )]
    .filter(o => o)
    .sort()
    .map(name => {
      return {
        id: i++,
        name,
        value: slugify(name)
      }
    })
  }

const filters = {
  area: getFilterOptions('area', eventsWithCoords),
  campaign: getFilterOptions('campaign', eventsWithCoords),
  country: getFilterOptions('country', eventsWithCoords),
  region: getFilterOptions('region', eventsWithCoords),
  target: getFilterOptions('target', eventsWithCoords),
}

try {
  fs.writeFileSync('./src/data/events.json', JSON.stringify(eventsWithCoords, null, 2))
} catch (err) {
  throw new Error(err)
}

try {
  fs.writeFileSync('./src/data/filters.json', JSON.stringify(filters, null, 2))
} catch (err) {
  throw new Error(err)
}

try {
  fs.writeFileSync('./src/data/chart-config.json', JSON.stringify(chartConfig, null, 2))
} catch (err) {
  throw new Error(err)
}
