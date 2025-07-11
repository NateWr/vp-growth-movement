<script setup lang="ts">
import { computed, TransitionGroup, type PropType } from 'vue'
import hexConfig from '../utilities/hexConfig'
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
  storyPointCurrent: {
    type: Object as PropType<ChartHex | null>,
    default: null,
  },
  storyPointCurrentScale: {
    type: Number,
    default: 4.0,
  },
})

// Size of the hex for story points
const storyHexWidth = computed(() => props.storyPointsScale * hexConfig.gridSize[0])
const storyHexHeight = computed(() => props.storyPointsScale * hexConfig.gridSize[1])

// Size of the hex for the current point
const storyCurrentHexSize = computed(() => hexConfig.size.map(h => h * props.storyPointCurrentScale))

// One half hex width is added to ensure the hexes
// in the last column aren't cut off when the x offset
// is applied or story hex is featured
const width = computed(() => props.columns * hexConfig.gridSize[0] + storyHexWidth.value)
const height = computed(() => props.rows * hexConfig.gridSize[1] + (storyHexHeight.value / 2))

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
const getCoords = (hexes: ChartHex[], scale: number = 1) => {
  const scaleOffsetX = ((scale * hexConfig.size[0]) - hexConfig.size[0]) / 2
  const scaleOffsetY = ((scale * hexConfig.size[1]) - hexConfig.size[1]) / 2
  return hexes.map(hex => {
    const xOffsetToggle = hex.y % 2
    const x = (hex.x * hexConfig.gridSize[0]) + (xOffsetToggle * (hexConfig.gridSize[0] / 2)) - scaleOffsetX
    const y = hex.y * hexConfig.gridSize[1] - scaleOffsetY
    return { x, y }
  })
}

const datasetsWithCoords = computed(() => {
  return props.datasets.map(dataset => {
    const coords = getCoords(dataset.hexes)
    return { ...dataset, coords }
  })
})

const storyCoords = computed(() => {
  return getCoords(props.storyPoints, props.storyPointsScale)
})

const storyCurrentCoords = computed(() => {
  if (!props.storyPointCurrent) {
    return
  }
  return getCoords([props.storyPointCurrent], props.storyPointCurrentScale)[0]
})
</script>

<template>
  <div class="chart-wrapper bg-black" :class="highlights.length ? 'chart-wrapper-with-highlights' : ''"
    aria-hidden="true">
    <div class="chart-ticks font-mono">
      <TransitionGroup name="chart-ticks" appear>
        <div v-for="tick in currentTicks" :key="tick.x" class="chart-tick" :class="tick.major ? 'chart-tick-major' : ''"
          :style="`left: ${(tick.x / columns) * 100}%`">
          <div class="chart-tick-line" />
          <span class="chart-tick-label" :style="`left: ${tick.x}%`">
            {{ tick.label }}
          </span>
        </div>
      </TransitionGroup>
    </div>
    <svg class="chart-hexes" :width="width" :height="height" :viewBox="`0 0 ${width} ${height}`" fill="currentColor"
      xmlns="http://www.w3.org/2000/svg">
      <g v-for="dataset in datasetsWithCoords" :class="`chart-hex-group chart-hex-group-${dataset.id}`">
        <polygon v-for="coords in dataset.coords" :points="hexConfig.points
            .map(pointCoords => {
              return [
                pointCoords[0] + coords.x,
                pointCoords[1] + coords.y,
              ].join(',')
            })
            .join(' ')
          " />
      </g>
      <g v-if="storyCoords.length" class="chart-hex-group chart-hex-group-story">
        <template v-for="(coords, i) in storyCoords">
          <line v-if="i" :x1="storyCoords[i - 1].x + (storyHexWidth / 2)"
            :y1="storyCoords[i - 1].y + (storyHexHeight / 2)" :x2="coords.x + (storyHexWidth / 2)"
            :y2="coords.y + (storyHexHeight / 2)" />
        </template>
        <polygon v-for="(coords, i) in storyCoords" :points="hexConfig.points
            .map(pointCoords => {
              return [
                (pointCoords[0] * storyPointsScale) + coords.x,
                (pointCoords[1] * storyPointsScale) + coords.y,
              ].join(',')
            })
            .join(' ')
          " />
      </g>
      <g
        v-if="storyCurrentCoords"
        class="chart-hex-group chart-hex-group-story chart-hex-group-story-current"
      >
        <Transition name="chart-draw-line" appear>
          <line
            :key="storyCurrentCoords.x"
            :x1="storyCurrentCoords.x + (storyCurrentHexSize[0] / 2)"
            :y1="storyCurrentCoords.y + (storyCurrentHexSize[1] / 2)"
            :x2="storyCurrentCoords.x + (storyCurrentHexSize[0] / 2)"
            :y2="-100"
          />
        </Transition>
        <Transition name="chart-draw-hex" appear>
          <polygon
            :key="storyCurrentCoords.x"
            :points="hexConfig.points
              .map(pointCoords => {
                return [
                  (pointCoords[0] * storyPointCurrentScale) + storyCurrentCoords.x,
                  (pointCoords[1] * storyPointCurrentScale) + storyCurrentCoords.y,
                ].join(',')
              })
              .join(' ')
            " />
        </Transition>
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
  border-left: 1px dashed;
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

.chart-draw-line-enter-active {
  stroke-dasharray: 400;
  stroke-dashoffset: 0;
  transition: all 0.4s;
  transition-delay: 0.4s;
}

.chart-draw-line-leave-active {
  transition: none;
}

.chart-draw-line-enter-from,
.chart-draw-line-leave-to {
  stroke-dashoffset: 400;
}

.chart-draw-hex-enter-active {
  stroke-dasharray: 200;
  stroke-dashoffset: 0;
  transition: opacity 0.3s, stroke-dashoffset 0.4s 0.2s;
}

.chart-draw-hex-leave-active {
  transition: none;
}

.chart-draw-hex-enter-from,
.chart-draw-hex-leave-to {
  stroke-dashoffset: 200;
}
</style>

