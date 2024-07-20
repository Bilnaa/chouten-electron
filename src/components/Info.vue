<template>
  <div class="media-details" v-if="!loading">
    <div class="header">
      <div class="background-image-container">
        <img :src="media.banner ? media.banner : media.poster" alt="Background" class="background-image" />
      </div>
      <div class="content">
        <img :src="media.poster" alt="Cover" class="cover-image" />
        <div class="title-area">
          <p class="secondary-title">{{ media.titles.secondary}}</p>
          <h1 class="primary-title">{{ media.titles.primary }}</h1>
          <p class="status">{{ getStatus(media.status) }}</p>
        </div>
        <div class="rating">{{ media.rating.toFixed(1) }}</div>
      </div>
    </div>

    <div class="main-content">
      <div class="metadata">
        <div class="tags">
          <span class="tag">{{ media.yearReleased }}</span>
          <span class="tag">{{ getMediaType(media.mediaType) }}</span>
        </div>

        <div class="synopsis">
          <h2>Synopsis</h2>
          <p>{{ media.description }}</p>
        </div>
      </div>

      <div class="episodes-section">
        <div class="season-selector" @click="toggleSeasonModal" v-if="hasMultipleSeasons">
          <h2>{{ currentSeason.name }}</h2>
          <p>{{ currentEpisodes.length }} Episodes</p>
          <div class="chevron-right">›</div>
        </div>

        <div class="category-selector">
          <button 
            v-for="category in categories" 
            :key="category.title"
            @click="selectCategory(category.title)"
            :class="{ active: selectedCategory === category.title }"
          >
            {{ category.title }}
          </button>
        </div>

        <transition-group class="episodes-list" name="episode-fade" tag="div">
            <router-link :to="'/streams?episodeId='+episode.url + '&episodeTitle='+`${episode.number} - ${episode.title}` + '&title=' +  media.titles.primary" v-for="episode in currentEpisodes" :key="episode.number" class="episode">
              <div class="episode-info">
                <h3>{{ episode.title }}</h3>
                <p>Episode {{ episode.number }}</p>
              </div>
              <span class="episode-duration">{{ episode.duration || 'N/A' }}</span>
            </router-link>
        </transition-group>

      </div>
    </div>

    <transition name="modal-fade">
      <div v-if="showSeasonModal && hasMultipleSeasons" class="season-modal" @click.self="toggleSeasonModal">
        <transition name="modal-scale">
          <div v-if="showSeasonModal" class="season-modal-content">
            <transition-group name="list-complete" tag="div">
              <h2 v-for="season in media.seasons" 
                  :key="season.name" 
                  @click="selectSeason(season)"
                  :class="{ 'selected': season.selected }">
                {{ season.name }}
              </h2>
            </transition-group>
            <button class="close-button" @click="toggleSeasonModal">×</button>
          </div>
        </transition>
      </div>
    </transition>
  </div>
  <div v-else class="loading">
    <div class="spinner"></div>
  </div>
</template>


<script>
export default {
  data() {
    return {
      loading: true,
      selectedCategory: '',
      categories: [],
      media: {},
      showSeasonModal: false,
      hasMultipleSeasons: false,
      currentSeasonUrl: '',
    }
  },
  props: {
    url: {
      type: String,
      required: true
    }
  },
  computed: {
    currentSeason() {
      return this.media.seasons.find(season => season.selected) || {};
    },
    currentEpisodes() {
      const category = this.categories.find(cat => cat.title === this.selectedCategory);
      return category ? category.pagination[0].items : [];
    }
  },
  methods: {
    selectCategory(category) {
      this.selectedCategory = category;
    },
    toggleSeasonModal() {
      this.showSeasonModal = !this.showSeasonModal;
    },
    async selectSeason(season) {
      this.media.seasons.forEach(s => s.selected = (s.name === season.name));
      this.currentSeasonUrl = season.url;
      await this.fetchEpisodes(season.url);
      this.toggleSeasonModal();
    },
    getStatus(status) {
      const statuses = ['Unknown', 'Ongoing', 'Completed', 'Cancelled', 'Upcoming'];
      return statuses[status] || 'Unknown';
    },
    getMediaType(type) {
      const types = ['TV', 'Movie', 'OVA', 'ONA', 'Special', 'Music'];
      return types[type] || 'Unknown';
    },
    async injectInstance() {
      let activeModule = localStorage.getItem('activeModule');
      activeModule = JSON.parse(activeModule);
      let modulePath = await window.ipcRenderer.invoke('get-module-path', activeModule.id);
      let code = modulePath.modulePath + '/code.js';
      let injectJs = await window.ipcRenderer.invoke('load-script', code);
      while (injectJs.success === false) {
        console.log(injectJs.error);
        if (injectJs.error === 'ENOENT: no such file or directory') {
          break;
        }
        injectJs = await window.ipcRenderer.invoke('load-script', code);
      }
    },
    async fetchData(url) {
      try {
        await this.injectInstance();
        const infoRes = await window.ipcRenderer.invoke('execute-script', `const instance = new source.default(); return instance.info("${url}")`);
        this.media = infoRes.result;
        this.media.description = this.media.description.replace(/<[^>]*>?/gm, '');
        console.log('Media:', this.media);
        if(this.media.seasons.length > 0) {
          this.currentSeasonUrl = this.media.seasons.find(season => season.selected).url;
          this.hasMultipleSeasons = this.media.seasons.length > 1;
        } else {
          this.currentSeasonUrl = url;
        }
        await this.fetchEpisodes(this.currentSeasonUrl);
        this.loading = false;
      } catch (error) {
        console.error('Error fetching data:', error);
        this.loading = false;
      }
    },
    async fetchEpisodes(url) {
      console.log('Fetching episodes for:', url);
      try {
        this.loading = true;
        const mediaRes = await window.ipcRenderer.invoke('execute-script', `const instance = new source.default(); return instance.media("${url}")`);
        this.categories = mediaRes.result;
        this.selectedCategory = this.categories[0].title;
      } catch (error) {
        console.error('Error fetching episodes:', error);
      } finally {
        this.loading = false;
      }
    }
  },
  beforeMount() {
    this.fetchData(this.url);
  },
  mounted () {
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.showSeasonModal) {
        this.toggleSeasonModal();
      }
    });
  }
}
</script>

