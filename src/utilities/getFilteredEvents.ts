import type { Event } from "../types/Event";
import type { SelectedFilters } from "../types/SelectedFilters";

export const getFilteredEvents = (events: Event[], selectedFilters: SelectedFilters) => {
  if (!Object.keys(selectedFilters).length) {
    return events
  }
  return events.filter(event => {
    let matchedFilters = 0
    for (const type in selectedFilters) {
      switch (type) {
        case 'search':
          break
        case 'dateFrom':
        case 'dateTo':
          break
        case 'area':
        case 'campaign':
        case 'country':
        case 'region':
        case 'target':
          let countMatches = event[type].filter((f: string) => selectedFilters[type]?.includes(f))
          if (countMatches.length == selectedFilters[type]?.length) {
            matchedFilters++
          }
          break
      }
    }
    return matchedFilters === Object.keys(selectedFilters).length
  })
}