<script setup lang="ts">
import { computed, type PropType } from 'vue';
import type { Event } from '../types/Event';
import Button from './Button.vue';
import IconArrowUpRight from './IconArrowUpRight.vue';
import type { FilterOption } from '../types/FilterOption';

const props = defineProps({
  event: {
    type: Object as PropType<Event>,
    required: true,
  },
  countries: {
    type: Array as PropType<FilterOption[]>,
    required: true,
  }
})

const country = computed(() => {
  return props.countries
    .filter((c: FilterOption) => props.event.country.includes(c.value))
    .map((c: FilterOption) => c.name)
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
      <div v-if="country.length">
        <span v-if="event.city">
          {{ event.city }},
        </span>
        <span>
          {{ country.join(', ') }}
        </span>
      </div>
    </div>
    <div class="text-lg">
      {{ event.summary }}
    </div>
    <div>
      <Button class="scroll-mt-[32rem]">
        <template #icon>
          <IconArrowUpRight aria-hidden="true" />
        </template>
        View Event
      </Button>
    </div>
  </article>
</template>