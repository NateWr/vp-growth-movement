<script setup lang="ts">
import Button from './Button.vue';

const props = defineProps({
  url: {
    type: String,
    default: '',
  }
})
</script>

<template>
  <Button
    :url="url"
    class="
      bg-black
      text-white
      border-black
    "
  >
    <slot />
  </Button>
</template>