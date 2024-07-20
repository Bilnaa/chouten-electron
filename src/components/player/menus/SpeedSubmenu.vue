<script setup lang="ts">
import MenuRadio from './MenuRadio.vue';
import Submenu from './Submenu.vue';
</script>

<template>
    <Submenu label="Speed">
        <template #icon>
            <media-icon class="icon" type="playback-speed-circle" />
        </template>
        <template #content>
            <media-speed-radio-group>
                <template>
                    <MenuRadio />
                </template>
            </media-speed-radio-group>
        </template>
    </Submenu>
</template>

<style scoped>
.icon {
    width: 22px;
    height: 22px;
}

.radio-group {
    width: 100%;
    display: flex;
    flex-direction: column;
}
</style>