<script setup lang="ts">
import IconCalendar from './IconCalendar.vue';

const props = defineProps({
  defaultFrom: {
    type: String,
    required: true,
  },
  defaultTo: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
})

const dateFrom = defineModel('date-from', {required: true})
const dateTo = defineModel('date-to', {required: true})
</script>

<template>
  <div class="input-date-range relative pl-[3em] pr-4 inline-flex items-center gap-2 border-2 rounded-xs focus-within:outline focus-within:outline-2">
    <IconCalendar class="absolute top-1/2 left-[0.65em] -translate-y-1/2 w-[1.5em] h-auto" aria-hidden="true" />
    <div class="relative flex flex-col">
      <label :for="`${name}-from`" class="absolute top-2 font-mono font-light text-xs uppercase">From</label>
      <input
        class="mt-2 -mb-2 w-22 h-12 focus-visible:outline-none"
        :name="`${name}-from`"
        :id="`${name}-from`"
        maxlength="10"
        :placeholder="defaultFrom"
        v-model="dateFrom"
      />
    </div>
    <span class="mt-4" aria-hidden="true">—</span>
    <div class="relative flex flex-col">
      <label :for="`${name}-to`" class="absolute top-2 font-mono font-light text-xs uppercase">To</label>
      <input
        class="mt-2 -mb-2 w-22 h-12 focus-visible:outline-none"
        :name="`${name}-to`"
        :id="`${name}-to`"
        maxlength="10"
        :placeholder="defaultTo"
        v-model="dateTo"
      />
    </div>
  </div>
</template>

<style>
.input-wrapper > svg {
  position: absolute;
  top: 50%;
  left: 0.75em;
  transform: translateY(-50%);
  width: 1.5em;
  height: auto;
}
</style>