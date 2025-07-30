<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch, type PropType } from 'vue';
import Chart from './Chart.vue';
import { useViewportSize } from '../utilities/useViewportSize.ts';
import type { ChartTick } from '../types/ChartTick';
import type { ChartHex } from '../types/ChartHex';
import type { StoryEvent as StoryEventType } from '../types/StoryEvent';
import { StoryEventPositionOrigin } from '../types/StoryEventPositionOrigin.ts';
import type { StoryAction } from '../types/StoryAction';
import Button from './Button.vue';
import StoryText from './StoryText.vue';
import StoryEvent from './StoryEvent.vue';
import IconArrowLeft from './IconArrowLeft.vue';
import IconArrowRight from './IconArrowRight.vue';
import StoryButtons from './StoryButtons.vue';

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
    type: Array as PropType<StoryEventType[]>,
    required: true,
  },
  actions: {
    type: Array as PropType<StoryAction[]>,
    required: true,
  },
  nextStoryUrl: {
    type: String,
    required: true,
  },
  nextStoryTitle: {
    type: String,
    required: true,
  },
  lastStoryUrl: {
    type: String,
    required: true,
  },
  lastStoryTitle: {
    type: String,
    required: true,
  },
})

const CHART_ZOOM_DELAY = 600

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
    zoomToEvent(props.events.length - 1)
  } else if (currentEventIndex.value <= 0) {
    started.value = false
    currentEventIndex.value = -1
  } else {
    currentEventIndex.value--
  }
}

const next = () => {
  if (!started.value) {
    started.value = true
    zoomToEvent(0)
  } else if (currentEventIndex.value + 1 >= props.events.length) {
    finished.value = true
    currentEventIndex.value = -1
  } else {
    currentEventIndex.value++
  }
}

const backText = computed(() => {
  if (finished.value) {
    return `${props.events.length}/${props.events.length}`
  }
  if (currentEventIndex.value < 0) {
    return props.lastStoryTitle
  }
  if (currentEventIndex.value === 0) {
    return 'Intro'
  }
  return `${currentEventIndex.value}/${props.events.length}`
})

const nextText = computed(() => {
  if (finished.value) {
    return props.nextStoryTitle
  }
  if (currentEventIndex.value < 0) {
    return 'Start'
  }
  if (currentEventIndex.value === props.events.length - 1) {
    return 'Conclusion'
  }
  return `${currentEventIndex.value + 2}/${props.events.length}`
})

/**
 * Add a short delay before setting the
 * current event when the timeline is
 * being zoomed in/out
 */
const zoomToEvent = (eventIndex: number) => {
  const delay = fitChartOnScreen.value ? 0 : CHART_ZOOM_DELAY
  setTimeout(() => {
    currentEventIndex.value = eventIndex
  }, delay)
}

const storyPointsScale = computed(() => {
  switch (true) {
    case (width.value >= BREAKPOINTS.LAPTOP_LG):
      return 1.25
    default:
      return 1.5
  }
})

const storyPointCurrent = computed(() => {
  if (currentEventIndex.value > -1) {
    return storyEventCoords.value[currentEventIndex.value]
  }
})

const eventPositionCSS = computed(() => {
  return props.events.map((event: StoryEventType) => {
    if (event.position.origin === StoryEventPositionOrigin.right) {
      return {
        right: `max(1rem, ${event.position.offset * 100}%)`,
        transform: `translateX(max(1rem, ${event.position.offset * 100}%))`,
      }
    }
    return {
      left: `max(1rem, ${event.position.offset * 100}%)`,
      transform: `translateX(min(-1rem, ${event.position.offset * -100}%)`,
    }
  })
})

const scrollIntoView = ($el: HTMLElement|null) => {
  if (!$el) {
    if (scrollRef.value) {
      scrollRef.value.scrollLeft = 0
    }
  } else {
    $el.scrollIntoView({
      inline: 'center',
    })
  }
}

watch(currentEventRef, (newCurrentEventRef, oldCurrentEventRef) => {
  scrollIntoView(newCurrentEventRef?.$el)
})

watch(width, (value, oldValue) => {
  setTimeout(() => {
    nextTick(() => {
      if (currentEventRef.value?.$el) {
        scrollIntoView(currentEventRef.value.$el)
      }
    })
  }, CHART_ZOOM_DELAY)
})
</script>

