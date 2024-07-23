<template>
  <div class="repos-container">
    <div class="header">
  <h1>Repos</h1>
  <div class="header-buttons">
    <button class="icon-button refresh-button" @click="refreshRepos">
      <RefreshIcon />
    </button>
    <button class="icon-button add-button" @click="openAddRepoModal">
      <PlusIcon />
    </button>
  </div>
</div>
    <div class="search-bar">
      <input type="text" placeholder="Search for repo..." v-model="searchQuery">
    </div>
    <div class="repo-list">
      <div v-for="repo in filteredRepos" :key="repo.id" class="repo-item" @click="openModulesModal(repo)">
        <img :src="repo.icon" alt="Repo icon" class="repo-icon">
        <div class="repo-info">
          <h3>{{ repo.title}}</h3>
          <p>{{ repo.author }} · {{ repo.url }}</p>
        </div>
        <button class="remove-button" @click.stop="confirmRemoveRepo(repo)">
          <CloseIcon />
        </button>
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
                <h3>{{ newRepo.author }}</h3>
                <h2>{{ newRepo.title }}</h2>
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
          <p><strong>{{ repoToRemove?.title}}</strong></p>
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
          <h2>{{ selectedRepo?.title }} Modules</h2>
          <div class="placeholder"></div>
        </div>
        <div class="modal-content">
          <div v-for="module in selectedRepo?.modules.filter(m=>m.installed)" :key="module.id" class="module-item">
            <img :src="module.iconPath" alt="Module icon" class="module-icon">
            <div class="module-info">
              <h3>{{ module.name }}</h3>
              <p>{{ module.author }} · v{{ module.version }}</p>
            </div>
            <div class="module-actions">
              <button class="modal-refresh-button" @click="selectedRepo && refreshModule(selectedRepo.id, module.id)">
                <RefreshIcon />
              </button>
              <button 
                class="modal-update-button" 
                @click="updateModule(module)"
                :disabled="!isUpdateAvailable(module)"
              >
                {{ isUpdateAvailable(module) ? 'Update' : 'Up to date' }}
              </button>
              <button class="modal-remove-button" @click="removeModule(module, $event?.target)">
                <DeleteIcon />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, inject } from 'vue';
import RefreshIcon from 'vue-material-design-icons/Refresh.vue'
import PlusIcon from 'vue-material-design-icons/Plus.vue'
import CloseIcon from 'vue-material-design-icons/Close.vue'
import DeleteIcon from 'vue-material-design-icons/Delete.vue'
import { Repo, Module } from '../store/index';
import store from '../store/index';

