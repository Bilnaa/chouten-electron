<script setup lang="ts">
import SliderPreview from './SliderPreview.vue';
import SliderThumb from './SliderThumb.vue';
</script>

<template>
  <media-volume-slider class="media-slider">
    <div class="track" />
    <div class="track-fill track" />
    <SliderThumb />
    <SliderPreview no-clamp>
      <media-slider-value class="value" />
    </SliderPreview>
  </media-volume-slider>
</template>

<style scoped>
.media-slider {
  display: inline-flex;
  align-items: center;
  width: 100%;
  height: 40px;
  position: relative;
  contain: layout style;
  outline: none;
  pointer-events: auto;
  cursor: pointer;
  user-select: none;
  touch-action: none;
  max-width: 72px;
  /** Prevent thumb flowing out of slider (15px = thumb width). */
  margin: 0 calc(15px / 2);
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.media-slider[data-focus] .track {
  box-shadow: var(--media-focus-ring);
}

.track {
  z-index: 0;
  position: absolute;
  width: 100%;
  height: 5px;
  top: 50%;
  left: 0;
  border-radius: 1px;
  transform: translateY(-50%) translateZ(0);
  background-color: rgb(255 255 255 / 0.3);
  contain: strict;
}

.track-fill {
  z-index: 2;
  background-color: var(--media-brand);
  width: var(--slider-fill, 0%);
  will-change: width;
}

.value {
  font-size: 13px;
  padding: 1px 10px;
  border-radius: 2px;
  background-color: black;
}
</style>