<template>
  <div
    ref="scroll-ref"
    class="grow overflow-scroll scroll-smooth"
  >
    <div
      :class="`
        app-story
        ${!fitChartOnScreen ? 'app-story-enlarged' : ''}
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
            style: {
              fill: 'var(--color-chart-dim)',
            }
          },
          {
            id: 'highlights',
            hexes: chartEventCoordsHighlighted,
            style: {
              fill: 'var(--color-chart)',
            }
          },
        ]"
        :rows="chartRows"
        :ticks="ticks"
        :showAllYears="showAllYears"
        :storyPoints="storyEventCoords"
        :storyPointsScale="storyPointsScale"
        :storyPointCurrent="storyPointCurrent"
      />
      <StoryText
        :class="started ? 'sr-only opacity-0 delay-0' : 'opacity-100 delay-500'"
      >
        <h2 class="sr-only">Introduction</h2>
        <div
          class="
            p-4
            flex
            flex-col
            gap-4
            text-lg
            leading-6
            sm:gap-6
            sm:text-xl
            sm:leading-7
            xl:w-xl
            3xl:w-2xl
            3xl:gap-8
            3xl:text-2xl
            3xl:leading-8
          "
          v-html="intro"
        />
      </StoryText>
      <div class="absolute top-0 left-4 right-4 h-full">
        <h2 class="sr-only">Events</h2>
        <StoryEvent
          v-for="(event, i) in events"
          :key="event.id"
          ref="event-ref"
          class="
            absolute
            top-4
            w-[90vw]
            max-w-96
            md:max-w-120
          "
          :event="event"
          :isCurrent="i === currentEventIndex"
          :styleCSS="eventPositionCSS[i]"
        />
      </div>
      <StoryText
        :class="!finished ? 'sr-only opacity-0' : 'opacity-100'"
      >
        <h2 class="sr-only">Conclusion</h2>
        <div
          class="
            flex
            flex-col
            gap-4
            p-4
            xl:grid
            xl:grid-cols-2
            xl:gap-16
            3xl:gap-16
          "
        >
          <div
            class="
              flex
              flex-col
              gap-4
              font-medium
              text-md
              leading-6
              sm:gap-6
              sm:text-xl
              sm:leading-7
              3xl:gap-8
              3xl:text-2xl
              3xl:leading-8
            "
            v-html="conclusion"
          />
          <div
            v-if="actions.length"
            class="
              flex
              flex-col
              gap-2
            "
          >
            <Button
              v-for="action in actions"
              :href="action.url"
              target="_blank"
            >
              <div class="flex flex-col">
                <div
                  class="
                    text-sm
                    3xl:text-base
                  "
                >
                  {{ action.prefix }}
                </div>
                <div
                  class="
                    font-normal
                    normal-case
                    leading-4
                    3xl:text-xl
                    3xl:leading-5
                  "
                >
                  {{ action.title }}
                </div>
              </div>
            </Button>
          </div>
        </div>
      </StoryText>
      <StoryButtons
        :backUrl="!started ? lastStoryUrl : ''"
        :backText="backText"
        :nextUrl="finished ? nextStoryUrl : ''"
        :nextText="nextText"
        @back="back"
        @next="next"
      />
    </div>
  </div>
</template>

<style>
.app-story {
  --button-height: 8rem;
  --chart-height: 25vh;
  --chart-width: 100vw;
  width: var(--chart-width);
  transition: all 0.5s;
}
.app-story-enlarged {
  --chart-width: 400vw;
}
.app-story .chart-wrapper {
  align-items: flex-end;
  padding-bottom: var(--button-height);
}
.app-story .chart-hexes {
  min-height: var(--chart-height);
}
.story-item {
  bottom: calc(var(--chart-height) + var(--button-height));
}
@media (min-width: 640px) {
  .app-story-enlarged {
    --chart-width: 200vw;
  }
}
@media (min-width: 768px) and (max-width: 1023px) and (orientation: portrait) {
  .app-story {
    --chart-height: 40vh;
  }
  .app-story-enlarged {
    --chart-width: 300vw;
  }
}
@media (min-width: 1024px) and (orientation: landscape) {
  .app-story-enlarged {
    --chart-width: 100vw;
  }
}
</style>