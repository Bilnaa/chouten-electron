<script setup>
import TextItem from './TextItem.vue'
import SeeAllButton from './SeeAllButton.vue'
</script>
<template>
    <section class="section">
      <!-- <h2>{{ title }}</h2> -->
    <h2>SECTION</h2>
      <div class="section-content">
        <TextItem 
          v-for="i in 12" 
          :key="i" 
          :title="`Title ${i}`"
          :index="i"
        />
        <SeeAllButton />
      </div>
    </section>
  </template>

    <style scoped>
    .section-content {
      display: flex;
      overflow-x: auto;
      padding: 20px 0;
      gap: 10px;
    }
    </style>