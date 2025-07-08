import type { Event } from "../types/Event";
import type { FilterSet } from "../types/FilterSet";

export const getFilteredEvents = (events: Event[], filterSet: FilterSet) => {
  return events.filter(event => {
    let matchedFilters = 0
    for (const type in filterSet) {
      if (type === 'search') {
        //
      } else if (type === 'dateFrom') {
        //
      } else if (type === 'dateTo') {
        //
      } else if (typeof filterSet[type] !== 'string') {
        let countMatches = event[type].filter(f => filterSet[type].includes(f))
        if (countMatches.length == filterSet[type].length) {
          matchedFilters++
        }
      }
    }
    return matchedFilters === Object.keys(filterSet).length
  })
}