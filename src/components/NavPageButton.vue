<script setup lang="ts">
const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  rotateDir: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <button
    class="
      w-16 h-16 flex items-center justify-center transition-all
      disabled:opacity-40
    "
    :class="[
      rotateDir ? 'hover:rotate-5' : 'hover:-rotate-5',
      disabled ? '' : `
        hover:text-yellow
        hover:-translate-y-0.5
        hover:-rotate-5
        focus-visible:bg-yellow
        focus-visible:text-black
        focus-visible:outline-0
      `
    ]"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>