export default defineComponent({
  setup() {
    const showToast = inject('showToast') as (title: string, message: string, icon?: string, duration?: number) => void;
    const searchQuery = ref('');
    const showAddRepoModal = ref(false);
    const showRemoveModal = ref(false);
    const showModulesModal = ref(false);
    const newRepo = ref({ id: '',url: '', title: '', description: '', author : '', icon : '',modules: [] as Module[] });
    const repoToRemove = ref<Repo | null>(null);
    const selectedRepo = ref<Repo | null>(null);
    const urlError = ref('');
    const installError = ref('');
    const isLoading = ref(false);
    const repos = ref<Repo[]>([]);

    const loadRepos = async () => {
      try {
        const result = await window.ipcRenderer.invoke('get-repo-list');
        if (result.success) {
          console.log('Repos:', result.repoList);
          repos.value = result.repoList;
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error('Failed to load repos:', error);
        showToast('Failed to load repos', 'An error occurred while trying to load the repos.', 'Error', 5000);
      }
    };

    onMounted(async () => {
      console.log('Repos mounted');
      await loadRepos();
    });

    const filteredRepos = computed(() => {
      return repos.value.filter(repo =>
        repo.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        repo.author.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    });

    const refreshRepos = async () => {
      await loadRepos();
      showToast('Repos refreshed', 'The repos folder has been refreshed successfully.', 'System', 3000);
    };

    const refreshModule = async (repoId: string, moduleId: string) => {
      try {
        const result = await window.ipcRenderer.invoke('update-module', repoId, moduleId);
        if (result.success) {
          await loadRepos(); 
          showToast('Module updated', 'The module has been updated successfully.', 'System', 3000);
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error('Failed to update module:', error);
        showToast('Failed to update module', 'An error occurred while trying to update the module.', 'Error', 5000);
      }
    };

    const openAddRepoModal = () => {
      showAddRepoModal.value = true;
      newRepo.value = { id: '',url: '', title: '', description: '', author : '', icon : '',modules: []}
      urlError.value = '';
      installError.value = '';
    };

    const closeAddRepoModal = () => {
      showAddRepoModal.value = false;
      newRepo.value = { id : '', url: '', title: '', description: '', author : '', icon : '',modules: [] }
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
        
        const response = await fetch(metadataUrl);
        newRepo.value = await response.json();
        newRepo.value.modules = newRepo.value.modules.map(module => ({ ...module, selected: false }));
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
        const repoResult = await window.ipcRenderer.invoke('install-repo', JSON.stringify(newRepo.value));
        if (!repoResult.success) throw new Error(repoResult.error);

        const selectedModules = newRepo.value.modules.filter(module => module.selected);
        for (const module of selectedModules) {
          const moduleResult = await window.ipcRenderer.invoke('install-module', newRepo.value.id, module.id);
          if (!moduleResult.success) throw new Error(moduleResult.error);
        }

        await loadRepos(); // Refresh the repo list
        closeAddRepoModal();
        showToast('Repo installed', 'The repo has been installed successfully.', 'System', 3000);
      } catch (error) {
        installError.value = `Failed to install: ${error}`;
      } finally {
        isLoading.value = false;
      }
    };

    const confirmRemoveRepo = (repo: Repo) => {
      repoToRemove.value = repo;
      showRemoveModal.value = true;
    };

    const handleRemoveRepo = async () => {
      if (repoToRemove.value) {
        try {
          const result = await window.ipcRenderer.invoke('remove-repo', repoToRemove.value.id);
          if (result.success) {
            repos.value = repos.value.filter(repo => repo.id !== repoToRemove.value!.id);
            showToast('Repo removed', 'The repo has been removed successfully.', 'System', 3000);
          } else {
            throw new Error(result.error);
          }
        } catch (error) {
          console.error('Failed to remove repo:', error);
          showToast('Failed to remove repo', 'An error occurred while trying to remove the repo.', 'Error', 5000);
        }
      }
      closeRemoveModal();
    };

    const closeRemoveModal = () => {
      showRemoveModal.value = false;
      repoToRemove.value = null;
    };

    const openModulesModal = (repo: Repo) => {
      selectedRepo.value = repo;
      showModulesModal.value = true;
    };

    const closeModulesModal = () => {
      showModulesModal.value = false;
      selectedRepo.value = null;
    };

    const updateModule = async (module: Module) => {
      if (selectedRepo.value) {
        try {
          const result = await window.ipcRenderer.invoke('update-module', selectedRepo.value.id, module.id);
          if (result.success) {
            await loadRepos(); // Refresh the repo list
            showToast('Module updated', 'The module has been updated successfully.', 'System', 3000);
          } else {
            throw new Error(result.error);
          }
        } catch (error) {
          console.error('Failed to update module:', error);
          showToast('Failed to update module', 'An error occurred while trying to update the module.', 'Error', 5000);
        }
      }
    };

    const removeModule = async (module: Module, target: EventTarget | null) => {
      if (selectedRepo.value) {
        // check if the module is the active module and deselect it
        if(module.id == store.state.activeModule?.id) {
          store.dispatch('setActiveModule', null);
        }
        try {
          const result = await window.ipcRenderer.invoke('remove-module', selectedRepo.value.title, module.id);
          if (result.success) {
            await loadRepos();
            (target as HTMLElement).parentNode?.parentElement?.parentElement?.remove();
            showToast('Module removed', 'The module has been removed successfully.', 'System', 3000);
          } else {
            throw new Error(result.error);
          }
        } catch (error) {
          console.error('Failed to remove module:', error);
          showToast('Failed to remove module', 'An error occurred while trying to remove the module.', 'Error', 5000);
        }
      }
    };

    const toggleModuleSelection = (module: Module) => {
      module.selected = !module.selected;
    };

    const isUpdateAvailable = (module: Module) => {
      if (selectedRepo.value) {
        const remoteModule = selectedRepo.value.modules.find(m => m.id === module.id);
        return remoteModule && remoteModule.version !== module.version;
      }
      return false;
    };

    return {
      searchQuery,
      showAddRepoModal,
      showRemoveModal,
      showModulesModal,
      newRepo,
      repoToRemove,
      selectedRepo,
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
      openModulesModal,
      closeModulesModal,
      updateModule,
      removeModule,
      toggleModuleSelection,
      refreshRepos,
      isUpdateAvailable,
      refreshModule,
    };
  },
  components: {
    RefreshIcon,
    PlusIcon,
    CloseIcon,
    DeleteIcon,
  }
});
</script>

<style scoped>


.repos-container {
  padding: 20px;
  color: white;
}

.repos-container span.material-design-icon > .material-design-icon__svg {
  position: relative !important
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.add-button, .refresh-button {
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


.modal-refresh-button {
  background-color: #333;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  font-size: 14px;
  cursor: pointer;
  margin-right: 5px;
}

.modal-update-button:disabled {
  background-color: #555;
  cursor: not-allowed;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-buttons {
  display: flex;
  gap: 10px; /* This creates space between the buttons */
}

.icon-button {
  background-color: #333;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

</style>
