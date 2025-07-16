<script setup lang="ts">
import { computed, onMounted, ref, type PropType } from 'vue';
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
    type: Object as PropType<SelectedFilters>,
    required: true,
  }
})

const EVENTS_PER_PAGE = 100
const SORT_BY_RECENT = false
const SORT_BY_OLDEST = true

const allEvents = ref<Event[]>([])
const currentPage = ref<number>(1)
const loading = ref<boolean>(true)
const selectedFilters = ref<SelectedFilters>({})
const showFilters = ref<boolean>(false)
const sortBy = ref<boolean>(SORT_BY_RECENT)

const chartCoords = computed(() => allEvents.value.map(({x, y}) => ({x, y})))
const chartHighlightCoords = computed(() => filteredEvents.value.map(({x, y}) => ({x, y})))

const hasActiveFilters = computed(() => {
  return Object.keys(selectedFilters.value).length > 0
})

const resetFilters = () => selectedFilters.value = {}

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
onMounted(() => {
  fetch('./data/events.json')
    .then(r => r.json())
    .then(events => {
      allEvents.value = events
      loading.value = false
    })
})
</script>

<template>
  <div
    class="
      app-data
      bg-white
      xl:grid
      xl:grid-cols-12
    "
  >
    <div
      class="
        z-50
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
        <div
          v-if="loading"
          class="
            min-h-[35vh]
            flex
            items-center
            justify-center
            gap-4
            text-lg
            font-semibold
            uppercase
          "
          role="alert"
        >
          <Spinner />
          Loading
        </div>
        <template v-else>
          <h2 class="sr-only">Events</h2>
          <EventSummary
            v-for="event in currentPageEvents"
            :key="event.id"
            :event="event"
          />
        </template>
      </div>
      <div
        v-if="lastPage > 1"
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
        xl:static
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
      <div class="sticky top-0 flex items-center justify-between gap-2 bg-white xl:bg-yellow">
        <div class="p-2 flex items-center gap-2">
          <IconFilters class="w-8 h-8" aria-hidden="true" />
          <span class="text-xl font-bold">
            Filters
          </span>
        </div>
        <div class="flex items-center gap-2 xl:hidden">
          <button
            class="flex justify-center items-center"
            @click="showFilters = !showFilters"
          >
            <span class="sr-only">Close Filters</span>
            <IconClose aria-hidden="true" />
          </button>
        </div>
      </div>
      <div>...{{ filteredEvents.length }}/{{ allEvents.length }} items...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
      <div>...filters...</div>
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