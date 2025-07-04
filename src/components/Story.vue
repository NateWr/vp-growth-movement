<script setup lang="ts">
import { computed, ref, type PropType } from 'vue';
import ButtonWhite from './ButtonWhite.vue';
import Chart from './Chart.vue';
import { useViewportSize } from '../utilities/useViewportSize';

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
  story: {
    type: Object,
    required: true,
  },
})

const showIntro = ref(true)
const showConclusion = ref(false)
const storyCurrent = ref(null)

const { width, BREAKPOINTS } = useViewportSize()

const highlights = computed(() => {
  return props.months
    .map(m => m.events)
    .flat()
    .filter(e => e)
    .filter((e, i) => i % 5 === 0)
    .map(e => e.id)
})

const fitChartOnScreen = computed(() => {
  if (width.value >= BREAKPOINTS.LAPTOP_SM) {
    return true
  }
  return showIntro.value || showConclusion.value
})

const showAllYears = computed(() => {
  if (width.value >= BREAKPOINTS.LAPTOP_SM) {
    return true
  }
  return !fitChartOnScreen.value

})

const next = () => {
  if (showConclusion.value) {
    return
  } else if (showIntro.value) {
    showIntro.value = false
    storyCurrent.value = 0
    return
  } else if (storyCurrent.value > props.story.events.length) {
    showConclusion.value = true
    storyCurrent.value++
    return
  }
  storyCurrent.value++
}

const back = () => {
  if (showConclusion.value) {
    showConclusion.value = false
    storyCurrent.value--
    return
  } else if (storyCurrent.value == 0) {
    showIntro.value = true
    storyCurrent.value = null
    return
  }
  storyCurrent.value--
}

const xPadding = 16
const storyCurrentX = computed(() => xPadding + (storyCurrent.value ?? 0) *  10)
</script>

<template>
  <div :class="`
    story-wrapper
    ${!fitChartOnScreen ? 'story-wrapper-enlarged' : ''}
    relative
    h-full
  `">
    <Chart
      :dateStart="dateStart"
      :dateEnd="dateEnd"
      :highlights="highlights"
      :months="months"
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
      Next ({{ storyCurrent }})
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
  width: 200vw;
}
.story-wrapper .chart-wrapper {
  align-items: flex-end;
  padding-bottom: var(--button-height);
}
.story-wrapper .chart-hexes {
  height: 25vh;
}
.story-item {
  bottom: calc(25vh + var(--button-height));
  top: 1rem;
}
</style>