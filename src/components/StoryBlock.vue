<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch, type PropType } from 'vue';
import ButtonWhite from './ButtonWhite.vue';
import Chart from './Chart.vue';
import { useViewportSize } from '../utilities/useViewportSize';
import type { ChartTick } from '../types/ChartTick';
import type { ChartHex } from '../types/ChartHex';
import type { StoryEvent } from '../types/StoryEvent.d.ts';
import { StoryEventPositionOrigin } from '../types/StoryEventPosition.d.ts';
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
    type: Array as PropType<StoryEvent[]>,
    required: true,
  },
  actions: {
    type: Array as PropType<StoryAction[]>,
    required: true,
  },
})

const scrollRef = useTemplateRef('scroll-ref')
const eventRefs = useTemplateRef('event-ref')

const currentEventIndex = ref<number>(-1)
const started = ref<boolean>(false)
const finished = ref<boolean>(false)

const storyEventCoords = computed(() => props.events.map(({x, y}) => ({x, y})))

const currentEventRef = computed(() => {
  return eventRefs.value?.find((e, i) => i === currentEventIndex.value)
})

const { width, BREAKPOINTS } = useViewportSize()

const fitChartOnScreen = computed(() => {
  if (width.value >= BREAKPOINTS.LAPTOP_SM) {
    return true
  }
  return !started.value || finished.value
})

const showAllYears = computed(() => {
  if (width.value >= BREAKPOINTS.LAPTOP_SM) {
    return true
  }
  return !fitChartOnScreen.value

})

const back = () => {
  if (finished.value) {
    finished.value = false
    currentEventIndex.value = props.events.length - 1
  } else if (currentEventIndex.value <= 0) {
    started.value = false
    currentEventIndex.value = -1
  } else {
    currentEventIndex.value--
  }
}

const next = () => {
  if (!started.value) {
    start()
  } else if (currentEventIndex.value + 1 >= props.events.length) {
    finished.value = true
    currentEventIndex.value = -1
  } else {
    currentEventIndex.value++
  }
}

/**
 * Add a short delay before showing
 * the first event when starting
 */
const start = () => {
  started.value = true
  setTimeout(() => {
    currentEventIndex.value = 0
  }, fitChartOnScreen.value ? 0 : 800)
}

const storyPointCurrentScale = 4.0
const storyPointCurrent = computed(() => {
  if (currentEventIndex.value > -1) {
    return storyEventCoords.value[currentEventIndex.value]
  }
})

const eventPositionCSS = computed(() => {
  return props.events.map((event: StoryEvent) => {
    if (event.position.origin === StoryEventPositionOrigin.left) {
      return {
        left: `max(1rem, ${event.position.offset * 100}%)`,
        transform: 'translateX(-1rem)',
      }
    } else if (event.position.origin === StoryEventPositionOrigin.center) {
      return {
        left: `max(1rem, ${event.position.offset * 100}%)`,
        transform: 'translateX(-50%)',
      }
    } else if (event.position.origin === StoryEventPositionOrigin.right) {
      return {
        right: `max(1rem, ${event.position.offset * 100}%)`,
        transform: 'translateX(1rem)',
      }
    }
  })
})

watch(currentEventRef, (newCurrentEventRef, oldCurrentEventRef) => {
  if (!newCurrentEventRef) {
    if (scrollRef.value) {
      scrollRef.value.scrollLeft = 0
    }
    return
  }
  const setScrollLeft = () => {
    if (!scrollRef.value) {
      return
    }
    let scrollLeft = 0
    const currentEvent = props.events[currentEventIndex.value]
    if (currentEvent.position.origin === StoryEventPositionOrigin.left) {
      scrollLeft = newCurrentEventRef.offsetLeft - 16
    } else if (currentEvent.position.origin === StoryEventPositionOrigin.center) {
      scrollLeft = newCurrentEventRef.offsetLeft - (newCurrentEventRef.offsetWidth / 2)
    } else {
      scrollLeft = newCurrentEventRef.offsetLeft
    }
    scrollRef.value.scrollLeft = Math.min(scrollRef.value.scrollWidth, Math.max(0, scrollLeft))
  }
  nextTick(setScrollLeft)
})
</script>

