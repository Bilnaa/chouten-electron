<script setup>
import TextItem from './TextItem.vue'
import SeeAllButton from './SeeAllButton.vue'
import NumberedItem from './NumberedItem.vue';
</script>
<template>
  <section class="section">
    <h2>{{ title }}</h2>
    <div :class="componentClass">
      <component v-for="i in 10" :key="i" :is="component" :title="'Title ' + i" :number="i"  />
    </div>
  </section>
</template>

<script>
export default {
  components: {
    TextItem,
    SeeAllButton,
    NumberedItem
  },
  props: {
    title: String,
    use: String
  },
  data() {
    return {
      components: {
        TextItem,
        NumberedItem
      },
      component: TextItem,
      componentClass: ''
    }
  },
  watch: {
    use() {
      this.component = this.components[this.use]
      this.componentClass = this.use === 'NumberedItem' ? 'section-content-numbered' : ''
    }
  },
  mounted() {
    this.component = this.components[this.use],
      this.componentClass = this.use === 'NumberedItem' ? 'section-content-numbered' : 'section-content'
  }
}
</script>

<style scoped>
.section-content {
  display: flex;
  overflow-x: auto;
  padding: 20px 0;
  gap: 10px;
}

.section-content-numbered {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); /* Adjust min width as needed */
  grid-template-rows: repeat(2, auto); /* Two rows, adjust height as needed */
  gap: 10px;
  padding: 10px;
  /* Optional: add align-items to align grid items vertically if needed */
  align-items: start; /* Align items to the start of the grid area */
}
.section-content-numbered {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); /* Responsive columns */
  grid-auto-rows: minmax(100px, auto); /* Ensure rows grow based on content */
  gap: 10px; /* Space between cards */
  padding: 10px;
}

</style>