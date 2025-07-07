/**
 * Get the possible values for each filter type
 */
import slugify from '@sindresorhus/slugify'

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
        name,
        value: slugify(name)
      }
    })
  }

export const getFilters = (filterSlugs, events) => {
  const filters = {}
  filterSlugs.reduce(
    (filterOptions, filterName) => {
      filterOptions[filterName] = getFilterOptions(filterName, events)
      return filterOptions
    },
    filters
  )
  return filters
}
