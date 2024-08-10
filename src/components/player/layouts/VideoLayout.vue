<script setup lang="ts">
import CaptionButton from '../buttons/CaptionButton.vue';
import FullscreenButton from '../buttons/FullscreenButton.vue';
import MuteButton from '../buttons/MuteButton.vue';
import PIPButton from '../buttons/PIPButton.vue';
import PlayButton from '../buttons/PlayButton.vue';
import ChapterTitle from '../ChapterTitle.vue';
import SettingsMenu from '../menus/SettingsMenu.vue';
import TimeSlider from '../sliders/TimeSlider.vue';
import VolumeSlider from '../sliders/VolumeSlider.vue';
import TimeGroup from '../TimeGroup.vue';
import Captions from '../Captions.vue';
import Gestures from '../Gestures.vue';
import Seek10Button from '../buttons/Seek10Button.vue';
import SeekMinus10Button from '../buttons/Seek-10Button.vue';

const { thumbnails } = defineProps<{
  thumbnails?: string;
}>();
</script>

<template>
  <Gestures />
  <Captions />
  <media-controls class="vds-controls controls">
    <div class="vds-controls-spacer" />
    <media-controls-group class="vds-controls-group controls-group">
      <TimeSlider :thumbnails="thumbnails" />
    </media-controls-group>
    <media-controls-group class="vds-controls-group controls-group">
      <SeekMinus10Button tooltip-placement="top start"/>
      <PlayButton tooltip-placement="top" />
      <Seek10Button tooltip-placement="top"/>
      <MuteButton tooltip-placement="top" />
      <VolumeSlider />
      <TimeGroup />
      <ChapterTitle />
      <div class="vds-controls-spacer" />
      <CaptionButton tooltip-placement="top" />
      <SettingsMenu placement="top end" tooltip-placement="top" />
      <PIPButton tooltip-placement="top" />
      <FullscreenButton tooltip-placement="top end" />
    </media-controls-group>
  </media-controls>
</template>

<style scoped>
.controls :deep(media-time-slider) {
  --media-slider-height: 40px;
}

.controls :deep(media-time-slider media-slider-value) {
    background-color: unset;
}

.controls :deep(media-volume-slider) {
  --media-slider-height: 40px;
  --media-slider-preview-offset: 32px;
  margin-left: 1.5px;
  max-width: 80px;
}

.controls-group {
  background-color: rgb(0 0 0.5 / 60%);
  display: flex;
  align-items: center;
  width: 100%;
  border-radius: 20px;
}
.controls-group {
  padding-inline: 8px;
}
.controls-group:last-child {
  padding-bottom: 8px;
}
</style>
