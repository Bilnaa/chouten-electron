<script setup lang="ts">
import { ref, computed, provide, onMounted, onBeforeMount, watch} from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { Repo, Module } from './store/index';
import Sidebar from './components/Sidebar.vue';
import ModuleSelector from './components/ModuleSelector.vue';
import Modal from './components/Modal.vue';
import ToastManager from './components/ToastManager.vue';
import SplashScreen from './components/SplashScreen.vue'
import Settings from './components/Settings.vue';

// Import icons
import CloseIcon from 'vue-material-design-icons/Close.vue';
import MinimizeIcon from 'vue-material-design-icons/Minus.vue';
import MaximizeIcon from 'vue-material-design-icons/WindowMaximize.vue';
import RestoreIcon from 'vue-material-design-icons/WindowRestore.vue';

// Electron
const ipcRenderer  = window.ipcRenderer

// State management
const store = useStore();
const router = useRouter();
const showModal = ref(false);
const modal = ref('');
const selectedModule = computed(() => store.state.activeModule);
const isMaximized = ref(false);
const isLinuxOrWindows = navigator.userAgent.includes('Linux') || navigator.userAgent.includes('Windows');

// Toast management
const toastManager = ref<InstanceType<typeof ToastManager> | null>(null);
const showToast = (title: string, message: string, icon = 'System', duration = 3000) => {
  toastManager.value?.addToast(title, message, icon, duration);
};
provide('showToast', showToast);

// Splash screen management
const showSplash = ref(true);
const fadeOutSplash = ref(false);
const initToast = ref(false);

// Repository management
const loadRepos = async () => {
  try {
    const result = await ipcRenderer.invoke('get-repo-list');
    if (result.success) return result.repoList;
    throw new Error(result.error);
  } catch (error) {
    console.error('Failed to load repos:', error);
    showToast('Failed to load repos', 'An error occurred while trying to load the repos.', 'Error', 5000);
  }
};

// Modal management
const openModal = async () => {
  const repos = await loadRepos();
  if (repos?.length === 0) {
    showToast('No Modules/Repositories', 'There are no modules or repositories to select from. Please import a module first.', 'Error', 5000);
    return;
  }
  modal.value = 'modules';
  showModal.value = true;
};

const openSettings = () => {
  modal.value = 'settings';
  console.log('Settings opened');
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const handleModuleSelection = ({ repo }: { repo: Repo }, module: Module) => {
  store.dispatch('setActiveModule', module);
  closeModal();
  console.log('Selected repo:', repo);
  console.log('Selected module:', module);
};

// Window control functions
const minimizeWindow = () => ipcRenderer.send('minimize-window');
const maximizeWindow = async () => {
  await ipcRenderer.invoke('is-maximized').then((maximized: boolean) => {
      isMaximized.value = maximized;
  });

  if (isMaximized.value) {
    restoreWindow();
  } else {
    ipcRenderer.send('maximize-window');
  }
  await ipcRenderer.invoke('is-maximized').then((maximized: boolean) => {
      isMaximized.value = maximized;
  });
};
const restoreWindow = () => {
  ipcRenderer.send('restore-window');
  isMaximized.value = false;
};

const closeWindow = () => ipcRenderer.send('close-window');

// Lifecycle hooks
onBeforeMount(() => {
  setTimeout(() => {
    fadeOutSplash.value = true;
    setTimeout(() => {
      showSplash.value = false;
    }, 300);
  }, 2500);
});

onMounted(() => {
  // Set accent color
  const accentColor = localStorage.getItem('accentColor');
  if (accentColor) {
    document.documentElement.style.setProperty('--accent-color', accentColor);
  }
  router.push({ name: 'Discover' });

  watch(isMaximized, (newMaximized) => {
  if (newMaximized) {
    document.getElementById('app')?.style.setProperty('border-radius', '0px');
  } else {
    document.getElementById('app')?.style.setProperty('border-radius', '10px');
  }
  });

  // Show initial toast
  setTimeout(() => {
    const toastMessage = selectedModule.value 
      ? 'Welcome back to Chouten.'
      : 'Welcome to Chouten. To get started, import a module or repository.';
    showToast('Welcome!', toastMessage, 'System', 5000);
  }, 3000);

  // Watch for module changes
  if (window.location.hash !== '#discover') {
    watch(selectedModule, (newModule) => {
      if (newModule) {
        showToast('Module Selected', `Selected module: ${newModule.name}`, 'System', 3000);
        router.push({ name: 'Discover' });
      }
    });
  }

  // check every sec if it's maximized
  setInterval(async () => {
    await ipcRenderer.invoke('is-maximized').then((maximized: boolean) => {
      isMaximized.value = maximized;
    });
  }, 1000);

  // Override console.error for custom error handling
  const originalError = console.error;
  console.error = (...args: any[]) => {
    originalError.apply(console, args);
    const errorMessage = args.join(' ').replace("Error: Error invoking remote method 'execute-script': Error: Error:", 'Module error:');
    showToast('Error', errorMessage, 'Error', 5000);
  };

  // Check initial window state
  ipcRenderer.invoke('is-maximized').then((maximized: boolean) => {
    isMaximized.value = maximized;
  });
});

// Initialize localStorage
if (localStorage.getItem('currentPages') === null) {
  localStorage.setItem('currentPages', '[]');
}
</script>

<template>
  <SplashScreen v-if="showSplash" :fadeOut="fadeOutSplash" />
  <div v-else>
    
    <Sidebar @open-module-selector="openModal" @open-settings="openSettings" />
    <div class="container">
      <div class="title-bar">
      <div class="title-bar-drag-area"></div>
      <div class="title-bar-buttons" v-if="isLinuxOrWindows" >
        <button @click="minimizeWindow" class="title-bar-button">
          <MinimizeIcon :size="16" />
        </button>
        <button @click="maximizeWindow" class="title-bar-button">
          <MaximizeIcon v-if="!isMaximized" :size="16" />
          <RestoreIcon v-else :size="16" />
        </button>
        <button @click="closeWindow" class="title-bar-button close">
          <CloseIcon :size="16" />
        </button>
      </div>
    </div>
      <router-view />
    </div>
    <Modal :show="showModal" @close="closeModal">
      <ModuleSelector v-if="modal === 'modules'" @module-selected="handleModuleSelection" />
      <Settings v-else-if="modal === 'settings'" />
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
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  -webkit-app-region: drag;
}

.title-bar-drag-area {
  flex-grow: 1;
  height: 100%;
}

.title-bar-buttons {
  display: flex;
  z-index: 9999;
  -webkit-app-region: no-drag;
}

.title-bar-button {
  width: 46px;
  height: 32px;
  border: none;
  background-color: transparent;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.title-bar-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.title-bar-button.close:hover {
  background-color: #e81123;
}

#app {
  position: relative;
  color: white;
  height: 100vh;
  overflow: hidden;
  border-radius: 10px;
}

.container {
  margin-left: 120px;
  padding: 20px;
  overflow-y: auto;
  height: calc(100vh - 32px); /* Adjust height to account for title bar */
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