import debounce from "debounce";
import type { SelectedFilters } from "../types/SelectedFilters";
import type { URLParams } from "../types/URLParams";
import { onMounted, type Ref } from "vue";

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


const getUrlParams = (selectedFilters: SelectedFilters, page: number) => {
  const urlParams : URLParams = {}
  for (const type in selectedFilters) {
    if (!selectedFilters[type].length) {
      continue
    }
    switch (type) {
      case 'dateFrom':
      case 'dateTo':
      case 'search':
        urlParams[mapFiltersToParams[type]] = selectedFilters[type]
        break
      default:
        urlParams[mapFiltersToParams[type]] = selectedFilters[type].join(SEPARATOR)
        break
    }
  }
  if (page > 1) {
    urlParams.p = page.toString()
  }
  return urlParams
}

const setFiltersFromParams = (
  selectedFilters: Ref<SelectedFilters>,
  currentPage: Ref<number>,
  searchInput: Ref<string>,
  dateFromInput: Ref<string>,
  dateToInput: Ref<string>,
) => {
  const params = new URLSearchParams(window.location.search)
  for (const type in mapParamsToFilters) {
    const filterName = mapParamsToFilters[type]
    if (STRING_FILTERS.includes(filterName)) {
      selectedFilters.value[filterName] = params.get(type) ?? ''
      if (filterName === 'search') {
        searchInput.value = params.get(type) ?? ''
      } else if (filterName === 'dateFrom') {
        dateFromInput.value = params.get(type) ?? ''
      } else if (filterName === 'dateTo') {
        dateToInput.value = params.get(type) ?? ''
      }
    } else {
      selectedFilters.value[filterName] = params.get(type)?.split(SEPARATOR) ?? []
    }
  }
  if (params.get('p')) {
    currentPage.value = parseInt(params.get('p'), 10)
  }
}

const changeUrl = debounce((selectedFilters: Ref<SelectedFilters>, currentPage: Ref<number>) => {
  const urlParams = new URLSearchParams(getUrlParams(selectedFilters.value, currentPage.value))
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

export const useUrlParams = (
  selectedFilters: Ref<SelectedFilters>,
  currentPage: Ref<number>,
  searchInput: Ref<string>,
  dateFromInput: Ref<string>,
  dateToInput: Ref<string>,
) => {

  onMounted(() => {
    window.addEventListener('popstate', () => {
      setFiltersFromParams(
        selectedFilters,
        currentPage,
        searchInput,
        dateFromInput,
        dateToInput,
      )
    })
  })

  return {
    changeUrl,
    setFiltersFromParams,
  }
}
