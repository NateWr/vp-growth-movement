<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch, type PropType } from 'vue'
import type { FilterOption } from '../types/FilterOption'
import Button from './Button.vue'
import IconPlus from './IconPlus.vue'
import IconMinus from './IconMinus.vue'
import InputWrapper from './InputWrapper.vue'

const MAX_OPTIONS = 10

const props = defineProps({
  disabled: {
    type: Array as PropType<FilterOption[]>,
    default: [],
  },
  name: {
    type: String,
    required: true,
  },
  options: {
    type: Object as PropType<FilterOption[]>,
    required: true,
  },
  selected: {
    type: Object as PropType<string[]>,
    required: true,
  },
})

const emits = defineEmits<{
  (e: 'toggle', value: string): void
}>()

const listboxId = computed(() => `${props.name}-autocomplete-listbox`)
const instructionsId = computed(() => `${props.name}-autocomplete-instructions`)

const selectedOptions = computed(() => props.options.filter(o => props.selected.includes(o.value)))

const searchPhrase = ref('')
const matchingOptions = computed(() => {
  if (!searchPhrase.value.trim()) {
    return []
  }
  return props.options
    .filter(o => {
      return !props.selected.includes(o.value)
        && o.name.toLowerCase().includes(searchPhrase.value.toLowerCase())
    })
    .slice(0, MAX_OPTIONS)
})

const input = ref<HTMLInputElement|null>(null)
const focusedOption = ref(0)
const listBox = ref<HTMLElement|null>(null)

const reset = () => {
  searchPhrase.value = ''
  focusedOption.value = 0
  input.value?.focus()
}

const toggleFirst = () => {
  if (matchingOptions.value.length > 0) {
    toggle(matchingOptions.value[0])
  }
}

const toggle = (option: FilterOption) => {
  emits('toggle', option.value)
  reset()
}

const keyDown = () => {
  focusedOption.value = Math.min(matchingOptions.value.length, focusedOption.value + 1)
}

const keyUp = () => {
  focusedOption.value = Math.max(0, focusedOption.value - 1)
}

watch(focusedOption, (newVal) => {
  const $option : HTMLButtonElement | null | undefined = listBox.value?.querySelector(`[aria-posinset="${newVal}"]`)
  $option?.focus()
})

watch(matchingOptions, () => focusedOption.value = 0)
</script>

<template>
  <div @keyup.down="keyDown" @keyup.up="keyUp">
    <div class="sr-only" role="status" aria-atomic="true" aria-live="polite">
      Type 3 or more characters to view results
    </div>
    <InputWrapper>
      <template #icon>
        <slot name="icon" />
      </template>
      <input
        :aria-expanded="matchingOptions.length > 0"
        :aria-owns="listboxId"
        aria-autocomplete="both"
        :aria-described-by="instructionsId"
        autocomplete="off"
        :name="name"
        ref="input"
        role="combobox"
        type="text"
        v-model="searchPhrase"
        @keyup.enter="toggleFirst"
      >
      <div
        class="autocomplete-listbox flex flex-wrap items-start gap-1 bg-black"
        :class="matchingOptions.length > 0 ? 'autocomplete-listbox-open' : ''"
        :id="listboxId"
        ref="listBox"
        role="listbox"
      >
        <Button
          v-for="(option, i) in matchingOptions"
          :key="option.value"
          class="autocomplete-option"
          :disabled="disabled.find((o: FilterOption) => o.value === option.value)"
          role="option"
          tabindex="-1"
          :aria-posinset="i + 1"
          :aria-setsize="matchingOptions.length"
          :aria-selected="focusedOption === i ? true : null"
          size="sm"
          variant="white"
          @click="toggle(option)"
        >
          <template #icon>
            <IconPlus aria-hidden="true" />
          </template>
          {{ option.name }}
        </Button>
      </div>
    </InputWrapper>
    <span class="sr-only" :id="instructionsId">
      When autocomplete results are available use up and down arrows to review and enter to select.
    </span>
    <ul class="flex flex-wrap gap-1 mt-2" aria-label="Selected">
      <li
        v-for="option in selectedOptions"
        :key="option.value"
      >
        <Button
          :selected="true"
          size="sm"
          variant="black"
          @click="toggle(option)"
        >
          <template #icon>
            <IconMinus aria-hidden="true" />
          </template>
          {{ option.name }}
          <span class="sr-only">Press Enter or Space to remove selection</span>
        </Button>
      </li>
    </ul>
  </div>
</template>

<style>
.autocomplete-listbox {
  position: absolute;
  top: calc(100% - 2px);
  left: 0;
  right: 0;
  z-index: 999;
  transform: scale(0);
  transform-origin: top left;
  transition: all 0.15s;
}

.autocomplete-listbox-open {
  padding: 0.5rem;
  transform: scale(1);
  outline: 2px solid;
}
</style>