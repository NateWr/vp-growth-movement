<script setup lang="ts">
import { computed, TransitionGroup, type PropType } from 'vue'
import type { ChartTick } from '../types/ChartTick'
import type { ChartHexGroup } from '../types/ChartHexGroup'
import type { ChartHex } from '../types/ChartHex'

const props = defineProps({
  columns: {
    type: Number,
    required: true,
  },
  datasets: {
    type: Array as PropType<ChartHexGroup[]>,
    required: true,
  },
  rows: {
    type: Number,
    required: true,
  },
  ticks: {
    type: Array as PropType<ChartTick[]>,
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

// One half hex width is added to ensure the hexes
// in the last column aren't cut off when the x offset
// is applied
const width = computed(() => props.columns * hexWidth + (hexWidth / 2))
const height = computed(() => props.rows * hexHeight)

const currentTicks = computed(() => {
  return props.showAllYears
    ? props.ticks
    : props.ticks.filter(t => t.major)
})

/**
 * Get the x,y position for each hex
 *
 * The x position is staggered for every other row
 * in order to create the hex layout.
 *
 * First, offset the x position of every second hex
 * based on its position in the global grid coordinate
 * system.
 *
 * Then, use this to get the correct position.
 */
const hexGroupsWithCoords = props.datasets
  .map(group => {
    const coords: ChartHex[] = group.hexes
      .map(hex => {
        const xOffsetToggle = hex.y % 2
        const x = (hex.x * hexWidth) + (xOffsetToggle * (hexWidth / 2))
        const y = hex.y * hexHeight
        return {x, y}
      })
    return {...group, coords}
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
          v-for="tick in currentTicks"
          :key="tick.x"
          class="chart-tick"
          :class="tick.major ? 'chart-tick-major' : ''"
          :style="`left: ${(tick.x / columns) * 100}%`"
        >
          <div class="chart-tick-line" />
          <span
            class="chart-tick-label"
            :style="`left: ${tick.x}%`"
          >
            {{ tick.label }}
          </span>
        </div>
      </TransitionGroup>
    </div>
    <svg
      class="chart-hexes"
      :width="width"
      :height="height"
      :viewBox="`0 0 ${width} ${height}`"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        v-for="hexGroup in hexGroupsWithCoords"
        :class="`chart-hex-group chart-hex-group-${hexGroup.id}`"
      >
        <polygon
          v-for="coords in hexGroup.coords"
          :points="
            hexPoints
              .map(pointCoords => {
                return [
                  pointCoords[0] + coords.x,
                  pointCoords[1] + coords.y,
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
    fill: var(--color-chart);
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