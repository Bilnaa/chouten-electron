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
            :disabled="!newRepo.url || urlError || isLoading"
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
          <button class="remove-button" @click="removeRepo">Remove</button>
          <button class="cancel-button" @click="closeRemoveModal">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { loadRouteLocation } from 'vue-router';

export default {
  data() {
    return {
      searchQuery: '',
      showAddRepoModal: false,
      showRemoveModal: false,
      newRepo: { url: '' },
      repoToRemove: null,
      urlError: '',
      installError: '',
      isLoading: false,
      repos: [
      ]
    }
  },
  computed: {
    filteredRepos() {
      return this.repos.filter(repo => 
        repo.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    }
  },
  methods: {
    openAddRepoModal() {
      this.showAddRepoModal = true;
      this.newRepo = { url: '' };
      this.urlError = '';
      this.installError = '';
    },
    closeAddRepoModal() {
      this.showAddRepoModal = false;
      this.newRepo = { url: '' };
      this.urlError = '';
      this.installError = '';
      this.isLoading = false;
    },
    validateUrl() {
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!this.newRepo.url) {
        this.urlError = '';
      } else if (!urlPattern.test(this.newRepo.url)) {
        this.urlError = 'Please enter a valid URL';
      } else {
        this.urlError = '';
      }
    },
    async installRepo() {
      if (this.urlError || !this.newRepo.url) return;

      this.isLoading = true;
      this.installError = '';

      try {
        // Simulating an API call to install the repo
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // If the installation is successful, add the repo to the list
        const newRepo = {
          id: this.repos.length + 1,
          name: `Repo ${this.repos.length + 1}`,
          team: 'Chouten-Team',
          url: this.newRepo.url,
          icon: 'https://cdn-icons-png.flaticon.com/512/25/25231.png'
        };
        this.repos.push(newRepo);
        
        this.closeAddRepoModal();
        localStorage.setItem('repos', JSON.stringify(this.repos));
      } catch (error) {
        this.installError = 'Failed to install the repo. Please try again.';
      } finally {
        this.isLoading = false;
      }
    },
    confirmRemoveRepo(repo) {
      this.repoToRemove = repo;
      this.showRemoveModal = true;
    },
    removeRepo() {
      const index = this.repos.findIndex(repo => repo.id === this.repoToRemove.id);
      if (index !== -1) {
        this.repos.splice(index, 1);
      }
      localStorage.setItem('repos', JSON.stringify(this.repos));
      this.closeRemoveModal();
    },
    closeRemoveModal() {
      this.showRemoveModal = false;
      this.repoToRemove = null;
    }
  },
  mounted() {
    this.repos = JSON.parse(localStorage.getItem('repos')) || this.repos;    
  }
}
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

.install-button, .cancel-button {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  background-color: #007AFF;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.install-button:disabled {
  background-color: #555;
  cursor: not-allowed;
}

.cancel-button {
  background-color: #333;
}

.modal-footer .remove-button {
  background-color: #ff4444;
  width: 100%;
  height: auto;
  border-radius: 5px;
  margin-left: 0;
  margin-bottom: 10px;
}
</style>