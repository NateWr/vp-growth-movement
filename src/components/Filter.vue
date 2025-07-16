<template>
  <div class="flex flex-col gap-2">
    <div class="flex flex-col gap-1">
      <div class="font-bold uppercase">
        <slot name="title" />
      </div>
      <slot name="description" />
    </div>
    <slot />
  </div>
</template>