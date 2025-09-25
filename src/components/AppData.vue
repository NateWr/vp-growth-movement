<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useTemplateRef, watch, type PropType } from 'vue';
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
import EventDetails from './EventDetails.vue';
import { useViewportSize } from '../utilities/useViewportSize.ts';
import type { FilterOption } from '../types/FilterOption';
import { watchIgnorable } from '@vueuse/core';


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
  firstDate: {
    type: String,
    required: true,
  },
  lastDate: {
    type: String,
    required: true,
  },
})

const EVENTS_PER_PAGE = 100
const SORT_BY_RECENT = true
const SORT_BY_OLDEST = false
const DEBOUNCE_DELAY = 250

const allEvents = ref<Event[]>([])
const currentPage = ref<number>(1)
const loading = ref<boolean>(true)
const selectedFilters = ref<SelectedFilters>({})
const showFilters = ref<boolean>(false)
const sortBy = ref<boolean>(SORT_BY_OLDEST)
const searchInput = ref<string>('')
const dateFromInput = ref<string>('')
const dateToInput = ref<string>('')
const invalidDateRange = ref<boolean>(false)
const $events = useTemplateRef('events')

const chartCoords = computed(() => allEvents.value.map(({x, y}) => ({x, y})))
const chartHighlightCoords = computed(() => filteredEvents.value.map(({x, y}) => ({x, y})))

const { width, BREAKPOINTS } = useViewportSize()

const hasActiveFilters = computed(() => {
  return Object.keys(selectedFilters.value)
    .filter((type: string) => selectedFilters.value[type]?.length)
    .length > 0
})

const resetFilters = () => {
  selectedFilters.value = {}
  searchInput.value = ''
  dateFromInput.value = ''
  dateToInput.value = ''
  currentPage.value = 1
  sortBy.value = SORT_BY_OLDEST,
  resetEventsView()
  changeUrl()
}

const resetEventsView = () => {
  window.scrollTo(0, 0)
  nextTick(() => setFocusedEvent())
}

const filteredEvents = computed(() => {
  return getFilteredEvents(allEvents.value, selectedFilters.value)
})

/*
 * Disable filters that can not be combined with
 * the currently selected filters
 *
 * This disables filter options when the current set of
 * filtered events have no events matching those filter
 * options. This prevents users from going down dead
 * ends by selecting a filter combination with no events.
 *
 * Filter options are only disabled for filter types that
 * aren't currently selected. For example, when one region
 * is selected, all other regions remain enabled. This
 * ensures that users can always add another filter option
 * to expand the number of filter events.
 */
const disabledFilters = computed(() => {
  const unselectedFilterTypes = Object.keys(props.filters)
    .filter(type => !selectedFilters.value[type]?.length)

  let validFilters : SelectedFilters = {}
  filteredEvents.value.reduce(
    (validFilters: SelectedFilters, event: Event[]) => {
      unselectedFilterTypes.forEach((type: string) => {
        if (event[type]?.length) {
          validFilters[type] = validFilters[type] ?? []
          validFilters[type].push(...event[type])
        }
      })
      return validFilters
    },
    validFilters
  )

  let disabled : SelectedFilters = {}
  unselectedFilterTypes.forEach((type: string) => {
    const validOptions = [...new Set(validFilters[type])]
    disabled[type] = props.filters[type]
      .filter((option: FilterOption) => !validOptions.includes(option.value))
  })

  return disabled
})

