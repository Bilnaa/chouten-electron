<template>
  <div class="card-grid-container">
    <div class="card-grid">
      <Card v-for="card in data" :key="card.url" v-bind="card" />
    </div>
  </div>
</template>

<script>
import Card from './Card.vue'

export default {
  name: 'CardGrid',
  components: {
    Card
  },
  props: {
    data : {
      type: Array,
      required: true
    }
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