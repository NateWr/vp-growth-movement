<script setup lang="ts">
import { computed, TransitionGroup, type PropType } from 'vue'

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
    type: Array as PropType<String[]>,
    default: [],
  },
  showAllYears: {
    type: Boolean,
    default: false,
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

const rows = computed(() => {
  let r = 0
  return props.months
    .reduce((max, month) => {
      return Math.max(month.events.length, max)
    }, r)
})

const hexWidth = 9
const hexHeight = 8
const hexPoints = [
  [3.5, 0],
  [7, 2],
  [7, 6],
  [3.5, 8],
  [0, 6],
  [0, 2],
]

const width = computed(() => props.months.length * hexWidth)
const height = computed(() => rows.value * hexHeight)

const hexes = computed(() => {
  return props.months
    .map((month, col) => {
      // Get the row number of the top hex
      // for this month, so that hexes are
      // centered around the middle row.
      //
      // For months with an odd number of events, we add
      // an event to make their row assignments
      // consistent with months with even events
      let eventsCount = month.events.length + month.events.length % 2
      let topRow = Math.floor((rows.value - eventsCount) / 2)

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

          return [x, y, event.id]
        })
    })
    .flat()
})

const allTicks = computed(() => {
  return props.months
    .map((month, col) => {
      const date = new Date(month.month)
      if (date.getMonth()) {
        return
      }
      return {
        year: date.getFullYear(),
        x: (col * hexWidth) / width.value,
        isMajorTick: col % 5 === 0,
      }
    })
    .filter(m => m)
}, [])

const ticks = computed(() => {
  if (props.showAllYears) {
    return allTicks.value
  }
  return allTicks.value.filter(t => t.isMajorTick)
})
</script>

<template>
  <div
    class="chart-wrapper bg-black"
    :class="highlights.length ? 'chart-wrapper-with-highlights' : ''"
    aria-hidden="true"
  >
    <div class="chart-ticks font-mono">
      <TransitionGroup name="chart-ticks" appear>
        <div
          v-for="tick in ticks"
          :key="tick.year"
          class="chart-tick"
          :class="tick?.isMajorTick ? 'chart-tick-major' : ''"
          :style="`left: ${tick.x * 100}%`"
        >
          <div class="chart-tick-line" />
          <span
            class="chart-tick-label"
            :style="`left: ${tick.x}%`"
          >
            {{ tick.year }}
          </span>
        </div>
      </TransitionGroup>
    </div>
    <svg
      class="chart-hexes"
      :width="width"
      :height="height"
      :viewBox="`0 0 ${width} ${height}`"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <polygon
        v-for="hex in hexes"
        :class="highlights.includes(hex[2]) ? 'chart-hex-highlighted' : ''"
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
    </svg>
  </div>
</template>

<style>
  .chart-wrapper {
    --padding-x: 1rem;
    position: relative;
    display: flex;
    align-items: center;
    padding-left: var(--padding-x);
    padding-right: var(--padding-x);
    background: var(--color-black);
    height: 100%;
  }
  .chart-ticks {
    position: absolute;
    left: var(--padding-x);
    right: var(--padding-x);
    top: 0;
    bottom: 0;
    color: var(--color-white);
    opacity: 0.5;
  }
  .chart-tick {
    position: absolute;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    transform: translateX(-50%);
  }
  .chart-tick-line {
    flex-grow: 1;
    border-left: 1px solid;
    opacity: 0.25;
  }
  .chart-tick-major .chart-tick-line {
    opacity: 0.5;
  }
  .chart-tick-label {
    font-size: 0.75rem;
  }
  .chart-hexes {
    position: relative;
    width: 100%;
    height: auto;
  }
  .chart-hexes polygon {
    fill: var(--color-red);
  }
  .chart-wrapper-with-highlights .chart-hexes polygon {
    fill: var(--color-red-dark);
  }
  .chart-wrapper-with-highlights .chart-hexes .chart-hex-highlighted {
    fill: var(--color-red);
  }
  .chart-ticks-active,
  .chart-ticks-enter-active,
  .chart-ticks-leave-active {
    transition: opacity 0.5s 0.2s;
  }
  .chart-ticks-leave-active {
    transition-duration: 0.2s;
    transition-delay: 0s;
  }
  .chart-ticks-enter-from,
  .chart-ticks-leave-to {
    opacity: 0;
  }
</style>