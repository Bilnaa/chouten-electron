<script setup lang="ts">
import { ref, computed, provide, onMounted, onBeforeMount, watch} from 'vue';
import { useStore } from 'vuex';
import Sidebar from './components/Sidebar.vue';
import ModuleSelector from './components/ModuleSelector.vue';
import Modal from './components/Modal.vue';
import { Repo, Module } from './store/index';
import ToastManager from './components/ToastManager.vue';
import SplashScreen from './components/SplashScreen.vue'
import Settings from './components/Settings.vue';
import { useRouter } from 'vue-router';


const store = useStore();
const showModal = ref(false);
const modal = ref('');

const selectedModule = computed(() => store.state.activeModule);

if(localStorage.getItem('currentPages') === null) {
  localStorage.setItem('currentPages', '[]');
}

const loadRepos = async () => {
      try {
        const result = await window.ipcRenderer.invoke('get-repo-list');
        if (result.success) {
          return result.repoList;
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error('Failed to load repos:', error);
        showToast('Failed to load repos', 'An error occurred while trying to load the repos.', 'Error', 5000);
      }
    };

async function openModal() {
  const repos = await loadRepos();
  if (repos.length === 0) {
    showToast('No Modules/Reposisotries', 'There are no modules or repositories to select from. Please import a module first.', 'Error', 5000);
    return;
  }
  modal.value = 'modules';
  showModal.value = true;
}

function openSettings() {
  modal.value = 'settings';
  console.log('Settings opened');
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
  if(localStorage.getItem('accentColor') != undefined) {
    console.log('here')
    document.documentElement.style.setProperty('--accent-color', localStorage.getItem('accentColor') as string);
  }
  if (selectedModule.value) {
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

  
  const router = useRouter();
  if(window.location.hash !== '#discover') {
    watch(selectedModule, (newModule) => {
      if (newModule) {
          showToast('Module Selected', `Selected module: ${newModule.name}`, 'System', 3000);
          router.push({ name: 'Discover' });
      }
  });
  }

  const originalError = console.error;
  console.error = function (...args: any[]) {
    originalError.apply(console, args);
    showToast('Error', args.join(' ').replace("Error: Error invoking remote method 'execute-script': Error: Error:",'Module error:'), 'Error', 5000);
  };
  console.log(selectedModule.value);
}); 



</script>

<template>
  <SplashScreen v-if="showSplash" :fadeOut="fadeOutSplash" />
  <div v-if="!showSplash">
    <div class="title-bar"></div>
    <Sidebar @open-module-selector="openModal" @open-settings="openSettings" />
    <div class="container">
      <router-view />
    </div>
    <Modal :show="showModal" @close="closeModal">
      <ModuleSelector v-if="modal=='modules'" @module-selected="handleModuleSelection" />
      <Settings v-else-if="modal=='settings'"/>
    </Modal>
    <ToastManager ref="toastManager" />
  </div>

</template>


<style>
body {
  margin: 0;
  font-family: 'Poppins', sans-serif;
  overflow: hidden;
}

.title-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40px;
  z-index: 9999; /* Ensure it's on top of everything */
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