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
      bg-white
      text-black
    "
  >
    <slot />
  </Button>
</template>