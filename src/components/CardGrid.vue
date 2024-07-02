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
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .card-grid {
    padding: 40px;
  }
}
</style>