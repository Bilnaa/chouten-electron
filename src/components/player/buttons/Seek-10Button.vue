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
            <media-seek-button class="media-button" :seconds="-10">
                <media-icon class="seek-icon" type="seek-backward-10" />
            </media-seek-button>
        </template>
        <template #content>
            <span class="seek-tooltip-text">Seek 10s</span>
        </template>
    </Tooltip>
</template>