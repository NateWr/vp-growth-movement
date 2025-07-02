<script setup lang="ts">
import { type PropType } from 'vue'

const props = defineProps({
  dateStart: {
    type: String,
    required: true,
  },
  dateEnd: {
    type: String,
    required: true,
  },
  months: {
    type: Array as PropType<Object[]>,
    required: true,
  },
  highlights: {
    type: Array as PropType<Object[]>,
    default: [],
  },
  storyCurrent: {
    type: String,
    default: '',
  },
  storyHighlights: {
    type: Array as PropType<Object[]>,
    default: [],
  },
})

let rows = 0
rows = props.months
  .reduce((max, month) => {
    return Math.max(month.events.length, max)
  }, rows)


const hexWidth = 9
const hexHeight = 8
const padding = 32
const width = (props.months.length * hexWidth) + (padding * 2)
const height = rows * hexHeight + (padding * 2)

const hexPoints = [
  [3.5, 0],
  [7, 2],
  [7, 6],
  [3.5, 8],
  [0, 6],
  [0, 2],
]


const hexes = props.months
  .map((month, col) => {
    // Get the row number of the top hex
    // for this month, so that hexes are
    // centered around the middle row.
    //
    // For months with an odd number of events, we add
    // an event to make their row assignments
    // consistent with months with even events
    let eventsCount = month.events.length + month.events.length % 2
    let topRow = Math.floor((rows - eventsCount) / 2)

    return month.events
      .map((event, e) => {
        // Y position is consistent for all rows
        const y = ((topRow + e) * hexHeight)

        // X position is staggered for every other
        // row in order to create the hex layout.
        //
        // First, offset the x position of every second hex
        // based on its position in the global grid
        // coordinate system.
        //
        // Then, use this to get the correct x position
        const xOffsetToggle = (topRow + e) % 2
        const x = (col * hexWidth) + (xOffsetToggle * (hexWidth / 2))

        return [x, y, event.date, col, topRow + e]
      })
  })
  .flat()
</script>

<template>
  <div class="chart">
    <div>Start: {{ dateStart }}</div>
    <div>End: {{ dateEnd }}</div>
    <svg
      class="chart-svg bg-black"
      :width="width"
      :height="height"
      :viewBox="`0 0 ${width} ${height}`"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g class="chart-hexes" transform="translate(32, 32)">
        <polygon
          v-for="hex in hexes"
          :data-date="hex[2]"
          :points="
            hexPoints
              .map((coords, i) => {
                return [
                  coords[0] + hex[0],
                  coords[1] + hex[1],
                ].join(',')
              })
              .join(' ')
          "
        />
      </g>
    </svg>
  </div>
</template>

<style>
  .chart {
    background: darkblue;
  }
  .chart-svg {
    width: 100%;
    height: auto;
  }
  .chart-hexes polygon {
    fill: var(--color-red);
  }
</style>