const currentPageEvents = computed(() => {
  const newEvents = sortBy.value === SORT_BY_RECENT
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
  resetEventsView()
  changeUrl()
}

const toggleSort = () => {
  sortBy.value = !sortBy.value
  currentPage.value = 1
  resetEventsView()
  changeUrl()
}

const toggleFilter = (type: string, value: string) => {
  let selected = [...selectedFilters.value[type] ?? []]
  if (selected.includes(value)) {
    selected = selected.filter(s => s !== value)
  } else {
    selected.push(value)
  }
  selectedFilters.value[type] = selected
  currentPage.value = 1
  resetEventsView()
  changeUrl()
}

const setSearch = debounce((val: string, oldVal: string) => {
  selectedFilters.value.search = val
  currentPage.value = 1
  resetEventsView()
  changeUrl()
}, DEBOUNCE_DELAY)
const { ignoreUpdates: ignoreSearchInputUpdates } = watchIgnorable(searchInput, setSearch)


const isDateValid = (date: string) => {
  if (!date.length) {
    return true
  }
  return !isNaN((new Date(date)).getTime())
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
  currentPage.value = 1
  resetEventsView()
  changeUrl()
}, DEBOUNCE_DELAY)
const { ignoreUpdates: ignoreDateFromInputUpdates } = watchIgnorable(dateFromInput, setDateRange)
const { ignoreUpdates: ignoreDateToInputUpdates } = watchIgnorable(dateToInput, setDateRange)

const firstDateTimestamp = computed(() => (new Date(props.firstDate)).getTime())
const lastDateTimestamp = computed(() => (new Date(props.lastDate)).getTime())
const chartDateRangeFrom = computed(() => {
  if (!selectedFilters.value?.dateFrom) {
    return selectedFilters.value?.dateTo
      ? 0
      : -1
  }
  const timestamp = (new Date(selectedFilters.value?.dateFrom ?? '')).getTime()
  const total = lastDateTimestamp.value - firstDateTimestamp.value
  return Math.max(0, ((timestamp - firstDateTimestamp.value) / total) * 100)
})
const chartDateRangeTo = computed(() => {
  if (!selectedFilters.value?.dateTo) {
    return selectedFilters.value?.dateFrom
      ? 100
      : -1
  }
  const timestamp = (new Date(selectedFilters.value?.dateTo ?? '')).getTime()
  const total = lastDateTimestamp.value - firstDateTimestamp.value
  return Math.min(100, ((timestamp - firstDateTimestamp.value) / total) * 100)
})

watch(showFilters, (newValue) => {
  const hasClass = document.body.className.includes('overflow-hidden')
  if (newValue && !hasClass) {
    document.body.className += ' overflow-hidden'
  } else if (!newValue && hasClass) {
    document.body.className = document.body.className.replace('overflow-hidden', '').trim()
  }
})

const storyPointsScale = computed(() => {
  switch (true) {
    case (width.value >= BREAKPOINTS.LAPTOP_XL):
      return 1.5
    case (width.value >= BREAKPOINTS.LAPTOP):
      return 2
    case (width.value >= BREAKPOINTS.TABLET):
      return 3
    default:
      return 4
  }
})

const focusedEvent = ref<Event|null>(null)
const setFocusedEvent = () => {
  if (!$events.value) {
    return
  }
  const $event = $events.value?.find(({$el}) => {
    const pos = $el.offsetTop - window.scrollY
    return pos > -200 && pos < 200
  })

  if ($event) {
    focusedEvent.value = $event?.$props.event
  }
}

const { changeUrl } = useUrlParams(
  selectedFilters,
  currentPage,
  searchInput,
  ignoreSearchInputUpdates,
  dateFromInput,
  ignoreDateFromInputUpdates,
  dateToInput,
  ignoreDateToInputUpdates,
  sortBy
)

