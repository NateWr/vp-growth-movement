/**
 * These functions convert filter option values (united-kingdom)
 * into their display names (United Kingdom)
 */
import type { FilterOption } from "../types/FilterOption"

export const getFilterOptions = (values: string[], options: FilterOption[]) => {
  return options
    .filter((o: FilterOption) => values.includes(o.value))
}

export const getFilterNames = (values: string[], options: FilterOption[]) => {
  return getFilterOptions(values, options)
    .map((o: FilterOption) => o.name)
}
