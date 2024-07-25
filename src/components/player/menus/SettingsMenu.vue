<script setup lang="ts">
import type { MenuPlacement, TooltipPlacement } from 'vidstack';

import CaptionSubmenu from './CaptionSubmenu.vue';
import QualitySubmenu from './QualitySubmenu.vue'
import SpeedSubmenu from './SpeedSubmenu.vue';

import Menu from './Menu.vue';

const { placement, tooltipPlacement } = defineProps<{
  placement: MenuPlacement;
  tooltipPlacement: TooltipPlacement;
}>();
</script>

<template>
  <Menu :placement="placement" :tooltip-placement="tooltipPlacement">
    <template #button>
      <media-icon class="rotate-icon" type="settings" />
    </template>
    <template #content>
      <CaptionSubmenu />
      <QualitySubmenu />
      <SpeedSubmenu />
    </template>
    <template #tooltip-content>
      <span>Settings</span>
    </template>
  </Menu>
</template>

<style>
.rotate-icon {
  transition: transform 0.2s ease-out;
}

.media-button[aria-expanded='true'] .rotate-icon {
  transform: rotate(90deg);
  transition: transform 0.2s ease-in;
}
</style>
