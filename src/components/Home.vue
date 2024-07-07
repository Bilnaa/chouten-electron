<template>
  <div class="home">
    <div class="top-bar">
      <SearchButton />
    </div>
    <div class="main-content">
      <CardGrid />
      <Section title="Section n" use="TextItem" />
      <Section title="Section" use="NumberedItem" />
    </div>
  </div>
</template>

<script>
import Sidebar from './Sidebar.vue'
import CardGrid from './CardGrid.vue'
import Section from './Section.vue'
import SearchButton from './SearchButton.vue'

export default {
  name: 'Home',
  components: {
    Sidebar,
    CardGrid,
    Section,
    SearchButton,
  }
}
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  height: 100vh;
  color: #ffffff; /* Light text color for contrast */
}

.top-bar {
  display: flex;
  margin-top: 20px;
  justify-content: flex-end;
  align-items: center;
  padding: 10px 20px;
}

.main-content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
  min-width: 900px;
}
</style>