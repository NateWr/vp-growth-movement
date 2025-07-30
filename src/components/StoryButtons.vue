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
    fixed bottom-8 left-4 right-4 grid grid-cols-2 items-center gap-4
    md:left-auto md:w-96
    lg:right-8
  ">
    <Button
      :class="buttonClasses"
      :href="backUrl"
      variant="white"
      @click="backUrl ? null : emit('back')"
    >
      <template #icon>
        <IconArrowLeft aria-hidden="true" />
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
      variant="white"
      @click="nextUrl ? null : emit('next')"
    >
      <StoryButtonInside>
        Next
        <template #small>
          {{ nextText }}
        </template>
      </StoryButtonInside>
      <template #icon-after>
        <IconArrowRight aria-hidden="true" />
      </template>
    </Button>
  </div>
</template>