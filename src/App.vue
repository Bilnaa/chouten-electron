<script setup>
import Sidebar from './components/Sidebar.vue'

</script>

<template>
    <Sidebar style="position: absolute;" />
    <div class="container">
        <router-view />
    </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}


#app {
  background-color: #0A0A0A;
  color: white;
  height: 100vh;
  overflow: hidden;
}

.container {
  margin-left: 120px;
  padding: 20px;
  overflow-y: auto;
  height: 100vh;
}
</style>