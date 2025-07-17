<script setup lang="ts">
import { computed, onMounted, ref, watch, type PropType } from 'vue';
import type { Event } from '../types/Event';
import { getFilteredEvents } from '../utilities/getFilteredEvents';
import type { SelectedFilters } from '../types/SelectedFilters.d.ts';
import type { ChartTick } from '../types/ChartTick';
import Chart from './Chart.vue';
import Spinner from './Spinner.vue';
import NavPage from './NavPage.vue';
import FilterHeader from './FilterHeader.vue';
import IconFilters from './IconFilters.vue';
import IconClose from './IconClose.vue';
import EventSummary from './EventSummary.vue';
import Filter from './Filter.vue';
import InputWrapper from './InputWrapper.vue';
import IconSearch from './IconSearch.vue';
import FilterToggleList from './FilterToggleList.vue';
import type { FilterOptions } from '../types/FilterOptions';
import IconLocation from './IconLocation.vue';
import IconTarget from './IconTarget.vue';
import debounce from 'debounce';
import IconSort from './IconSort.vue';
import Button from './Button.vue';
import Autocomplete from './Autocomplete.vue';
import InputDateRange from './InputDateRange.vue';
import { useUrlParams } from '../utilities/useUrlParams.ts';


const props = defineProps({
  chartColumns: {
    type: Number,
    required: true,
  },
  chartRows: {
    type: Number,
    required: true,
  },
  chartTicks: {
    type: Array as PropType<ChartTick[]>,
    required: true,
  },
  filters: {
    type: Object as PropType<FilterOptions>,
    required: true,
  },
  lastDate: {
    type: String,
    required: true,
  }
})

const EVENTS_PER_PAGE = 100
const SORT_BY_RECENT = false
const SORT_BY_OLDEST = true
const DEBOUNCE_DELAY = 250

const allEvents = ref<Event[]>([])
const currentPage = ref<number>(1)
const loading = ref<boolean>(true)
const selectedFilters = ref<SelectedFilters>({})
const showFilters = ref<boolean>(false)
const sortBy = ref<boolean>(SORT_BY_RECENT)
const searchInput = ref<string>('')
const dateFromInput = ref<string>('')
const dateToInput = ref<string>('')
const invalidDateRange = ref<boolean>(false)

const chartCoords = computed(() => allEvents.value.map(({x, y}) => ({x, y})))
const chartHighlightCoords = computed(() => filteredEvents.value.map(({x, y}) => ({x, y})))

const hasActiveFilters = computed(() => {
  return Object.keys(selectedFilters.value)
    .filter((type: string) => selectedFilters.value[type]?.length)
    .length > 0
})

const { changeUrl, setFiltersFromParams } = useUrlParams(
  selectedFilters,
  currentPage,
  searchInput,
  dateFromInput,
  dateToInput,
)

const resetFilters = () => {
  selectedFilters.value = {}
  searchInput.value = ''
  dateFromInput.value = ''
  dateToInput.value = ''
  changeUrl(selectedFilters, currentPage)
}

const filteredEvents = computed(() => {
  return getFilteredEvents(allEvents.value, selectedFilters.value)
})

const currentPageEvents = computed(() => {
  const newEvents = sortBy.value === SORT_BY_OLDEST
    ? filteredEvents.value.slice().reverse()
    : filteredEvents.value
  const end = EVENTS_PER_PAGE * currentPage.value
  const start = end - EVENTS_PER_PAGE
  return newEvents.slice(start, end)
})

const lastPage = computed(() => {
  return Math.ceil(filteredEvents.value.length / EVENTS_PER_PAGE)
})

const showingStart = computed(() => (currentPage.value - 1) * EVENTS_PER_PAGE)

const setPage = (newPage: number) => {
  if (newPage < 1 || newPage > lastPage.value) {
    return
  }
  currentPage.value = newPage
}

const toggleSort = () => {
  sortBy.value = !sortBy.value
  currentPage.value = 1
}

const toggleFilter = (type: string, value: string) => {
  let selected = [...selectedFilters.value[type] ?? []]
  if (selected.includes(value)) {
    selected = selected.filter(s => s !== value)
  } else {
    selected.push(value)
  }
  selectedFilters.value[type] = selected
  changeUrl(selectedFilters, currentPage)
}

const setSearch = debounce(val => {
  selectedFilters.value.search = val
  changeUrl(selectedFilters, currentPage)
}, DEBOUNCE_DELAY)
watch(searchInput, setSearch)


