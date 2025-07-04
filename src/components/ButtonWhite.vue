<script setup lang="ts">
import Button from './Button.vue';

</script>

<template>
  <Button
    class="
      bg-white
      text-black
    "
  >
    <slot />
  </Button>
</template>