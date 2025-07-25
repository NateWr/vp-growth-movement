import debounce from "debounce";
import type { SelectedFilters } from "../types/SelectedFilters";
import type { URLParams } from "../types/URLParams";
import { onMounted, type Ref } from "vue";
import type { IgnoredUpdater } from "@vueuse/core";

const SEPARATOR = '|'
const STRING_FILTERS = ['dateFrom', 'dateTo', 'search']

const mapParamsToFilters = {
  a: 'area',
  cmp: 'campaign',
  c: 'country',
  from: 'dateFrom',
  to: 'dateTo',
  r: 'region',
  s: 'search',
  t: 'target',
}

const mapFiltersToParams = Object.entries(mapParamsToFilters).reduce((acc, [key, value]) => (acc[value] = key, acc), {})

export const useUrlParams = (
  selectedFilters: Ref<SelectedFilters>,
  currentPage: Ref<number>,
  searchInput: Ref<string>,
  ignoreSearchInputUpdates: IgnoredUpdater,
  dateFromInput: Ref<string>,
  ignoreDateFromInputUpdates: IgnoredUpdater,
  dateToInput: Ref<string>,
  ignoreDateToInputUpdates: IgnoredUpdater,
  sortBy: Ref<boolean>,
) => {

  const getUrlParams = () => {
    const urlParams : URLParams = {}
    for (const type in selectedFilters.value) {
      if (!selectedFilters.value[type].length) {
        continue
      }
      switch (type) {
        case 'dateFrom':
        case 'dateTo':
        case 'search':
          urlParams[mapFiltersToParams[type]] = selectedFilters.value[type]
          break
        default:
          urlParams[mapFiltersToParams[type]] = selectedFilters.value[type].join(SEPARATOR)
          break
      }
    }
    if (currentPage.value > 1) {
      urlParams.p = currentPage.value.toString()
    }
    if (sortBy.value) {
      urlParams.o = '1'
    }
    return urlParams
  }

  const changeUrl = debounce(() => {
    const urlParams = new URLSearchParams(getUrlParams())
    urlParams.sort()
    const oldUrlParams = new URLSearchParams(window.location.search)
    oldUrlParams.sort()
    const queryString = urlParams.toString()
    if (queryString !== oldUrlParams.toString()) {
      const [urlRoot] = window.location.toString().split('?')
      history.pushState(
        {queryString},
        '',
        queryString.length
          ? [urlRoot, queryString].join('?')
          : urlRoot
      )
    }
  }, 250)

  const setFiltersFromParams = () => {
    const params = new URLSearchParams(window.location.search)
    for (const type in mapParamsToFilters) {
      const filterName = mapParamsToFilters[type]
      if (STRING_FILTERS.includes(filterName)) {
        selectedFilters.value[filterName] = params.get(type) ?? ''
        if (filterName === 'search') {
          ignoreSearchInputUpdates(() => {
            searchInput.value = params.get(type) ?? ''
          })
        } else if (filterName === 'dateFrom') {
          ignoreDateFromInputUpdates(() => {
            dateFromInput.value = params.get(type) ?? ''
          })
        } else if (filterName === 'dateTo') {
          ignoreDateToInputUpdates(() => {
            dateToInput.value = params.get(type) ?? ''
          })
        }
      } else {
        selectedFilters.value[filterName] = params.get(type)?.split(SEPARATOR) ?? []
      }
    }
    if (params.get('p')) {
      currentPage.value = parseInt(params.get('p'), 10)
    }
    if (params.get('o')) {
      sortBy.value = true
    }
  }

  onMounted(() => {
    if (window.location.search) {
      setFiltersFromParams()
    }
    window.addEventListener('popstate', setFiltersFromParams)
  })

  return {
    changeUrl,
  }
}
