<script setup lang="ts">
import { computed, type PropType } from 'vue';
import type { StoryEvent } from '../types/StoryEvent.d.ts';
import { StoryEventPositionOrigin } from '../types/StoryEventPositionOrigin';

const props = defineProps({
  backgroundClipPathId: {
    type: String,
    required: true,
  },
  event: {
    type: Object as PropType<StoryEvent>,
    required: true,
  },
  isCurrent: {
    type: Boolean,
    required: true,
  },
  styleCSS: {
    type: Object,
    required: true,
  }
})

const transformOrigin = computed(() => {
  switch (true) {
    case props.event.position.origin === StoryEventPositionOrigin.left:
      return 'origin-bottom-left';
    case props.event.position.origin === StoryEventPositionOrigin.right:
      return 'origin-bottom-right';
    case props.event.position.origin === StoryEventPositionOrigin.center:
    default:
      return 'origin-bottom-center';
  }
})
</script>

<template>
  <div
    class="
      story-item
      flex
      flex-col
      justify-end
      overflow-hidden
    "
    :class="isCurrent ? 'story-item-current' : 'sr-only'"
    :style="styleCSS"
  >
    <article
      class="
        overflow-scroll
        flex
        flex-col
        items-start
        gap-2
        p-4
        bg-yellow
        text-black
        md:p-6
        2xl:gap-3
        3xl:p-8
        3xl:gap-4
      "
      :class="transformOrigin"
      :style="`clip-path: url(#${backgroundClipPathId})`"
    >
      <div class="flex items-center gap-2 3xl:gap-3">
        <h3
          v-if="event.title"
          class="
            text-sm
            px-1
            font-medium
            uppercase
            bg-blue
            text-white
            2xl:text-base
            3xl:text-lg
            3xl:px-2
          "
        >
          <span class="relative top-px">
            {{ event.title }}
          </span>
        </h3>
        <div
          :class="`
            text-sm
            self-end
            uppercase
            2xl:text-base
            3xl:text-lg
            ${!event.title ? 'px-1 bg-blue text-white 3xl:px-2' : ''}
          `"
        >
          <span class="relative top-px">
            {{ event.date }}
          </span>
        </div>
      </div>
      <div
        class="
          leading-tight
          2xl:text-lg
          3xl:text-xl
        "
        v-html="event.summary || event.headline"
      />
    </article>
  </div>

</template>

<style>
.story-item article {
  transform: scale(0);
  transition: transform 0.2s 0.25s;
}
.story-item-current article {
  transform: scale(1);
  opacity: 1;
}
</style>