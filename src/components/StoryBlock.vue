<script setup lang="ts">
import { computed, ref, type PropType } from 'vue';
import ButtonWhite from './ButtonWhite.vue';
import Chart from './Chart.vue';
import { useViewportSize } from '../utilities/useViewportSize';
import type { ChartTick } from '../types/ChartTick';
import type { ChartHex } from '../types/ChartHex';
import type { Event } from '../types/Event';
import type { StoryAction } from '../types/StoryAction';

const props = defineProps({
  chartColumns: {
    type: Number,
    required: true,
  },
  chartEventCoords: {
    type: Array as PropType<ChartHex[]>,
    required: true,
  },
  chartEventCoordsHighlighted: {
    type: Array as PropType<ChartHex[]>,
    required: true,
  },
  chartRows: {
    type: Number,
    required: true,
  },
  ticks: {
    type: Array as PropType<ChartTick[]>,
    required: true,
  },
  intro: {
    type: String,
    required: true,
  },
  conclusion: {
    type: String,
    required: true,
  },
  events: {
    type: Array as PropType<Event[]>,
    required: true,
  },
  actions: {
    type: Array as PropType<StoryAction[]>,
    required: true,
  },
})

const countSlides = computed(() => props.events.length + 2)
const storyEventCoords = computed(() => props.events.map(({x, y}) => ({x, y})))
const currentSlide = ref<number>(0)

const isIntro = computed(() => !currentSlide.value)
const isConclusion = computed(() => currentSlide.value >= (countSlides.value - 1))

const { width, BREAKPOINTS } = useViewportSize()

const fitChartOnScreen = computed(() => {
  if (width.value >= BREAKPOINTS.LAPTOP_SM) {
    return true
  }
  return isIntro.value || isConclusion.value
})

const showAllYears = computed(() => {
  if (width.value >= BREAKPOINTS.LAPTOP_SM) {
    return true
  }
  return !fitChartOnScreen.value

})

const back = () => {
  if (!isIntro.value) {
    currentSlide.value--
  }
}

const next = () => {
  if (!isConclusion.value) {
    currentSlide.value++
  }
}

const xPadding = 16
const storyCurrentX = computed(() => xPadding + currentSlide.value *  10)
</script>

<template>
  <div
    :class="`
      story-wrapper
      ${!fitChartOnScreen ? 'story-wrapper-enlarged' : ''}
      relative
      h-full
    `"
  >
    <Chart
      :columns="chartColumns"
      :datasets="[
        {
          id: 'all-data',
          hexes: chartEventCoords,
        },
        {
          id: 'highlights',
          hexes: chartEventCoordsHighlighted,
        }
      ]"
      :rows="chartRows"
      :ticks="ticks"
      :showAllYears="showAllYears"
    />
    <div
      class="story-item absolute left-[5%] flex flex-col justify-end w-[90vw] max-w-96 "
      :style="`left: ${storyCurrentX}%;`"
    >
      <div
        class="
          overflow-scroll
          flex
          flex-col
          gap-2
          p-4
          bg-yellow
          text-black
        "
      >
        <div>
          May 2, 2025
        </div>
        <p>
          This is some text This is some text This is some text.
          This is some text This is some text This is some text.
          This is some text This is some text This is some text.
          This is some text This is some text This is some text.
          This is some text This is some text This is some text.
          This is some text This is some text This is some text.
          This is some text This is some text This is some text.
          This is some text This is some text This is some text.
          This is some text This is some text This is some text.
          This is some text This is some text This is some text.
          This is some text This is some text This is some text.
          This is some text This is some text This is some text.
        </p>
      </div>
    </div>
    <ButtonWhite
      class="
        fixed
        bottom-12
        left-4
      "
      @click="back"
    >
      Prev
    </ButtonWhite>
    <ButtonWhite
      class="
        fixed
        bottom-12
        right-4
      "
      @click="next"
    >
      Next ({{ currentSlide }})
    </ButtonWhite>
  </div>
</template>

<style>
.story-wrapper {
  --button-height: 8rem;
  width: 100vw;
  transition: all 0.5s;
}
.story-wrapper-enlarged {
  width: 300vw;
}
.story-wrapper .chart-wrapper {
  align-items: flex-end;
  padding-bottom: var(--button-height);
}
.story-wrapper .chart-hexes {
  height: 25vh;
  fill: var(--color-chart-dim);
}
.story-wrapper .chart-hex-group-highlights {
  fill: var(--color-chart);
}
.story-item {
  bottom: calc(25vh + var(--button-height));
  top: 1rem;
}
</style>