<style scoped>
.media-details {
  color: #ffffff;
  font-family: Arial, sans-serif;
}

.header {
  position: relative;
  height: 400px;
  overflow: hidden;
  border-radius: 12px;
  margin-bottom: 20px;
}

.background-image-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.background-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(30%) blur(5px);
}

.content {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  display: flex;
  align-items: flex-end;
}

.cover-image {
  width: 150px;
  height: 225px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 20px;
}

.title-area {
  flex-grow: 1;
}

.secondary-title {
  font-size: 16px;
  margin-bottom: 5px;
  color: #a0a0a0;
}

.primary-title {
  font-size: 32px;
  margin-bottom: 10px;
}

.status {
  display: inline-block;
  color: #6458ED;
  background-color: #4a4a4a;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 14px;
}

.rating {
  font-size: 24px;
  display: flex;
  align-items: center;
}

.rating::after {
  content: '❤️';
  margin-left: 5px;
}

.main-content {
  display: flex;
  gap: 40px;
}

.metadata {
  flex: 1;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.tag {
  background-color: #2a2a2a;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 14px;
}

.synopsis h2 {
  font-size: 20px;
  margin-bottom: 10px;
}

.synopsis p {
  line-height: 1.6;
}

.episodes-section {
  flex: 1;
}

.season-selector {
  background-color: #2a2a2a;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.season-selector h2 {
  margin: 0;
  font-size: 18px;
}

.chevron-right {
  font-size: 24px;
}

.category-selector {
  display: flex;
  margin-bottom: 20px;
  background-color: #2a2a2a;
  border-radius: 8px;
  overflow: hidden;
}

.category-selector button {
  background-color: transparent;
  border: none;
  color: #ffffff;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 16px;
  flex-grow: 1;
}

.category-selector button.active {
  background-color: #3a3a3a;
}

.episodes-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.episode {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #2a2a2a;
  padding: 15px;
  border-radius: 8px;
}

.episode-info h3 {
  margin: 0;
  font-size: 16px;
}

.episode-info p {
  margin: 5px 0 0;
  font-size: 14px;
  color: #a0a0a0;
}

.episode-duration {
  font-size: 14px;
  color: #a0a0a0;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.spinner {
  border: 4px solid #333;
  border-top: 4px solid #fff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.season-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.season-modal-content {
  background-color: #2a2a2a;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
}

.season-modal-content h2 {
  color: #ffffff;
  padding: 10px 0;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.season-modal-content h2:hover {
  background-color: #3a3a3a;
}

.season-modal-content h2.selected {
  color: #6458ED;
}

.close-button {
  background-color: #3a3a3a;
  color: #ffffff;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

/* Transitions */
.modal-fade-enter-active, .modal-fade-leave-active,
.modal-scale-enter-active, .modal-scale-leave-active,
.list-complete-item, .episode-fade-enter-active, .episode-fade-leave-active {
  transition: all 0.3s ease;
}

.modal-fade-enter-from, .modal-fade-leave-to,
.modal-scale-enter-from, .modal-scale-leave-to,
.list-complete-enter-from, .list-complete-leave-to,
.episode-fade-enter-from, .episode-fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>