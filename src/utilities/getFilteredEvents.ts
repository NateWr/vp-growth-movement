import type { Event } from "../types/Event";
import type { SelectedFilters } from "../types/SelectedFilters";

export const getFilteredEvents = (events: Event[], selectedFilters: SelectedFilters) => {
  if (!Object.keys(selectedFilters).length) {
    return events
  }
  return events.filter(event => {
    let matchedFilters = 0
    let expectedMatches = 0
    for (const type in selectedFilters) {
      if (selectedFilters[type].length) {
        expectedMatches++
      } else {
        continue
      }
      const query = selectedFilters.search.toLocaleLowerCase()
      switch (type) {
        case 'search':
          if (event.headline.toLowerCase().includes(query)) {
            matchedFilters++
          } else if (event.summary.toLowerCase().includes(query)) {
            matchedFilters++
          } else if (event.target.join(',').toLowerCase().includes(query)) {
            matchedFilters++
          }
          break
        case 'dateFrom':
          if (event.date >= (selectedFilters?.dateFrom ?? '')) {
            matchedFilters++
          }
          break;
        case 'dateTo':
          if (event.date <= (selectedFilters?.dateTo ?? '')) {
            matchedFilters++
          }
          break
        case 'area':
        case 'campaign':
        case 'country':
        case 'region':
        case 'target':
          // For these filters, an event is included if it
          // matches at least one of the selected options
          let countMatches = event[type].filter((f: string) => selectedFilters[type]?.includes(f))
          if (countMatches.length) {
            matchedFilters++
          }
          break
      }
    }
    return matchedFilters === expectedMatches
  })
}