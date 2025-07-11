<script setup lang="ts">
const props = defineProps({
  url: {
    type: String,
    default: '',
  }
})
</script>

<template>
  <component
    :is="url ? 'a' : 'button'"
    :href="url"
    class="
      inline-block
      py-2
      px-4
      border-2
      font-bold
      uppercase
      disabled:opacity-50
    "
  >
    <slot />
</component>
</template>