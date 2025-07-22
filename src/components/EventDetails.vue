<script setup lang="ts">
import { computed, type PropType } from 'vue';
import type { Event } from '../types/Event';
import type { FilterOption } from '../types/FilterOption';
import Button from './Button.vue';
import { getCountryNames } from '../utilities/getFilterNames';

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

const country = computed(() => getCountryNames(props.event.country, props.countries))
const areas = computed(() => getCountryNames(props.event.area, props.areas))
const campaigns = computed(() => getCountryNames(props.event.campaign, props.campaigns))
const targets = computed(() => getCountryNames(props.event.target, props.targets))
</script>

<template>
  <article class="
    flex flex-col gap-4
    2xl:grid 2xl:grid-cols-5 2xl:items-end 2xl:gap-8
    3xl:gap-16
  ">
    <div class="flex flex-col gap-4">
      <div class="
        flex flex-col gap-1
        3xl:gap-2
      ">
        <div class="
          font-semibold uppercase
          3xl:text-lg
        ">
          {{ event.dateFormatted }}
        </div>
        <component
          :is="heading"
          class="
            text-xl leading-tight font-bold
            3xl:text-2xl
            3xl:leading-[1.1]
          "
        >
          {{ event.headline }}
        </component>
        <div v-if="country.length" class="3xl:text-lg">
          <span v-if="event.city">
            {{ event.city }},
          </span>
          <span>
            {{ country.join(', ') }}
          </span>
        </div>
      </div>
      <div class="
        text-lg
        3xl:text-xl
        3xl:leading-normal
      ">
        {{ event.summary }}
      </div>
    </div>
    <div class="
      flex flex-col gap-4
      2xl:col-span-2
    ">
      <div v-if="event.sources.length" class="flex gap-1">
        <div class="font-bold uppercase">Details:</div>
        <div class="flex flex-col">
          <a
            v-for="source in event.sources"
            :key="source.url"
            :href="source.url"
            class="underline break-all"
          >
            {{ source.domain }}
          </a>
        </div>
      </div>
      <div class="
        flex flex-wrap gap-1
      ">
        <Button v-for="area in areas" :key="area" size="sm">
          {{ area }}
        </Button>
        <Button v-for="campaign in campaigns" :key="campaign" size="sm">
          {{ campaign }}
        </Button>
        <Button v-for="target in targets" :key="target" size="sm">
          {{ target }}
        </Button>
      </div>
    </div>
  </article>
</template>