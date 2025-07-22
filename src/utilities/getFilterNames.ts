/**
 * These functions convert filter option values (united-kingdom)
 * into their display names (United Kingdom)
 */
import type { FilterOption } from "../types/FilterOption"

export const getCountryNames = (values: string[], options: FilterOption[]) => {
  return options
    .filter((o: FilterOption) => values.includes(o.value))
    .map((o: FilterOption) => o.name)
}
export const getAreaNames = (values: string[], options: FilterOption[]) => {
  return options
    .filter((o: FilterOption) => values.includes(o.value))
    .map((o: FilterOption) => o.name)
}
export const getCampaignNames = (values: string[], options: FilterOption[]) => {
  return options
    .filter((o: FilterOption) => values.includes(o.value))
    .map((o: FilterOption) => o.name)
}
export const getTargetNames = (values: string[], options: FilterOption[]) => {
  return options
    .filter((o: FilterOption) => values.includes(o.value))
    .map((o: FilterOption) => o.name)
}
