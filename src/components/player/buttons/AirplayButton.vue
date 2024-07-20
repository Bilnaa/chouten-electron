<script setup lang="ts">
import type { TooltipPlacement } from 'vidstack';

import Tooltip from '../Tooltip.vue';

const { tooltipPlacement } = defineProps<{
    tooltipPlacement: TooltipPlacement;
}>();
</script>

<template>
    <Tooltip :placement="tooltipPlacement">
        <template #trigger>
            <media-airplay-button class="media-button">
                <media-icon class="airplay-icon" type="airplay" />
            </media-airplay-button>
        </template>
        <template #content>
            <span class="airplay-tooltip-text">Airplay</span>
        </template>
    </Tooltip>
</template>

<style scoped>
.media-button[data-active] .airplay-icon {
    display: none;
}
</style>