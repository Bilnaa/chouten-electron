<script setup>
import { ref, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import Sidebar from './components/Sidebar.vue';
import ModuleSelector from './components/ModuleSelector.vue';
import Modal from './components/Modal.vue';

const store = useStore();
const showModal = ref(false);

const selectedRepo = computed(() => store.state.activeModule ? store.state.repos.find(repo => repo.modules.includes(store.state.activeModule)) : null);
const selectedModule = computed(() => store.state.activeModule);

function openModal() {
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
}

function handleModuleSelection({ repo, module }) {
  store.dispatch('setActiveModule', module);
  closeModal();
  console.log('Selected repo:', repo);
  console.log('Selected module:', module);

  // Store the selected module and repo in localStorage
  localStorage.setItem('selectedRepo', JSON.stringify(repo));
  localStorage.setItem('selectedModule', JSON.stringify(module));
}

onMounted(() => {
  // Retrieve the selected module and repo from localStorage
  const storedRepo = localStorage.getItem('selectedRepo');
  const storedModule = localStorage.getItem('selectedModule');

  if (storedRepo) {
    const repo = JSON.parse(storedRepo);
    // Update Vuex store if needed
  }
  if (storedModule) {
    const module = JSON.parse(storedModule);
    store.dispatch('setActiveModule', module);
  }
});
</script>

<template>
  <div class="title-bar"></div>
  <Sidebar @open-module-selector="openModal"/>
  <div class="container">
    <div v-if="selectedModule">
      <p>Selected Repo: {{ selectedRepo?.name }}</p>
      <p>Selected Module: {{ selectedModule.name }}</p>
    </div>
    <router-view />
  </div>
  <Modal :show="showModal" @close="closeModal">
    <ModuleSelector @module-selected="handleModuleSelection" />
  </Modal>
</template>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  overflow: hidden;
}

.title-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-app-region: drag;
}

#app {
  color: white;
  height: 100vh;
  overflow: hidden;
}

.container {
  margin-left: 120px;
  padding: 20px;
  overflow-y: auto;
  height: 100vh;
  background-color: #0C0C0C;
}

.select-module-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin-bottom: 20px;
}

.select-module-btn:hover {
  background-color: #2980b9;
}
</style>