const isDateValid = (date: string) => {
  if (!date.length) {
    return true
  }
  return !!date.match(/[0-9]{4}\-[0-9]{2}\-[0-9]{2}/)
}
const isDateRangeValid = (from: string, to: string) => {
  return !from.length
    || !to.length
    || from <= to
}
const setDateRange = debounce(() => {
  invalidDateRange.value = !isDateValid(dateFromInput.value)
    || !isDateValid(dateToInput.value)
    || !isDateRangeValid(dateFromInput.value, dateToInput.value)
  if (invalidDateRange.value) {
    return
  }
  selectedFilters.value.dateFrom = dateFromInput.value
  selectedFilters.value.dateTo = dateToInput.value
  changeUrl(selectedFilters, currentPage)
}, 1000)
watch(dateFromInput, setDateRange)
watch(dateToInput, setDateRange)


onMounted(() => {
  fetch('./data/events.json')
    .then(r => r.json())
    .then(events => {
      allEvents.value = events
      loading.value = false
    })

  if (window.location.search) {
    setFiltersFromParams(
      selectedFilters,
      currentPage,
      searchInput,
      dateFromInput,
      dateToInput
    )
  }
})
</script>

<template>
  <div
    class="
      app-data
      min-h-[calc(100vh-var(--header-height))]
      bg-white
      xl:grid
      xl:grid-cols-12
    "
  >
    <div
      class="
        z-50
        min-h-screen
        xl:min-h-auto
        xl:col-span-7
        xl:order-2
      "
    >
      <div
        class="
          sticky
          top-(--header-height)
          z-50
        "
      >
        <Chart
          aria-hidden="true"
          :columns="chartColumns"
          :datasets="[
            {
              id: 'all-data',
              hexes: chartCoords,
              style: {
                fill: 'var(--color-chart-dim)',
              }
            },
            {
              id: 'highlights',
              hexes: chartHighlightCoords,
              style: {
                fill: 'var(--color-chart)',
              }
            },
          ]"
          :rows="chartRows"
          :ticks="chartTicks"
          class="
            min-h-28
            md:min-h-48
            xl:min-h-40
            2xl:min-h-48
            3xl:min-h-64
          "
        />
        <div
          class="
            relative
            p-2
            bg-yellow
            xl:hidden
          "
        >
          <h2 class="sr-only">Controls</h2>
          <FilterHeader
            :showResetFilters="hasActiveFilters"
            :sortBy="sortBy"
            @toggle-filters-panel="showFilters = !showFilters"
            @reset-filters="resetFilters"
            @toggle-sort="toggleSort"
          />
        </div>
      </div>
      <div
        class="
          relative
          p-4
          pt-8
          pb-32
          flex
          flex-col
          gap-16
          xl:max-w-160
        "
      >
        <div v-if="loading" class="min-h-[35vh] flex items-center justify-center gap-4 text-lg font-semibold uppercase" role="alert">
          <Spinner />
          Loading
        </div>
        <div v-else-if="!currentPageEvents.length" class="flex flex-col items-start gap-4 p-8 min-h-32 bg-red-light" role="alert">
          <div class="text-lg leading-tight">
            No events were found matching your request.
          </div>
          <Button @click="resetFilters">Reset Filters</Button>
        </div>
        <template v-else>
          <h2 class="sr-only">Events</h2>
          <EventSummary
            v-for="event in currentPageEvents"
            :key="event.id"
            :event="event"
            :countries="filters.country"
          />
        </template>
      </div>
      <div
        v-if="currentPageEvents.length"
        class="
          fixed
          bottom-4
          left-1/2
          -translate-x-1/2
          min-w-80
          max-w-[90vw]
          xl:left-auto
          xl:right-4
          xl:translate-none
        "
      >
        <h2 class="sr-only">Pages</h2>
        <NavPage
          :currentPage="currentPage"
          :lastPage="lastPage"
          :eventsPerPage="EVENTS_PER_PAGE"
          :showingStart="(showingStart + 1).toLocaleString('en-US')"
          :showingEnd="(showingStart + currentPageEvents.length).toLocaleString('en-US')"
          :total="filteredEvents.length"
          @set-page="setPage"
        />
      </div>
    </div>
    <div
      class="
        fixed
        top-45
        -bottom-4
        left-2
        right-2
        z-70
        overflow-scroll
        pb-24
        rounded
        bg-white
        shadow-lg/100
        transition-transform
        duration-300
        md:top-65
        xl:sticky
        xl:top-(--header-height)
        xl:max-h-[calc(100vh-var(--header-height))]
        xl:left-auto
        xl:right-auto
        xl:pb-8
        xl:col-span-5
        xl:order-1
        xl:translate-none
        xl:shadow-none
        xl:rounded-none
      "
      :class="[
        showFilters ? 'translate-y-0 ease-out' : 'translate-y-full ease-in',
      ]
      "
    >
      <h2 class="sr-only">Search, filter, and sort</h2>
      <div class="sticky top-0 flex items-center justify-between gap-2 z-50 bg-white xl:p-2 xl:bg-yellow">
        <div class="flex items-center gap-4">
          <div class="p-2 flex items-center gap-2">
            <IconFilters class="w-8 h-8" aria-hidden="true" />
            <span class="text-xl font-bold">
              Filters
            </span>
          </div>
          <Button
            v-if="hasActiveFilters"
            size="sm"
            @click="resetFilters"
          >
            Reset
          </Button>
        </div>
        <div class="flex items-center gap-2">
          <button
            class="hidden xl:block xl:p-2"
            @click="toggleSort"
          >
            <span class="sr-only">Sort by: {{ sortBy ? 'oldest' : 'recent' }}</span>
            <IconSort
              class="w-8 h-8"
              aria-hidden="true"
            />
          </button>
          <button
            class="flex justify-center items-center xl:hidden"
            @click="showFilters = !showFilters"
          >
            <span class="sr-only">Close Filters</span>
            <IconClose aria-hidden="true" />
          </button>
        </div>
      </div>
      <div class="flex flex-col gap-6 p-2 xl:p-4">
        <Filter>
          <template #title>
            <h3>Search</h3>
          </template>
          <InputWrapper>
            <IconSearch #icon />
            <input name="search" id="search" v-model.trim="searchInput" />
          </InputWrapper>
        </Filter>
        <div class="flex flex-col gap-6">
          <Filter>
            <template #title>
              <h3>Sector</h3>
            </template>
            <FilterToggleList
              :options="filters.area"
              :selected="selectedFilters?.area ?? []"
              @toggle="(value) => toggleFilter('area', value)"
            />
          </Filter>
          <Filter>
            <template #title>
              <h3>Campaign</h3>
            </template>
            <FilterToggleList
              :options="filters.campaign"
              :selected="selectedFilters?.campaign ?? []"
              @toggle="(value) => toggleFilter('campaign', value)"
            />
          </Filter>
        </div>
        <div class="flex flex-col gap-6">
          <Filter class="items-start">
            <template #title>
              <h3>Date Range</h3>
            </template>
            <template #description>
            </template>
            <InputDateRange
              defaultFrom="2005-01-01"
              :defaultTo="lastDate"
              name="date-range"
              v-model:date-from="dateFromInput"
              v-model:date-to="dateToInput"
            />
            <div v-if="invalidDateRange" class="bg-red px-3 py-1">
              Invalid date range!
            </div>
          </Filter>
          <Filter>
            <template #title>
              <h3>Country</h3>
            </template>
            <Autocomplete
              name="targets"
              :options="filters.country"
              :selected="selectedFilters?.country ?? []"
              @toggle="(value) => toggleFilter('country', value)"
            >
              <template #icon>
                <IconLocation aria-hidden="true"/>
              </template>
            </Autocomplete>
          </Filter>
          <Filter>
            <template #title>
              <h3>Campaign Target</h3>
            </template>
            <template #description>
              Find events related to a specific campaign target, like G4S or Elbit Systems.
            </template>
            <Autocomplete
              name="targets"
              :options="filters.target"
              :selected="selectedFilters?.target ?? []"
              @toggle="(value) => toggleFilter('target', value)"
            >
              <template #icon>
                <IconTarget aria-hidden="true" />
              </template>
            </Autocomplete>
          </Filter>
        </div>
        <div class="flex flex-col gap-6">
          <Filter>
            <template #title>
              <h3>Region</h3>
            </template>
            <FilterToggleList
              :options="filters.region"
              :selected="selectedFilters?.region ?? []"
              @toggle="(value) => toggleFilter('region', value)"
            />
          </Filter>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.slide-up-active {
  transition: all 0.3s;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(-100%);
}
</style>