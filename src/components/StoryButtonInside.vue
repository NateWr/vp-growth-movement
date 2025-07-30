<template>
  <div class="flex flex-col uppercase leading-tight md:leading-4">
    <div>
      <slot />
    </div>
    <div class="font-normal text-sm whitespace-nowrap">
      <slot name="small" />
    </div>
  </div>
</template>