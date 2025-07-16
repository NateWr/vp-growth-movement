<script setup lang="ts">
const props = defineProps({
  size: {
    type: String,
    default: '',
    validator(value: string) {
      return ['', 'sm'].includes(value)
    },
  },
  variant: {
    type: String,
    default: '',
    validator(value: string) {
      return ['', 'black', 'white'].includes(value)
    },
  },
  href: {
    type: String,
    default: '',
  }
})
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    :href="href"
    class="
      relative
      flex
      items-center
      border-2
      text-left
      disabled:opacity-50
    "
    :class="[
      size === 'sm'
        ? 'text-sm gap-1 py-1 px-2 font-medium'
        : 'gap-2 py-2 px-4 font-bold uppercase',
      variant === 'black'
        ? 'bg-black text-white border-black'
        : '',
      variant === 'white'
        ? 'bg-white text-black border-white'
        : '',
    ]"
  >
    <slot name="icon" />
    <span class="relative top-px">
      <slot />
    </span>
  </component>
</template>
