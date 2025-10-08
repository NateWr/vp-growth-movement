<script setup lang="ts">
import type { PropType } from 'vue';
import type { ChartTick } from '../types/ChartTick';
import type { ChartHexGroup } from '../types/ChartHexGroup';
import { useViewportSize } from '../utilities/useViewportSize';
import Chart from './Chart.vue';

const props = defineProps({
  columns: {
    type: Number,
    required: true,
  },
  datasets: {
    type: Array as PropType<ChartHexGroup[]>,
    required: true,
  },
  rows: {
    type: Number,
    required: true,
  },
  ticks: {
    type: Array as PropType<ChartTick[]>,
    required: true,
  },
})

const { width, BREAKPOINTS } = useViewportSize()
</script>

<template>
  <Chart
    class="homepage-chart-wrapper"
    :columns="columns"
    :datasets="datasets"
    :rows="rows"
    :ticks="ticks"
    :showAllYears="width >= BREAKPOINTS.LAPTOP_SM"
  />
</template>

<style>
.homepage-chart-wrapper .chart-hexes {
  align-self: end;
  height: 25%;
}
@media (min-width: 767px) {
  .homepage-chart-wrapper .chart-hexes {
    height: 33%;
  }
}
@media (min-width: 1280px) {
  .homepage-chart-wrapper .chart-hexes {
    height: 40%;
  }
}
@media (min-width: 1920px) {
  .homepage-chart-wrapper .chart-tick-label {
    font-size: 1rem;
  }
}
</style>