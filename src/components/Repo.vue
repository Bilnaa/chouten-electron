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
      <div v-for="repo in filteredRepos" :key="repo.id" class="repo-item">
        <img :src="repo.icon" alt="Repo icon" class="repo-icon">
        <div class="repo-info">
          <h3>{{ repo.name }}</h3>
          <p>{{ repo.team }} · {{ repo.url }}</p>
        </div>
        <button class="remove-button" @click="confirmRemoveRepo(repo)">×</button>
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
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'vuex';
import { Repo } from '../store/index';

export default defineComponent({
  setup() {
    const store = useStore();
    const searchQuery = ref('');
    const showAddRepoModal = ref(false);
    const showRemoveModal = ref(false);
    const newRepo = ref({ url: '' });
    const repoToRemove = ref<Repo | null>(null);
    const urlError = ref('');
    const installError = ref('');
    const isLoading = ref(false);

    const openAddRepoModal = () => {
      showAddRepoModal.value = true;
      newRepo.value = { url: '' };
      urlError.value = '';
      installError.value = '';
    };

    const closeAddRepoModal = () => {
      showAddRepoModal.value = false;
      newRepo.value = { url: '' };
      urlError.value = '';
      installError.value = '';
      isLoading.value = false;
    };

    const validateUrl = () => {
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!newRepo.value.url) {
        urlError.value = '';
      } else if (!urlPattern.test(newRepo.value.url)) {
        urlError.value = 'Please enter a valid URL';
      } else {
        urlError.value = '';
      }
    };

    const installRepo = async () => {
      if (urlError.value || !newRepo.value.url) return;

      isLoading.value = true;
      installError.value = '';

      try {
        // Simulating an API call to install the repo
        await new Promise(resolve => setTimeout(resolve, 2000));

        // If the installation is successful, add the repo to the list
        const newRepoObject: Repo = {
          id: store.state.repos.length + 1,
          name: `Repo ${store.state.repos.length + 1}`,
          team: 'Chouten-Team',
          url: newRepo.value.url,
          icon: 'https://cdn-icons-png.flaticon.com/512/25/25231.png',
          modules: [
            {
              id: 1,
              name: 'Module 1',
              author: 'Author 1',
              version: '1.0.0',
              image: 'https://via.placeholder.com/150'
            },
            {
              id: 2,
              name: 'Module 2',
              author: 'Author 2',
              version: '1.0.0',
              image: 'https://via.placeholder.com/150'
            }
          ]
        };
        store.dispatch('addRepo', newRepoObject);

        closeAddRepoModal();
      } catch (error) {
        installError.value = 'Failed to install the repo. Please try again.';
      } finally {
        isLoading.value = false;
      }
    };

    const confirmRemoveRepo = (repo: Repo) => {
      repoToRemove.value = repo;
      showRemoveModal.value = true;
    };

    const handleRemoveRepo = () => {
      if (repoToRemove.value) {
        store.dispatch('removeRepo', repoToRemove.value.id);
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
      closeRemoveModal
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
  width: 100%;
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

</style>
