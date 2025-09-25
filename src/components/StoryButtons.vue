<script setup lang="ts">
import Button from './Button.vue';
import IconArrowLeft from './IconArrowLeft.vue';
import IconArrowRight from './IconArrowRight.vue';
import StoryButtonInside from './StoryButtonInside.vue';

const props = defineProps({
  backUrl: String,
  backText: String,
  nextUrl: String,
  nextText: String,
})
const emit = defineEmits(['back', 'next'])

const buttonClasses = `
  gap-3
  md:w-full md:px-6 md:py-4 md:text-lg
  xl:px-4 xl:py-3
`
</script>

<template>
  <div class="
    fixed bottom-16 left-4 right-4 grid grid-cols-2 items-center gap-4
    md:left-auto md:right-8 md:w-96
    lg:right-12
    xl:right-16
    2xl:right-24
    3xl:right-64
    4xl:right-128
  ">
    <Button
      :class="`${buttonClasses} group`"
      :href="backUrl"
      variant="yellow-outline"
      :rounded="true"
      @click="backUrl ? null : emit('back')"
    >
      <template #icon>
        <IconArrowLeft class="w-8 h-auto text-yellow group-hover:text-black" aria-hidden="true" />
      </template>
      <StoryButtonInside>
        Back
        <template #small>
          {{ backText }}
        </template>
      </StoryButtonInside>
    </Button>
    <Button
      :class="buttonClasses"
      :href="nextUrl"
      variant="yellow"
      :rounded="true"
      @click="nextUrl ? null : emit('next')"
    >
      <StoryButtonInside>
        Next
        <template #small>
          {{ nextText }}
        </template>
      </StoryButtonInside>
      <template #icon-after>
        <IconArrowRight class="w-8 h-auto" aria-hidden="true" />
      </template>
    </Button>
  </div>
</template>