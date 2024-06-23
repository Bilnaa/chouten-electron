<template>
    <div class="card-grid">
      <Card v-for="i in 3" :key="i" />
    </div>
  </template>
  
  <script>
  import Card from './Card.vue'
  
  export default {
    name: 'CardGrid',
    components: {
      Card
    }
  }
  </script>
  
  <style scoped>
  .card-grid {
    display: flex;
    overflow-x: auto;
    padding: 20px 0;
  }
  </style>