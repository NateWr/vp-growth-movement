<script setup lang="ts">
import type { PropType } from 'vue';
import type { Event } from '../types/Event';
import Button from './Button.vue';
import IconArrowUpRight from './IconArrowUpRight.vue';

const props = defineProps({
  event: {
    type: Object as PropType<Event>,
    required: true,
  }
})
</script>

<template>
  <article
    class="
      flex
      flex-col
      gap-4
    "
  >
    <div
      class="
        flex
        flex-col
        gap-1
      "
    >
      <div
        class="
          font-semibold
          uppercase
        "
      >
        {{ event.dateFormatted }}
      </div>
      <h3
        class="
          text-xl
          leading-tight
          font-bold
        "
      >
        {{ event.headline }}
      </h3>
      <div v-if="event.country">
        <span v-if="event.city">
          {{ event.city }},
        </span>
        <span>
          {{ event.country.join(', ') }}
        </span>
      </div>
    </div>
    <div class="text-lg">
      {{ event.summary }}
    </div>
    <div>
      <Button>
        <IconArrowUpRight aria-hidden="true" />
        View Event
      </Button>
    </div>
  </article>
</template>