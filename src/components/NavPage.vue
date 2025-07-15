<script setup lang="ts">
import IconChevronLeft from './IconChevronLeft.vue';
import IconChevronRight from './IconChevronRight.vue';
import NavPageButton from './NavPageButton.vue';

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  lastPage: {
    type: Number,
    required: true,
  },
  eventsPerPage: {
    type: Number,
    required: true,
  },
  showingStart: {
    type: String,
    required: true,
  },
  showingEnd: {
    type: String,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  }
})

const emit = defineEmits(['set-page'])
</script>

<template>
  <div
    class="
      flex
      items-stretch
      justify-between
      h-16
      rounded-full
      bg-black
      text-white
    "
  >
    <NavPageButton
      :disabled="currentPage <= 1"
      @click="emit('set-page', currentPage - 1)"
    >
      <span class="sr-only">Last page</span>
      <IconChevronLeft class="w-8 h-8" aria-hidden="true" />
    </NavPageButton>
    <div class="flex flex-col justify-center py-2 whitespace-nowrap">
      <span class="text-xs uppercase leading-tight">
        Showing
      </span>
      <span class="text-lg font-semibold leading-tight">
        {{ showingStart.toLocaleString('en-US') }}-{{ showingEnd.toLocaleString('en-US') }} of {{ total.toLocaleString('en-US') }} events
      </span>
    </div>
    <NavPageButton
      :disabled="currentPage >= lastPage"
      @click="emit('set-page', currentPage + 1)"
    >
      <span class="sr-only">Last page</span>
      <IconChevronRight class="w-8 h-8" aria-hidden="true" />
    </NavPageButton>
  </div>
</template>