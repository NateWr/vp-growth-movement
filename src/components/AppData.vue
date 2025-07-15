<script setup lang="ts">
import { computed, onMounted, ref, type PropType } from 'vue';
import type { Event } from '../types/Event';
import { getFilteredEvents } from '../utilities/getFilteredEvents';
import type { SelectedFilters } from '../types/SelectedFilters.d.ts';
import type { ChartTick } from '../types/ChartTick';
import Chart from './Chart.vue';
import IconFilters from './IconFilters.vue';
import ButtonBlack from './ButtonBlack.vue';
import Button from './Button.vue';
import IconSort from './IconSort.vue';
import Spinner from './Spinner.vue';
import IconArrowUpRight from './IconArrowUpRight.vue';


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
  return newEvents.slice(0, EVENTS_PER_PAGE * currentPage.value)
})

const toggleSort = () => {
  sortBy.value = !sortBy.value
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
      xl:grid
      xl:grid-cols-12
    "
  >
    <div
      class="
        relative
        xl:col-span-7
        xl:order-2
      "
    >
      <div
        class="
          sticky
          top-(--header-height)
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
            p-2
            flex
            items-center
            justify-between
            bg-yellow
          "
        >
          <h2 class="sr-only">Controls</h2>
          <div class="flex items-center gap-2">
            <ButtonBlack
              @click="showFilters = !showFilters"
            >
              <IconFilters aria-hidden="true" />
              <span>
                Filters
              </span>
            </ButtonBlack>
            <Button
              v-if="hasActiveFilters"
              @click="resetFilters"
            >
              Reset
            </Button>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="toggleSort"
            >
              <span class="sr-only">Sort by: {{ sortBy ? 'oldest' : 'recent' }}</span>
              <IconSort
                class="w-10 h-10"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>
      <div
        class="
          p-4
          flex
          flex-col
          gap-16
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
          <div
            v-for="event in currentPageEvents"
            :key="event.id"
          >
            <article
              class="
                flex
                flex-col
                gap-4
              "
            >
              <div
                class="
                  flex
                  flex-col
                  gap-1
                "
              >
                <div
                  class="
                    font-semibold
                    uppercase
                  "
                >
                  {{ event.dateFormatted }}
                </div>
                <h3
                  class="
                    text-xl
                    leading-tight
                    font-bold
                  "
                >
                  {{ event.headline }}
                </h3>
                <div
                  v-if="event.country"
                  class="

                  "
                >
                  <span v-if="event.city">
                    {{ event.city }},
                  </span>
                  <span>
                    {{ event.country.join(', ') }}
                  </span>
                </div>
              </div>
              <div
                class="
                  text-lg

                "
              >
                {{ event.summary }}
              </div>
              <div>
                <Button>
                  <IconArrowUpRight aria-hidden="true" />
                  View Event
                </Button>
              </div>
            </article>
          </div>
        </template>
      </div>
    </div>
    <div
      class="
        xl:col-span-5
        xl:order-1
      "
    >
      <div>...{{ filteredEvents.length }}/{{ allEvents.length }} items...</div>
      <div>...filters...</div>
    </div>
  </div>
</template>