<template>
  <div
    ref="scroll-ref"
    class="grow overflow-scroll scroll-smooth"
  >
    <div
      :class="`
        story-wrapper
        ${!fitChartOnScreen ? 'story-wrapper-enlarged' : ''}
        relative
        h-full
      `"
    >
      <Chart
        aria-hidden="true"
        :columns="chartColumns"
        :datasets="[
          {
            id: 'all-data',
            hexes: chartEventCoords,
          },
          {
            id: 'highlights',
            hexes: chartEventCoordsHighlighted,
          },
        ]"
        :rows="chartRows"
        :ticks="ticks"
        :showAllYears="showAllYears"
        :storyPoints="storyEventCoords"
        :storyPointsScale="2.5"
        :storyPointCurrent="storyPointCurrent"
        :storyPointCurrentScale="storyPointCurrentScale"
      />
      <div
        class="
          absolute
          top-0
          left-0
          bottom-[calc(25vh+var(--button-height))]
          p-4
          flex
          flex-col
          gap-4
          max-w-screen
          z-50
          text-lg
          transition-opacity
          duration-300
        "
        :class="started ? 'sr-only opacity-0 delay-0' : 'opacity-100 delay-500'"
      >
        <h2 class="sr-only">Introduction</h2>
        <div
          v-html="intro"
          class="flex flex-col gap-4"
        />
      </div>
      <div class="absolute top-0 left-4 right-4 h-full">
        <h2 class="sr-only">Key Dates</h2>
        <TransitionGroup name="story-event" appear>
          <div
            v-for="(event, i) in events"
            ref="event-ref"
            class="
              story-item
              absolute
              top-4
              bottom-[calc(25vh+var(--button-height))]
              flex
              flex-col
              justify-end
              w-[90vw]
              max-w-96
            "
            :class="[
              i === currentEventIndex ? 'story-item-current' : 'sr-only',
              event.position.origin === StoryEventPositionOrigin.left ? 'story-item-origin-left' : '',
              event.position.origin === StoryEventPositionOrigin.center ? 'story-item-origin-center' : '',
              event.position.origin === StoryEventPositionOrigin.right ? 'story-item-origin-right' : '',
            ]"
            :style="eventPositionCSS[i]"
          >
            <article
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
              <h3>
                {{ event.date }}
              </h3>
              <p>
                {{ event.summary || event.headline }}
              </p>
            </article>
          </div>
        </TransitionGroup>
      </div>
      <div
        class="
          absolute
          top-0
          left-0
          bottom-[calc(25vh+var(--button-height))]
          p-4
          flex
          flex-col
          gap-4
          max-w-screen
          z-50
          text-lg
          transition-opacity
          duration-300
        "
        :class="!finished ? 'sr-only opacity-0 delay-0' : 'opacity-100 delay-500'"
      >
        <h2 class="sr-only">Conclusion</h2>
        <div v-html="conclusion" />
        <div v-if="actions.length">
          <a
            v-for="action in actions"
            :href="action.url"
          >
            <div>{{ action.prefix }}</div>
            <div>{{ action.title }}</div>
          </a>
        </div>
      </div>
      <div
        class="
          fixed
          bottom-12
          left-4
        "
      >
        <ButtonWhite @click="back">
          Prev
        </ButtonWhite>
      </div>
      <div
        class="
          fixed
          bottom-12
          right-4
        "
      >
        <ButtonWhite
          :url="finished ? '/student-movement' : ''"
          :disabled="started && currentEventIndex < 0"
          @click="next"
        >
          Next ({{ currentEventIndex }})
        </ButtonWhite>
      </div>
    </div>
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
  min-height: 25vh;
  fill: var(--color-chart-dim);
}
.story-wrapper .chart-hex-group-highlights {
  fill: var(--color-chart);
}
.story-wrapper .chart-hex-group-story {
  fill: var(--color-chart-feature);
}
.story-wrapper .chart-hex-group-story polygon {
  stroke: var(--color-chart-feature-outline);
  stroke-width: 4px;
}
.story-wrapper .chart-hex-group-story line {
  stroke: var(--color-chart-feature-outline);
  stroke-width: 4px;
}
.story-item article {
  transform: scale(0);
  opacity: 0;
  transition: transform 0.2s 0.5s, opacity 0.5s 0.5s;
}
.story-item-current article {
  transform: scale(1);
  opacity: 1;
}
.story-item-origin-left article {
  transform-origin: bottom left;
}
.story-item-origin-center article {
  transform-origin: bottom center;
}
.story-item-origin-right article {
  transform-origin: bottom right;
}
</style>