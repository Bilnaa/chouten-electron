<script setup>
import TextItem from './TextItem.vue'
import SeeAllButton from './SeeAllButton.vue'
import NumberedItem from './NumberedItem.vue';
</script>
<template>
  <section class="section">
    <h2>{{ title }}</h2>
    <div class="scroll-container">
      <div class="card-container">
        <component 
          v-for="(item, index) in data" 
          :key="index" 
          :is="component" 
          v-bind="item"
          class="card fade-in"
          v-observe-visibility="{
  callback: visibilityChanged,
  once: true,
}"
        />
      </div>
    </div>
  </section>
</template>


<script>
import { shallowRef } from 'vue';
import { ObserveVisibility } from 'vue-observe-visibility';
export default {
  components: {
    TextItem,
    SeeAllButton,
    NumberedItem
  },
  props: {
    title: String,
    use: String,
    data: Array
  },
  data() {
    return {
      components: {
        TextItem: shallowRef(TextItem),
        NumberedItem: shallowRef(NumberedItem)
      },
      component: shallowRef(TextItem),
      componentClass: ''
    }
  },
  watch: {
    use() {
      this.component = this.components[this.use]
      this.componentClass = this.use === 'NumberedItem' ? 'section-content-numbered' : ''
    }
  },
  methods: {
    visibilityChanged(isVisible, entry) {
      if (isVisible) {
        entry.target.classList.add('fade-in');
      }
    }
  },
  mounted() {
    
    this.component = this.components[this.use],
    this.componentClass = this.use === 'NumberedItem' ? 'section-content-numbered' : 'section-content'

    this.$nextTick(() => {
      this.$el.classList.add('fade-in');
    });
  }
}
</script>

<style scoped>
.section {
  margin-bottom: 20px;
}

.scroll-container {
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none;  /* Internet Explorer 10+ */
}

.scroll-container::-webkit-scrollbar { /* WebKit */
  width: 0;
  height: 0;
}

.card-container {
  display: inline-flex;
  padding: 10px 0;
  gap: 10px; /* Use gap instead of margin for consistent spacing */
}

.card {
  flex: 0 0 auto;
  width: 160px; /* Match the width in TextItem.vue */
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
}


.card.fade-in {
  opacity: 0;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn 0.5s ease-in-out forwards;
}
 
</style>