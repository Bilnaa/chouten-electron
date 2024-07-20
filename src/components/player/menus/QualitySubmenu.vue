<script setup lang="ts">
import Menu from './Menu.vue';
import MenuRadio from './MenuRadio.vue';
import Submenu from './Submenu.vue';
</script>

<template>
  <Submenu label="Quality">
    <template #icon>
      <media-icon class="icon" type="settings-menu" />
    </template>
    <template #content>
        <template>
            <media-quality-radio-group>
      <template>
        <media-radio>
          <span data-part="label"></span>
          <span data-part="bitrate"></span>
        </media-radio>
      </template>
    </media-quality-radio-group>
        </template>
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
