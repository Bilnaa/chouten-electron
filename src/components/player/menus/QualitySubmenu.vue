<script setup lang="ts">
import MenuRadio from './MenuRadio.vue';
import Submenu from './Submenu.vue';
</script>

<template>
    <Submenu label="Quality">
        <template #icon>
            <media-icon class="icon" type="settings-menu" />
        </template>
        <template #content>
            <media-quality-radio-group class="radio-group">
                <template>
                    <MenuRadio />
                </template>
            </media-quality-radio-group>
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