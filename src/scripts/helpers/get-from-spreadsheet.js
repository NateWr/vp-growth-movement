/**
 * Get data from the spreadsheet and
 * return it as an arary of JS objects
 */
import { parse } from 'csv-parse/sync'

const COL_ID = 'ID'
const COL_DATE = 'Date \nYYYY-MM-DD'
const COL_AREA = 'Categorize\n(leave empty if not applicable) Campaign Area'
const COL_CAMPAIGN = 'Campaign'
const COL_HEADLINE = 'Headline'
const COL_SUMMARY = 'Summary'
const COL_CITY = 'Location/Site where Action Taken\n(leave empty if not applicable) City '
const COL_COUNTRY = 'Country'
const COL_REGION = 'Region ↗'
const COL_TARGET = 'Target'
const COL_SOURCE = 'Sources and Media Coverage\n(source required, coverage optional) Source'
const COL_COVERAGE1 = 'Coverage 1'
const COL_COVERAGE2 = 'Coverage 2'
const COL_COVERAGE3 = 'Coverage 3'

const REGEX_DOMAIN = /^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/?\n]+)/gi
const REGEX_DATE = /^[0-9]{4}-[0-1][0-9]-[0-3][0-9]$/

const validateRowData = row => {
    if (!row[COL_DATE] || !row[COL_ID]) {
      throw new Error(`Event missing date column:\n\n${JSON.stringify(row, null, 2)}`)
    }
    const dateMatches = row[COL_DATE].match(REGEX_DATE)
    if (!dateMatches || !dateMatches.length) {
      throw new Error(`Event date missing or invalid: ${row[COL_DATE]}\n\n${JSON.stringify(row, null, 2)}`)
    }
}

const getCommaSeparatedList = str => str.split(',').map(s => s.trim()).filter(s => s)

export const getSpreadsheetData = async (spreadsheetId) => {
  const URL = 'https://docs.google.com/spreadsheets/d/{{ID}}/gviz/tq?tqx=out:csv'
    .replace('{{ID}}', spreadsheetId)



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
        id: row[COL_ID],
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

  return events
}
