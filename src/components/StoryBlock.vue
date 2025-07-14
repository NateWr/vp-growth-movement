<script setup lang="ts">
import { computed, ref, useTemplateRef, watch, type PropType } from 'vue';
import ButtonWhite from './ButtonWhite.vue';
import Chart from './Chart.vue';
import { useViewportSize } from '../utilities/useViewportSize';
import type { ChartTick } from '../types/ChartTick';
import type { ChartHex } from '../types/ChartHex';
import type { StoryEvent as StoryEventType } from '../types/StoryEvent.d.ts';
import { StoryEventPositionOrigin } from '../types/StoryEventPositionOrigin.ts';
import type { StoryAction } from '../types/StoryAction';
import Button from './Button.vue';
import StoryText from './StoryText.vue';
import StoryEvent from './StoryEvent.vue';

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

/**
 * Add a short delay before setting the
 * current event when the timeline is
 * being zoomed in/out
 */
const zoomToEvent = (eventIndex: number) => {
  const delay = fitChartOnScreen.value ? 0 : 600
  setTimeout(() => {
    currentEventIndex.value = eventIndex
  }, delay)
}

const storyPointsScale = computed(() => {
  switch (true) {
    case (width.value >= BREAKPOINTS.LAPTOP):
      return 1.5
    case (width.value >= BREAKPOINTS.LAPTOP_SM):
      return 1.75
    case (width.value >= BREAKPOINTS.TABLET):
      return 2
    default:
      return 3
  }
})

const storyPointCurrent = computed(() => {
  if (currentEventIndex.value > -1) {
    return storyEventCoords.value[currentEventIndex.value]
  }
})

const eventPositionCSS = computed(() => {
  return props.events.map((event: StoryEventType) => {
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
  if (!newCurrentEventRef?.$el) {
    if (scrollRef.value) {
      scrollRef.value.scrollLeft = 0
    }
    return
  }
  newCurrentEventRef?.$el.scrollIntoView({
    inline: 'center',
  })
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
            font-medium
            text-md
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
        <h2 class="sr-only">Key Dates</h2>
        <TransitionGroup name="story-event" appear>
          <StoryEvent
            v-for="(event, i) in events"
            :key="i"
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
        </TransitionGroup>
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
      <div class="story-buttons">
        <ButtonWhite
          :url="!started ? lastStoryUrl : ''"
          class="story-button story-button-back"
          @click="started ? back() : null"
        >
          <div>Prev</div>
          <div>{{ !started ? lastStoryTitle : currentEventIndex }}</div>
        </ButtonWhite>
        <ButtonWhite
          class="story-button story-button-next"
          :url="finished ? nextStoryUrl : ''"
          @click="finished ? null : next()"
        >
          <div>Next</div>
          <div>{{ finished ? nextStoryTitle : currentEventIndex }}</div>
        </ButtonWhite>
      </div>
    </div>
  </div>
</template>

<style>
.story-wrapper {
  --button-height: 8rem;
  --chart-height: 25vh;
  --chart-width: 100vw;
  width: var(--chart-width);
  transition: all 0.5s;
}
.story-wrapper-enlarged {
  --chart-width: 300vw;
}
.story-wrapper .chart-wrapper {
  align-items: flex-end;
  padding-bottom: var(--button-height);
}
.story-wrapper .chart-hexes {
  min-height: var(--chart-height);
}
.story-item {
  bottom: calc(var(--chart-height) + var(--button-height));
}
@media (min-width: 640px) {
  .story-wrapper-enlarged {
    --chart-width: 200vw;
  }
}
@media (min-width: 768px) and (max-width: 1023px) and (orientation: portrait) {
  .story-wrapper {
    --chart-height: 40vh;
  }
  .story-wrapper-enlarged {
    --chart-width: 300vw;
  }
}
@media (min-width: 1024px) and (orientation: landscape) {
  .story-wrapper-enlarged {
    --chart-width: 100vw;
  }
}

/**
 * Next/Back buttons
 */
.story-buttons {
  --offset-bottom: 3rem;
  --offset-inline: 1rem;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 0;
}
.story-button {
  position: fixed;
  bottom: var(--offset-bottom);
}
.story-button-back {
  left: var(--offset-inline);
}
.story-button-next {
  right: var(--offset-inline);
}
@media (min-width: 1280px) {
  .story-buttons {
    --offset-inline: 3rem;
    display: flex;
    align-items: center;
    gap: 2rem;
    bottom: var(--offset-bottom);
    right: var(--offset-inline);
    left: auto;
    width: auto;
  }
  .story-buttons .story-button-back,
  .story-buttons .story-button-next {
    position: relative;
    left: auto;
    right: auto;
    bottom: auto;
  }
}
</style>