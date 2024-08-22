<template>
    <div class="card-grid-container">
      <div class="card-grid">
        <CardSkeleton v-for="i in 20" :key="i" />
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import CardSkeleton from './CardSkeleton.vue'
  
  export default {
    name: 'CardGridSkeleton',
    components: {
      CardSkeleton
    }
  }
  </script>
  
  <style scoped>
  .card-grid-container {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 70px;
  }
  
  .card-grid {
    display: flex;
    gap: 20px;
    padding: 0 20px;
    min-width: min-content;
  }
  </style>