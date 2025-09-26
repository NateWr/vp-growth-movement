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
      return ['', 'black', 'yellow', 'yellow-outline', 'blue'].includes(value)
    },
  },
  rounded: {
    type: Boolean,
    default: false,
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
        : 'gap-2 py-3 px-4 font-bold uppercase',
      variant === 'black'
        ? 'bg-black text-white border-black'
        : '',
      variant === 'yellow'
        ? 'bg-yellow text-black border-yellow hover:bg-white hover:border-white'
        : '',
      variant === 'yellow-outline'
        ? 'bg-black text-white border-yellow hover:bg-white hover:text-black hover:border-white'
        : '',
      variant === 'blue'
        ? 'bg-blue text-white border-blue'
        : '',
      variant === 'white-outline'
        ? 'text-white border-white hover:bg-white hover:text-black focus-visible:border-yellow focus-visible:outline-0'
        : '',
      rounded
        ? 'rounded-full'
        : ''
    ]"
  >
    <slot name="icon" />
    <span class="relative top-px grow">
      <slot />
    </span>
    <slot name="icon-after" />
  </component>
</template>
