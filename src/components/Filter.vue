<template>
  <div class="flex flex-col gap-1">
    <div class="flex flex-col leading-tight">
      <div class="font-bold uppercase">
        <slot name="title" />
      </div>
      <div class="text-balance">
        <slot name="description" />
      </div>
    </div>
    <slot />
  </div>
</template>