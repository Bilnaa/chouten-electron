<template>
  <div class="media-details" v-if="!loading">
    <div class="header">
      <div class="background-image-container">
        <img :src="media.banner ? media.banner : media.poster" alt="Background" class="background-image" />
      </div>
      <div class="content">
        <img :src="media.poster" alt="Cover" class="cover-image" />
        <div class="title-area">
          <p class="secondary-title">{{ media.titles.secondary }}</p>
          <h1 class="primary-title">{{ media.titles.primary }}</h1>
          <p class="status">{{ getStatus(media.status) }}</p>
        </div>
        <div class="rating" v-if="media.rating !== null">{{ media.rating.toFixed(1) }}</div>
      </div>
    </div>

    <div class="main-content">
      <div class="metadata">
        <div class="tags">
          <span class="tag">{{ media.titles.primary }}</span>
          <span class="tag"> {{ currentEpisodes.length + ' ' + (media.mediaType === 0 ? 'Episodes' : 'Chapters')
            }}</span>
          <span class="tag">{{ media.yearReleased }}</span>
        </div>
        <div class="synopsis">
          <h2>Synopsis</h2>
          <p>{{ media.description }}</p>
        </div>
      </div>

      <div class="episodes-section" v-if="categories.length > 0">
        <div class="season-selector" @click="toggleSeasonModal" v-if="hasMultipleSeasons">
          <h2>{{ (currentSeason as SeasonData).name }}</h2>
          <p>{{ currentEpisodes.length }} Episodes</p>
          <div class="chevron-right">›</div>
        </div>

        <div class="category-selector">
          <button v-for="category in categories" :key="category.title" @click="selectCategory(category.title)"
            :class="{ active: selectedCategory === category.title }">
            {{ category.title }}
          </button>
        </div>

        <div class="pagination-controls">
          <button @click="prevPage" :disabled="currentPage === 0">Previous</button>
          <span>Page {{ currentPage + 1 }} of {{ totalPages }}</span>
          <button @click="nextPage" :disabled="currentPage >= totalPages - 1">Next</button>
        </div>

        <transition-group class="episodes-list" name="episode-fade" tag="div">
          <router-link v-if="!isChaptersModule"
            :to="'/streams?episodeId=' + episode.url + '&episodeTitle=' + `${episode.title == '' ? 'Episode ' + episode.number : episode.title}` + '&title=' + media.titles.primary"
            v-for="episode in paginatedEpisodes" :key="episode.number" class="episode">
            <div class="episode-info">
              <h3>{{ episode.title == '' ? 'Episode ' + episode.number : episode.title }}</h3>
              <p>Episode {{ episode.number }}</p>
            </div>
          </router-link>
          <router-link v-if="isChaptersModule"
            :to="'/reader?episodeId=' + episode.url + '&episodeTitle=' + `${episode.title == '' ? 'Episode ' + episode.number : episode.title}` + '&title=' + media.titles.primary"
            v-for="episode in paginatedEpisodes" :key="episode.number" class="episode">
            <div class="episode-info">
              <h3>{{ episode.title == '' ? 'Chapter' + episode.number : episode.title }}</h3>
              <p>Chapter {{ episode.number }}</p>
            </div>
          </router-link>
        </transition-group>
      </div>
      <div class="episodes-section" v-else>
        <div class="no-episodes-message">
          <h3>No episodes found</h3>
          <p>There are no episodes available for this media</p>
        </div>
      </div>
    </div>

    <transition name="modal-fade">
      <div v-if="showSeasonModal && hasMultipleSeasons" class="season-modal" @click.self="toggleSeasonModal">
        <transition name="modal-scale">
          <div v-if="showSeasonModal" class="season-modal-content">
            <transition-group name="list-complete" tag="div">
              <h2 v-for="season in media.seasons" :key="season.name" @click="selectSeason(season)"
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



<script lang="ts">
import { useStore } from 'vuex';

export type Titles = {
  primary: string;
  secondary?: string;
};

export enum Status {
  COMPLETED,
  CURRENT,
  HIATUS,
  NOT_RELEASED,
  UNKNOWN,
}

export enum MediaType {
  EPISODES, // Video
  CHAPTERS, // Book
  UNKNOWN,
}

export type InfoData = {
  titles: Titles;
  altTitles: string[];
  description: string;
  poster: string;
  banner?: string;
  status: Status;
  rating: number;
  yearReleased: number;
  mediaType: MediaType;
  seasons: SeasonData[];
};

export type SeasonData = {
  name: string;
  url: string;
  selected?: boolean;
};

export type MediaList = {
  title: string;
  pagination: MediaPagination[];
};

export type MediaPagination = {
  id: string;
  title?: string;
  items: MediaInfo[];
};

export type MediaInfo = {
  url: string;
  number: number;
  thumbnail?: string;
  title?: string;
  description?: string;
  indicator?: string;
};

