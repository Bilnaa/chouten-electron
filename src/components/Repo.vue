<template>
  <div class="repos-container">
    <div class="header">
      <h1>Repos</h1>
      <button class="add-button" @click="openAddRepoModal">+</button>
    </div>
    <div class="search-bar">
      <input type="text" placeholder="Search for repo..." v-model="searchQuery">
    </div>
    <div class="repo-list">
      <div v-for="repo in filteredRepos" :key="repo.id" class="repo-item" @click="openModulesModal(repo)">
        <img :src="repo.icon" alt="Repo icon" class="repo-icon">
        <div class="repo-info">
          <h3>{{ repo.name }}</h3>
          <p>{{ repo.author }} · {{ repo.url }}</p>
        </div>
        <button class="remove-button" @click.stop="confirmRemoveRepo(repo)">×</button>
      </div>
    </div>

    <!-- Install Repo Modal -->
    <div v-if="showAddRepoModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <button class="modal-close" @click="closeAddRepoModal">Done</button>
          <h2>Install a Repo</h2>
          <div class="placeholder"></div>
        </div>
        <div class="modal-content">
          <input 
            v-model="newRepo.url" 
            placeholder="Repo url..."
            :class="{ 'error': urlError }"
            @input="validateUrl"
          >
          <p v-if="urlError" class="error-message">{{ urlError }}</p>
          <div class="disclaimer">
            <h3>Disclaimer:</h3>
            <p>
              Chouten does not guarantee the safety of any repo or module that isn't officially
              made by the <strong>Chouten Team</strong>. Anything that has the author name "<strong>Chouten-Team</strong>" but wasn't found on our server is <strong>not</strong> by us.
              Install at your own risk.
            </p>
          </div>
          <div v-if="!newRepo.url" class="no-url-message">
            <h3>No repo url.</h3>
            <p>Please enter a repo url in the textbox at the top to install a repo and its modules.</p>
          </div>
          <div v-if="newRepo.url && !installError" class="repo-preview">
    <div class="repo-header">
      <img :src="newRepo.url + '/icon.png'" alt="Repo icon" class="repo-icon">
      <div class="repo-title">
        <h3>{{ newRepo.name }}</h3>
        <h2>{{ newRepo.name }}</h2>
      </div>
    </div>
    <p class="install-alongside">Install alongside</p>
    <div v-for="module in newRepo.modules" :key="module.id" class="module-item">
      <div class="module-info">
        <img :src="module.iconPath" alt="Module icon" class="module-icon">
        <div class="module-details">
          <h4>{{ module.name }}</h4>
          <p>{{ module.author }} · v{{ module.version }}</p>
        </div>
      </div>
      <button 
        class="select-button" 
        :class="{ 'selected': module.selected }"
        @click="toggleModuleSelection(module)"
      ></button>
    </div>
  </div>
          <div v-if="installError" class="error-message">
            <p>{{ installError }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button 
            class="install-button" 
            @click="installRepo" 
            :disabled="!newRepo.url || !!urlError || isLoading"
          >
            {{ isLoading ? 'Installing...' : 'Install' }}
          </button>
          <button class="cancel-button" @click="closeAddRepoModal">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Confirm Remove Repo Modal -->
    <div v-if="showRemoveModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2>Remove Repo</h2>
        </div>
        <div class="modal-content">
          <p>Are you sure you want to remove this repo?</p>
          <p><strong>{{ repoToRemove?.name }}</strong></p>
        </div>
        <div class="modal-footer">
          <button class="cancel-button" @click="handleRemoveRepo" style="background-color: #ff4444;">Remove</button>
          <button class="cancel-button" @click="closeRemoveModal">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Modules Modal -->
    <div v-if="showModulesModal" class="modal-overlay">
      <div class="modal modules-modal">
        <div class="modal-header">
          <button class="modal-close" @click="closeModulesModal">Close</button>
          <h2>{{ selectedRepo?.name }} Modules</h2>
          <div class="placeholder"></div>
        </div>
        <div class="modal-content">
          <div v-for="module in selectedRepo?.modules" :key="module.id" class="module-item">
            <img :src="module.iconPath" alt="Module icon" class="module-icon">
            <div class="module-info">
              <h3>{{ module.name }}</h3>
              <p>{{ module.author }} · v{{ module.version }}</p>
            </div>
            <div class="module-actions">
              <button class="modal-update-button" @click="updateModule(module)">Update</button>
              <button class="modal-remove-button" @click="removeModule(module)">Remove</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'vuex';
import { Repo, Module } from '../store/index';
import axios from 'axios';

export default defineComponent({
  setup() {
    const store = useStore();
    const module = ref<Module | null>(null);
    const searchQuery = ref('');
    const showAddRepoModal = ref(false);
    const showRemoveModal = ref(false);
    const showModulesModal = ref(false);
    const newRepo = ref({ url: '', name: '', description: '', modules: [] });
    const repoToRemove = ref<Repo | null>(null);
    const selectedRepo = ref<Repo | null>(null);
    const urlError = ref('');
    const installError = ref('');
    const isLoading = ref(false);

    const openAddRepoModal = () => {
      showAddRepoModal.value = true;
      newRepo.value = { url: '', name: '', description: '', modules: [] };
      urlError.value = '';
      installError.value = '';
    };

    const closeAddRepoModal = () => {
      showAddRepoModal.value = false;
      newRepo.value = { url: '', name: '', description: '', modules: [] };
      urlError.value = '';
      installError.value = '';
      isLoading.value = false;
    };

    const validateUrl = () => {
      const urlPattern = /^(https?:\/\/)?([^\s\/$.?#].[^\s]*)$/;
      if (!newRepo.value.url) {
        urlError.value = '';
      } else if (!urlPattern.test(newRepo.value.url)) {
        urlError.value = 'Please enter a valid URL';
      } else {
        urlError.value = '';
        fetchRepoData();
      }
    };

    const fetchRepoData = async () => {
      if (urlError.value || !newRepo.value.url) return;

      isLoading.value = true;
      installError.value = '';

      try {
        const repoUrl = new URL(newRepo.value.url);
        const metadataUrl = `${repoUrl.origin}/${repoUrl.pathname.split('/').pop()}/metadata.json`;
        
        const response = await axios.get(metadataUrl);
        const repoData = response.data;

        newRepo.value = {
          url: repoData.url,
          name: repoData.title,
          description: repoData.description,
          modules: repoData.modules.map((module: any) => ({ ...module, selected: false }))
        };
      } catch (error) {
        installError.value = 'Failed to fetch repo data. Please try again.';
      } finally {
        isLoading.value = false;
      }
    };

    const installRepo = async () => {
      if (urlError.value || !newRepo.value.url) return;

      isLoading.value = true;
      installError.value = '';

      try {
        const repoUrl = new URL(newRepo.value.url);
        const repoId = repoUrl.pathname.split('/').pop() || '';

        const selectedModules = newRepo.value.modules.filter(module => module.selected);
        
        for (const module of selectedModules) {
          await installModule(repoId, module);
        }

        const newRepoObject: Repo = {
          id: repoId,
          name: newRepo.value.name,
          author: 'Chouten-Team', // Assuming all repos are by Chouten-Team
          url: newRepo.value.url,
          icon: `${repoUrl.origin}/${repoId}/icon.png`,
          modules: selectedModules
        };

        store.dispatch('addRepo', newRepoObject);
        closeAddRepoModal();
      } catch (error) {
        installError.value = 'Failed to install the repo. Please try again.';
      } finally {
        isLoading.value = false;
      }
    };

    const installModule = async (repoId: string, module: Module) => {
      const moduleUrl = `${newRepo.value.url}${module.filePath}`;
      const response = await axios.get(moduleUrl, { responseType: 'arraybuffer' });
      const moduleData = response.data;

      const result = await window.ipcRenderer.invoke('install-module', repoId, moduleData, module.name);
      if (!result.success) {
        throw new Error(result.error);
      }
    };

    const confirmRemoveRepo = (repo: Repo) => {
      repoToRemove.value = repo;
      showRemoveModal.value = true;
    };

    const handleRemoveRepo = () => {
      if (repoToRemove.value) {
        store.dispatch('removeRepo', repoToRemove.value.id);
        window.ipcRenderer.invoke('remove-repo', repoToRemove.value.id);
      }
      closeRemoveModal();
    };

    const closeRemoveModal = () => {
      showRemoveModal.value = false;
      repoToRemove.value = null;
    };

    const filteredRepos = computed(() => {
      return store.getters.filteredRepos(searchQuery.value);
    });

    const openModulesModal = (repo: Repo) => {
      selectedRepo.value = repo;
      showModulesModal.value = true;
    };

    const closeModulesModal = () => {
      showModulesModal.value = false;
      selectedRepo.value = null;
    };

    const updateModule = async (module: Module) => {
  // Implement module update logic here
  console.log('Updating module:', module);
  // After updating the module data
  store.dispatch('updateModule', { repoId: selectedRepo.value?.id, updatedModule: module });
};

const removeModule = async (module: Module) => {
  if (selectedRepo.value) {
    await window.ipcRenderer.invoke('remove-module', selectedRepo.value.id, module.name);
    store.dispatch('removeModule', { repoId: selectedRepo.value.id, moduleId: module.id });
    // Update the selectedRepo.value to reflect the change
    selectedRepo.value = store.getters.repos.find((repo: Repo) => repo.id === selectedRepo.value?.id);
  }
};
const toggleModuleSelection = (module: Module) => {
  module.selected = !module.selected;
};


    return {
      searchQuery,
      showAddRepoModal,
      showRemoveModal,
      newRepo,
      repoToRemove,
      urlError,
      installError,
      isLoading,
      filteredRepos,
      openAddRepoModal,
      closeAddRepoModal,
      validateUrl,
      installRepo,
      confirmRemoveRepo,
      handleRemoveRepo,
      closeRemoveModal,
      showModulesModal,
      selectedRepo,
      openModulesModal,
      closeModulesModal,
      updateModule,
      removeModule,
      toggleModuleSelection
    };
  }
});
</script>

<style scoped>
.repos-container {
  padding: 20px;
  color: white;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.add-button {
  background-color: #333;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.search-bar {
  margin-bottom: 20px;
}

.search-bar input,
.repo-item {
  width: 100%;
  box-sizing: border-box;
}

.search-bar input {
  padding: 10px;
  background-color: #252525;
  color: white;
  border: none;
  border-radius: 5px;
}

.repo-list {
  margin-top: 20px;
}

.repo-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #252525;
  margin-bottom: 10px;
  border-radius: 5px;
}

.repo-icon {
  width: 24px;
  height: 24px;
  margin-right: 10px;
}

.repo-info {
  flex-grow: 1;
}

.repo-info h3 {
  margin: 0;
}

.repo-info p {
  margin: 5px 0 0;
  font-size: 0.9em;
  color: #aaa;
}

.remove-button {
  background-color: #ff4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 10px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background-color: #1e1e1e;
  width: 500px;
  max-width: 90%;
  border-radius: 10px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #252525;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
}

.modal-close, .placeholder {
  font-size: 16px;
  color: #007AFF;
  background: none;
  border: none;
  cursor: pointer;
  width: 60px;
}

.placeholder {
  visibility: hidden;
}

.modal-content {
  padding: 20px;
}

.modal-content input {
  width: 96%;
  padding: 10px;
  margin-bottom: 10px;
  background-color: #252525;
  color: white;
  border: none;
  border-radius: 5px;
}

.modal-content input.error {
  border: 1px solid #ff4444;
}

.error-message {
  color: #ff4444;
  font-size: 14px;
  margin-bottom: 10px;
}

.disclaimer, .no-url-message {
  background-color: #252525;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
}

.disclaimer h3, .no-url-message h3 {
  margin-top: 0;
  font-size: 16px;
}

.disclaimer p, .no-url-message p {
  margin-bottom: 0;
  font-size: 14px;
  line-height: 1.4;
}

.modal-footer {
  padding: 15px 20px;
  background-color: #252525;
}

.install-button, .cancel-button, .modal-footer .remove-button {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.install-button {
  background-color: #007AFF;
}

.install-button:disabled {
  background-color: #555;
  cursor: not-allowed;
}

.cancel-button {
  background-color: #333;
}

.modules-modal {
  width: 500px;
  max-width: 90%;
  background-color: #1e1e1e;
  border-radius: 10px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #252525;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  color: white;
}

.modal-close {
  font-size: 16px;
  color: #007AFF;
  background: none;
  border: none;
  cursor: pointer;
}

.modal-content {
  padding: 20px;
}

.module-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #252525;
  margin-bottom: 10px;
  border-radius: 5px;
}

.module-icon {
  width: 48px;
  height: 48px;
  margin-right: 15px;
  border-radius: 5px;
  background-color: #ccc;
}

.module-info {
  flex-grow: 1;
}

.module-info h3 {
  margin: 0;
  font-size: 16px;
  color: white;
}

.module-info p {
  margin: 5px 0 0;
  font-size: 14px;
  color: #aaa;
}

.module-actions {
  display: flex;
  gap: 10px;
}

.modal-update-button, .modal-remove-button {
  padding: 5px 15px;
  font-size: 14px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.modal-update-button {
  background-color: #007AFF;
  color: white;
}

.modal-remove-button {
  background-color: #ff4444;
  color: white;
}

.repo-preview {
  background-color: #1e1e1e;
  border-radius: 10px;
  padding: 15px;
  margin-top: 15px;
}

.repo-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.repo-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  margin-right: 15px;
}

.repo-title h3 {
  color: #888;
  margin: 0;
  font-size: 14px;
}

.repo-title h2 {
  margin: 5px 0 0;
  font-size: 18px;
}

.install-alongside {
  color: #888;
  font-size: 14px;
  margin-bottom: 10px;
}

.module-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #252525;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
}

.module-info {
  display: flex;
  align-items: center;
}

.module-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  margin-right: 10px;
}

.module-details h4 {
  margin: 0;
  font-size: 16px;
}

.module-details p {
  margin: 5px 0 0;
  font-size: 12px;
  color: #888;
}

.select-button {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #555;
  background-color: transparent;
  cursor: pointer;
}

.select-button.selected {
  background-color: #7289DA;
  border-color: #7289DA;
}

.select-button.selected::after {
  content: '✓';
  color: white;
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}

</style>
