<script setup lang="ts">
import { computed, type PropType } from 'vue';
import type { Event } from '../types/Event';
import type { FilterOption } from '../types/FilterOption';
import EventSummary from './EventSummary.vue';
import Button from './Button.vue';

const props = defineProps({
  areas: {
    type: Array as PropType<FilterOption[]>,
    required: true,
  },
  campaigns: {
    type: Array as PropType<FilterOption[]>,
    required: true,
  },
  countries: {
    type: Array as PropType<FilterOption[]>,
    required: true,
  },
  event: {
    type: Object as PropType<Event>,
    required: true,
  },
  heading: {
    type: String,
    default: 'h2',
  },
  targets: {
    type: Array as PropType<FilterOption[]>,
    required: true,
  },
})

const areas = computed(() => {
  return props.areas
    .filter((c: FilterOption) => props.event.area.includes(c.value))
    .map((c: FilterOption) => c.name)
})
const campaigns = computed(() => {
  return props.campaigns
    .filter((c: FilterOption) => props.event.campaign.includes(c.value))
    .map((c: FilterOption) => c.name)
})
const targets = computed(() => {
  return props.targets
    .filter((c: FilterOption) => props.event.target.includes(c.value))
    .map((c: FilterOption) => c.name)
})
</script>

<template>
  <article class="flex flex-col gap-8">
    <EventSummary
      :heading="heading"
      :event="event"
      :countries="countries"
    />
    <div v-if="areas.length">
      <div class="font-bold uppercase">Area</div>
      <div class="flex flex-wrap gap-4">
        <Button v-for="area in areas" :key="area" size="sm">
          {{ area }}
        </Button>
      </div>
    </div>
    <div v-if="campaigns.length">
      <div class="font-bold uppercase">Campaigns</div>
      <div class="flex flex-wrap gap-4">
        <Button v-for="campaign in campaigns" :key="campaign" size="sm">
          {{ campaign }}
        </Button>
      </div>
    </div>
    <div v-if="targets.length">
      <div class="font-bold uppercase">Targets</div>
      <div class="flex flex-wrap gap-4">
        <Button v-for="target in targets" :key="target" size="sm">
          {{ target }}
        </Button>
      </div>
    </div>
    <div v-if="event.sources.length">
      <div class="font-bold uppercase">Read more</div>
      <div class="flex flex-wrap gap-4">
        <a
          v-for="source in event.sources"
          :key="source.url"
          :href="source.url"
          class="underline"
        >
          {{ source.domain }}
        </a>
      </div>
    </div>
  </article>
</template>