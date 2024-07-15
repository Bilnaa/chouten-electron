<script setup lang="ts">
import { ref, computed, provide, onMounted, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import Sidebar from './components/Sidebar.vue';
import ModuleSelector from './components/ModuleSelector.vue';
import Modal from './components/Modal.vue';
import { Repo, Module } from './store/index';
import ToastManager from './components/ToastManager.vue';
import SplashScreen from './components/SplashScreen.vue'

const store = useStore();
const showModal = ref(false);

const selectedModule = computed(() => store.state.activeModule);
const selectedRepo = computed(() => store.state.repos.find((repo: { modules: any[]; }) => repo.modules.includes(selectedModule.value)) || null);


function openModal() {
  if (!store.state.repos.length || !store.state.repos.some((repo: { modules: string | any[]; }) => repo.modules.length)) {
    showToast('No Modules/Reposisotries', 'There are no modules or repositories to select from. Please import a module first.', 'Error', 5000);
    return;
  }
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
}

function handleModuleSelection({ repo }: { repo: Repo }, module: Module) {
  store.dispatch('setActiveModule', module);
  closeModal();
  console.log('Selected repo:', repo);
  console.log('Selected module:', module);
}

const toastManager = ref<InstanceType<typeof ToastManager> | null>(null);
const showSplash = ref(true);
const fadeOutSplash = ref(false);
const initToast = ref(false);

function showToast(title: string, message: string, icon = 'System', duration = 3000) {
  toastManager.value?.addToast(title, message, icon, duration);
}

provide('showToast', showToast);

onBeforeMount(() => {
  setTimeout(() => {
    fadeOutSplash.value = true;
    setTimeout(() => {
      showSplash.value = false;
    }, 300);
  }, 2500); 
});

onMounted(() => {
  if (store.state.repos.length) {
    showToast('Welcome back!', 'Welcome back to Chouten.', 'System', 3000);
  } else {
    initToast.value = true;
  }
  if (initToast.value) {
    setTimeout(() => {
      showToast('Welcome!', 'Welcome to Chouten. To get started, import a module or repository.', 'System', 5000);
      initToast.value = false;
    }, 3000);
  } else {
    setTimeout(() => {
      showToast('Welcome back!', 'Welcome back to Chouten.', 'System', 3000);
    }, 3000);
  }

  window.addEventListener('error', (event) => {
      showToast('Error', event.message, 'Error', 5000);
  });
  console.log(selectedRepo.value);
  console.log(selectedModule.value);
}); 

</script>

<template>
  <SplashScreen v-if="showSplash" :fadeOut="fadeOutSplash" />
  <div v-if="!showSplash">
    <div class="title-bar"></div>
    <Sidebar @open-module-selector="openModal" />
    <div class="container">
      <router-view />
    </div>
    <Modal :show="showModal" @close="closeModal">
      <ModuleSelector @module-selected="handleModuleSelection" />
    </Modal>
    <ToastManager ref="toastManager" />
  </div>

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
  position: relative;
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