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
import Button from './Button.vue';
import StoryText from './StoryText.vue';

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
        <ButtonWhite class="story-button story-button-back" @click="back">
          Prev
        </ButtonWhite>
        <ButtonWhite
          class="story-button story-button-next"
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
@media (min-width: 640px) {
  .story-wrapper-enlarged {
    width: 200vw;
  }
}
@media (min-width: 900px) {
  .story-wrapper-enlarged {
    width: 180vw;
  }
}
@media (min-width: 1024px) and (orientation: landscape) {
  .story-wrapper-enlarged {
    width: 100vw;
  }
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