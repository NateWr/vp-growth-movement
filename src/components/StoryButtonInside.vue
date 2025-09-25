<template>
  <div class="relative top-0.5 flex flex-col items-center text-lg uppercase leading-3">
    <div>
      <slot />
    </div>
    <div class="font-normal text-sm whitespace-nowrap">
      <slot name="small" />
    </div>
  </div>
</template>