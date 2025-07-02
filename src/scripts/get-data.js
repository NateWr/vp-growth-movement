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

const getFilterOptions = (prop) => {
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

const getFilterOptionIds = (names, options) => {
  const ids = options
    .filter(o => names.includes(o.name))
    .map(o => o.id)
  if (ids.length !== names.length) {
    throw new Error(`Unable to set one or more option ids for ${names.length}. Options:\n\n${JSON.stringify(options, null, 2)}`)
  }
  return ids
}

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

const filters = {
  area: getFilterOptions('area'),
  campaign: getFilterOptions('campaign'),
  country: getFilterOptions('country'),
  region: getFilterOptions('region'),
  target: getFilterOptions('target'),
}

const eventsSlim = events.map(event => {
  let newEvent = {date: event.date}
  let props = ['area', 'campaign', 'country', 'region', 'target']
  props.forEach(prop => {
      const ids = getFilterOptionIds(event[prop], filters[prop])
      if (ids.length) {
        newEvent[prop] = ids
      }
    })
  return newEvent
})

const dateStart = events[0].date
const dateEnd = events[events.length - 1].date
const months = []
i = new Date(dateStart)
while (i <= dateEnd) {
  months.push({
    month: new Date(i),
    events: events
      .filter(event => {
        return event.date.getFullYear() === i.getFullYear()
          && event.date.getMonth() === i.getMonth()
      })
      .map(event => {
        return {
          id: event.id,
          date: formatDate(event.date),
        }
      }),
  })
  if (i.getMonth() === 11) {
    i.setFullYear(i.getFullYear() + 1)
    i.setMonth(0)
  } else {
    i.setMonth(i.getMonth() + 1)
  }
}

const chartConfig = {
  dateStart: formatDate(dateStart),
  dateEnd: formatDate(dateEnd),
  months,
}

try {
  fs.writeFileSync('./src/data/events.json', JSON.stringify(events, null, 2))
} catch (err) {
  throw new Error(err)
}

try {
  fs.writeFileSync('./src/data/filters.json', JSON.stringify(filters, null, 2))
} catch (err) {
  throw new Error(err)
}

try {
  fs.writeFileSync('./public/data/events-slim.json', JSON.stringify(eventsSlim, null, 2))
} catch (err) {
  throw new Error(err)
}

try {
  fs.writeFileSync('./src/data/chart-config.json', JSON.stringify(chartConfig, null, 2))
} catch (err) {
  throw new Error(err)
}