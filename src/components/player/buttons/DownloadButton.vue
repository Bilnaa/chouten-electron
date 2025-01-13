<template>
  <Tooltip :placement="tooltipPlacement">
    <template #trigger>
      <media-button class="media-button" @click="downloadVideo">
        <media-icon type="download" />
      </media-button>
    </template>
    <template #content>
      <span>Download</span>
    </template>
  </Tooltip>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Tooltip from '../Tooltip.vue';
import type { TooltipPlacement } from 'vidstack';

const { tooltipPlacement } = defineProps<{
  tooltipPlacement: TooltipPlacement;
}>();

const mediaPlayer = ref<HTMLMediaElement>();

onMounted(() => {
  mediaPlayer.value = document.querySelector('media-player video') as HTMLMediaElement;
});

const downloadVideo = async () => {
  // all the logic will go there
};
</script>

<style scoped>
.tooltip-container {
  position: relative;
  display: inline-block;
}

.vds-button {
  width: 40px;
  height: 40px;
}

.vds-icon {
  width: 24px;
  height: 24px;
}

.vds-tooltip-content {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  z-index: 1000;
}

</style> 