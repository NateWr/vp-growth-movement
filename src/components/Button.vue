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
      flex
      items-center
      gap-2
      py-2
      px-4
      border-2
      font-bold
      uppercase
      text-left
      disabled:opacity-50
    "
  >
    <slot />
</component>
</template>