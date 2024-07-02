<template>
    <div class="home">
      <div class="main-content">
        <CardGrid />
        <Section title="Section">
          <TextItem v-for="i in 10" :key="i" title="Title" />
          <SeeAllButton />
        </Section>
        <Section title="Section">
          <NumberedItem v-for="i in 8" :key="i" :number="i" title="Title" />
          <SeeAllButton />
        </Section>
      </div>
    </div>
  </template>
  
  <script>
  import Sidebar from './Sidebar.vue'
  import CardGrid from './CardGrid.vue'
  import Section from './Section.vue'
  import TextItem from './TextItem.vue'
  import NumberedItem from './NumberedItem.vue'
  import SeeAllButton from './SeeAllButton.vue'
  
  export default {
    name: 'Home',
    components: {
      Sidebar,
      CardGrid,
      Section,
      TextItem,
      NumberedItem,
      SeeAllButton
    }
  }
  </script>
  
  <style scoped>
  .home {
    display: flex;
    height: 100vh;
  }
  
  .main-content {
    flex-grow: 1;
    overflow-y: auto;
    padding: 20px;
  }
  </style>