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
      switch (type) {
        case 'search':
          if (event.headline.toLowerCase().includes(selectedFilters.search.toLocaleLowerCase())) {
            matchedFilters++
          }
          break
        case 'dateFrom':
        case 'dateTo':
          break
        case 'area':
        case 'campaign':
        case 'country':
        case 'region':
        case 'target':
          // These filters are additive. An event is matched if it
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