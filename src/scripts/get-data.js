import fs from 'fs'
// import slugify from '@sindresorhus/slugify'
import { parse } from 'csv-parse/sync'
import 'dotenv/config'

const SPREADSHEET_ID = process.env.SPREADSHEET_ID
const URL = 'https://docs.google.com/spreadsheets/d/{{ID}}/gviz/tq?tqx=out:csv&sheet={{sheet_name}}'
  .replace('{{ID}}', SPREADSHEET_ID)

const COL_ID = 'ID'
const COL_DATE = 'Date \nYYYY-MM-DD'
const COL_AREA = 'Campaign Area'
const COL_CAMPAIGN = 'Campaign'
const COL_SECTOR = 'Sector'
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

const getCommaSeparatedList = str => str.split(',').map(s => s.trim())

const rows = await fetch(URL)
  .then(r => r.text())
  .then(csv => parse(csv, {columns: true, skip_empty_lines: true, trim: true}))
  .catch(err => {
    throw new Error(`Unable to fetch spreadsheet data: ${err}`)
  })

const events = rows
  .map((event, i) => {
    return {
      date: event[COL_DATE],
      area: getCommaSeparatedList(event[COL_AREA]),
      campaign: getCommaSeparatedList(event[COL_CAMPAIGN]),
      sector: event[COL_SECTOR],
      headline: event[COL_HEADLINE],
      summary: event[COL_SUMMARY],
      city: event[COL_CITY],
      country: getCommaSeparatedList(event[COL_COUNTRY]),
      region: getCommaSeparatedList(event[COL_REGION]),
      target: getCommaSeparatedList(event[COL_TARGET]),
      sources: [
          event[COL_SOURCE],
          event[COL_COVERAGE1],
          event[COL_COVERAGE2],
          event[COL_COVERAGE3],
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
  }
)


try {
  fs.writeFileSync('./src/data/events.json', JSON.stringify(events, null, 2))
} catch (err) {
  throw new Error(err)
}
