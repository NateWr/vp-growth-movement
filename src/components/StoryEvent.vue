<script setup lang="ts">
import { computed, type PropType } from 'vue';
import type { StoryEvent } from '../types/StoryEvent.d.ts';
import { StoryEventPositionOrigin } from '../types/StoryEventPositionOrigin';

const props = defineProps({
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
    "
    :class="isCurrent ? 'story-item-current' : 'sr-only'"
    :style="styleCSS"
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
        md:p-6
        3xl:p-8
      "
      :class="transformOrigin"
    >
      <h3
        v-if="event.title"
        class="
          text-lg
          font-black
          uppercase
          md:text-xl
        "
      >
        {{ event.title }}
      </h3>
      <div
        class="
          text-lg
          leading-5.5
          md:text-xl
          md:leading-6
        "
        v-html="event.summary || event.headline"
      />
      <p
        class="
          self-end
          uppercase
          md:text-base
          md:text-lg
        "
      >
        {{ event.date }}
      </p>
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