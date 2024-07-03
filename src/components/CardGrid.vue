<template>
  <div class="card-grid-container">
    <div class="card-grid">
      <Card v-for="i in 3" :key="i" />
    </div>
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
.card-grid-container {
  width: 100%;
  overflow-x: auto;
  padding: 20px 0;
}

.card-grid {
  display: flex;
  gap: 20px;
  padding: 0 20px;
  min-width: min-content;
}

</style>