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
  storyPoints: {
    type: Array as PropType<ChartHex[]>,
    default: [],
  },
  storyPointsScale: {
    type: Number,
    default: 2.5,
  },
})

// SVG polygon points
const hexPoints = [
  [3.5, 0],
  [7, 2],
  [7, 6],
  [3.5, 8],
  [0, 6],
  [0, 2],
]
const hexSize = [
  hexPoints.map(([x, y]) => x).sort().reverse()[0],
  hexPoints.map(([x, y]) => y).sort().reverse()[0],
]
const hexWidth = hexSize[0] + 2
const hexHeight = hexSize[1]

// Size of the large story hex
const storyHexWidth = computed(() => props.storyPointsScale * hexWidth)
const storyHexHeight = computed(() => props.storyPointsScale * hexHeight)

// One half hex width is added to ensure the hexes
// in the last column aren't cut off when the x offset
// is applied
const width = computed(() => props.columns * hexWidth + (storyHexWidth.value / 2))
const height = computed(() => props.rows * hexHeight + (storyHexHeight.value / 2))

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
const getCoords = (hexes: ChartHex[]) => {
  return hexes.map(hex => {
    const xOffsetToggle = hex.y % 2
    const x = (hex.x * hexWidth) + (xOffsetToggle * (hexWidth / 2))
    const y = hex.y * hexHeight
    return {x, y}
  })
}

const datasetsWithCoords = computed(() => {
  return props.datasets.map(dataset => {
    const coords = getCoords(dataset.hexes)
    return {...dataset, coords}
  })
})

const storyCoords = computed(() => {
  const scaleOffsetX = ((props.storyPointsScale * hexSize[0]) - hexSize[0]) / 2
  const scaleOffsetY = ((props.storyPointsScale * hexSize[1]) - hexSize[1]) / 2
  return getCoords(props.storyPoints)
    .map(({x, y}) => {
      return {
        x: x - scaleOffsetX,
        y: y - scaleOffsetY,
      }
    })
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
        v-for="dataset in datasetsWithCoords"
        :class="`chart-hex-group chart-hex-group-${dataset.id}`"
      >
        <polygon
          v-for="coords in dataset.coords"
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
      <g
        v-if="storyCoords.length"
        class="chart-hex-group chart-hex-group-story"
      >
        <template v-for="(coords, i) in storyCoords">
          <line
            v-if="i"
            :x1="storyCoords[i - 1].x + (storyHexWidth / 2)"
            :y1="storyCoords[i - 1].y + (storyHexHeight / 2)"
            :x2="coords.x + (storyHexWidth / 2)"
            :y2="coords.y + (storyHexHeight / 2)"
          />
        </template>
        <polygon
          v-for="coords in storyCoords"
          :points="
            hexPoints
              .map(pointCoords => {
                return [
                  (pointCoords[0] * storyPointsScale) + coords.x,
                  (pointCoords[1] * storyPointsScale) + coords.y,
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