export default {
  setup() {
    const store = useStore();
    return {
      store,
    };
  },
  data() {
    return {
      loading: true,
      selectedCategory: '' as SeasonData['name'],
      categories: [] as MediaList[],
      media: {} as InfoData,
      showSeasonModal: false,
      hasMultipleSeasons: false,
      currentSeasonUrl: '',
      currentPage: 0,  // Current page of episodes
      episodesPerPage: 100,  // Number of episodes per page
      isChaptersModule: false,
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
    },
    paginatedEpisodes() {
      const start = this.currentPage * this.episodesPerPage;
      const end = start + this.episodesPerPage;
      return this.currentEpisodes.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.currentEpisodes.length / this.episodesPerPage);
    }
  },
  methods: {
    selectCategory(category = '') {
      this.selectedCategory = category;
      this.currentPage = 0;
      this.saveCurrentPage();
    },
    toggleSeasonModal() {
      this.showSeasonModal = !this.showSeasonModal;
    },
    async selectSeason(season: SeasonData) {
      this.media.seasons.forEach(s => s.selected = (s.name === season.name));
      this.currentSeasonUrl = season.url;
      await this.fetchEpisodes(season.url);
      this.toggleSeasonModal();
    },
    getStatus(status: Status) {
      const statuses = ['Completed', 'Current', 'Hiatus', 'Not Released', 'Unknown'];
      return statuses[status] || 'Unknown';
    },
    async injectInstance() {
      let activeModule = this.store.state.activeModule;
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
    async moduleType() {
      let instance = { success: false, result: '' };
      try {
        instance = await window.ipcRenderer.invoke('execute-script', 'const instance = new source.default();return instance.pages.toString()');
      } catch (error) {
        this.isChaptersModule = false;
      }
      if (instance.success && instance.result.includes('pages')) {
        this.isChaptersModule = true;
      }
    },
    async fetchData(url: string) {
      try {
        await this.injectInstance();
        const infoRes = await window.ipcRenderer.invoke('execute-script', `const instance = new source.default(); return instance.info("${url}")`);
        this.media = infoRes.result;
        this.media.description = this.media.description.replace(/<[^>]*>?/gm, '');
        if (this.media.seasons.length > 0) {
          this.currentSeasonUrl = this.media.seasons.find(season => season.selected)?.url ?? '';
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
    async fetchEpisodes(url: string) {
      console.log('Fetching episodes for:', url);
      try {
        this.loading = true;
        const mediaRes = await window.ipcRenderer.invoke('execute-script', `const instance = new source.default(); return instance.media("${url}")`);
        this.categories = mediaRes.result;
        if (this.categories.length > 0) {
          this.selectedCategory = this.categories[0].title;
          this.restoreCurrentPage();
        }
      } catch (error) {
        console.error('Error fetching episodes:', error);
      } finally {
        this.loading = false;
      }
    },
    saveCurrentPage() {
      const currentPages = JSON.parse(localStorage.getItem('currentPages') as string) || {};
      let url = window.location.href;
      let page = this.currentPage;
      currentPages.push({ url, page });
      localStorage.setItem('currentPages', JSON.stringify(currentPages));
    },
    restoreCurrentPage() {
      const currentPages = JSON.parse(localStorage.getItem('currentPages') as string) || {};
      let url = window.location.href;
      let page = currentPages.find((page: { page: number, url: string; }) => page.url === url);
      if (page) {
        this.currentPage = page.page;
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages - 1) {
        this.currentPage++;
        this.saveCurrentPage();
      }
    },
    prevPage() {
      if (this.currentPage > 0) {
        this.currentPage--;
        this.saveCurrentPage();
      }
    },
  },
  beforeMount() {
    this.fetchData(this.url);
    this.moduleType();
    const interval = setInterval(() => {
      if (!this.loading) {
        const presence = {
          details: `Browsing ${this.media.titles.primary}`,
          startTimestamp: Date.now(),
          largeImageKey: this.media.poster ? this.media.poster : 'icon',
          largeImageText: this.media.titles.primary,
          smallImageKey: 'icon',
          smallImageText: 'Chouten',
          buttons: [
            { label: 'Get Chouten', url: 'https://github.com/Bilnaa/chouten-electron' },
            { label: 'Join Discord', url: 'https://discord.gg/j5ETh7uSy6' },
          ],
          instance: false,
        };
        window.ipcRenderer.invoke('set-discord-presence', presence);
        clearInterval(interval);
      }
    }, 1000);
  },
  mounted() {
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.showSeasonModal) {
        this.toggleSeasonModal();
      }
    });

  }
}
</script>



<style scoped>
.disclaimer, .no-episodes-message {
  background-color: #252525;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
}

.disclaimer h3, .no-episodes-message h3 {
  margin-top: 0;
  font-size: 16px;
}

.disclaimer p, .no-episodes-message p {
  margin-bottom: 0;
  font-size: 14px;
  line-height: 1.4;
}


.episodes-list::-webkit-scrollbar {
  width: 10px !important;
  visibility: visible !important;
  color: #ffffff;
}

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
  display: flex;
  flex-direction: column;
  height: 75vh;
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
  min-height: 40px;
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
  max-height: 50vh;
  overflow-y: auto;
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
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
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
.modal-fade-enter-active,
.modal-fade-leave-active,
.modal-scale-enter-active,
.modal-scale-leave-active,
.list-complete-item,
.episode-fade-enter-active,
.episode-fade-leave-active {
  transition: all 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to,
.modal-scale-enter-from,
.modal-scale-leave-to,
.list-complete-enter-from,
.list-complete-leave-to,
.episode-fade-enter-from,
.episode-fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.pagination-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.pagination-controls button {
  background-color: #3a3a3a;
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 16px;
}

.pagination-controls button:disabled {
  background-color: #2a2a2a;
  cursor: not-allowed;
}
</style>