onMounted(() => {
  fetch('/data/events.json')
    .then(r => r.json())
    .then(events => {
      allEvents.value = events
      loading.value = false
      nextTick(setFocusedEvent)
    })

  window.document.addEventListener('scroll', setFocusedEvent)
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
        relative
        z-50
        min-h-screen
        xl:min-h-auto
        xl:col-span-7
        xl:order-2
        4xl:col-span-9
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
          :highlightEvent="focusedEvent"
          :datasets="[
            {
              id: 'all-data',
              hexes: chartCoords,
              style: {
                fill: 'var(--color-chart)',
              }
            },
            {
              id: 'highlights',
              hexes: chartHighlightCoords,
              style: {
                fill: 'var(--color-chart-highlight)',
              }
            },
          ]"
          :dateRangeFrom="chartDateRangeFrom"
          :dateRangeTo="chartDateRangeTo"
          :rows="chartRows"
          :storyPointsScale="storyPointsScale"
          :ticks="chartTicks"
          class="
            py-8
          "
        />
        <div
          class="
            relative
            p-2
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
          2xl:max-w-none
          3xl:p-12
          3xl:pb-32
          3xl:gap-20
        "
      >
        <div v-if="loading" class="min-h-[35vh] flex items-center justify-center gap-4 text-lg font-semibold uppercase" role="alert">
          <Spinner />
          Loading
        </div>
        <div v-else-if="!currentPageEvents.length" class="flex flex-col items-start gap-4 p-8 min-h-32 bg-yellow" role="alert">
          <div class="text-lg leading-tight">
            No events were found matching your request.
          </div>
          <Button @click="resetFilters">Reset Filters</Button>
        </div>
        <template v-else>
          <h2 class="sr-only">Events</h2>
          <EventDetails
            v-for="event in currentPageEvents"
            :key="event.id"
            ref="events"
            class="max-w-360 m-auto"
            :data-id="event.id"
            :event="event"
            :areas="filters.area"
            :campaigns="filters.campaign"
            :countries="filters.country"
            :targets="filters.target"
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
        md:left-4
        md:right-4
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
        4xl:col-span-3
      "
      :class="[
        showFilters ? 'translate-y-0 ease-out' : 'translate-y-full ease-in',
      ]"
    >
      <h2 class="sr-only">Search, filter, and sort</h2>
      <div class="sticky top-0 flex items-center justify-between gap-2 z-50 bg-white 3xl:px-4">
        <div class="flex items-center gap-4">
          <div class="p-2 flex items-center gap-2 md:p-4">
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
            class="hidden xl:block xl:p-4"
            @click="toggleSort"
          >
            <span class="sr-only">Sort by: {{ sortBy ? 'oldest' : 'recent' }}</span>
            <IconSort
              class="w-8 h-8"
              aria-hidden="true"
            />
          </button>
          <button
            class="flex justify-center items-center md:p-2 xl:hidden"
            @click="showFilters = !showFilters"
          >
            <span class="sr-only">Close Filters</span>
            <IconClose aria-hidden="true" />
          </button>
        </div>
      </div>
      <div class="flex flex-col gap-6 p-2 md:p-4 3xl:p-8 3xl:gap-8">
        <Filter class="3xl:col-span-2">
          <template #title>
            <h3>Search</h3>
          </template>
          <InputWrapper>
            <IconSearch #icon />
            <input name="search" id="search" v-model.trim="searchInput" />
          </InputWrapper>
        </Filter>
        <Filter>
          <template #title>
            <h3>Country</h3>
          </template>
          <Autocomplete
            name="targets"
            :disabled="disabledFilters.country"
            :options="filters.country"
            :selected="selectedFilters?.country ?? []"
            @toggle="(value) => toggleFilter('country', value)"
          >
            <template #icon>
              <IconLocation aria-hidden="true"/>
            </template>
          </Autocomplete>
        </Filter>
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
            <h3>Category</h3>
          </template>
          <FilterToggleList
            :disabled="disabledFilters.area"
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
            :disabled="disabledFilters.campaign"
            :options="filters.campaign"
            :selected="selectedFilters?.campaign ?? []"
            @toggle="(value) => toggleFilter('campaign', value)"
          />
        </Filter>
        <Filter>
          <template #title>
            <h3>Region</h3>
          </template>
          <FilterToggleList
            :disabled="disabledFilters.region"
            :options="filters.region"
            :selected="selectedFilters?.region ?? []"
            @toggle="(value) => toggleFilter('region', value)"
          />
        </Filter>
        <Filter>
          <template #title>
            <h3>Target Organization</h3>
          </template>
          <FilterToggleList
            :disabled="disabledFilters.target"
            :options="filters.target"
            :selected="selectedFilters?.target ?? []"
            @toggle="(value) => toggleFilter('target', value)"
          />
        </Filter>
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