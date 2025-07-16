<template>
  <div class="input-wrapper">
    <slot name="icon" />
    <slot />
  </div>
</template>

<style>
.input-wrapper {
  position: relative;
}
.input-wrapper > svg {
  position: absolute;
  top: 50%;
  left: 0.75em;
  transform: translateY(-50%);
  width: 1.5em;
  height: auto;
}
.input-wrapper input,
.input-wrapper select {
  width: 100%;
  padding: 0.5em 1em 0.5em 2.5em;
  border: 2px solid;
  border-radius: 2px;
}
.input-wrapper input:placeholder {
  opacity: 0.5;
}
.input-wrapper input:focus-visible {
  outline: 2px solid;
}
</style>