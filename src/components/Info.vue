<template>
  <div class="media-details" v-if="!loading">
    <div class="header">
      <div class="buttons">
        <div class="back">
          <button @click="$router.push('discover')">
            <ArrowLeftIcon />
          </button>
        </div>
        <div class="bookmark" @click="showToast('Not Implemented', 'This feature is not implemented yet', 'Info', 3000)">
          <!-- <button @click="toggleBookmark">
            <span v-if="isBookmarked">Remove Bookmark</span>
            <span v-else>Add Bookmark</span>
          </button> -->
          <BookmarkIcon />
        </div>
      </div>
      <div class="background-image-container">
        <img :src="media.banner ? media.banner : media.poster" alt="Background" class="background-image" />
      </div>
      <div class="content">
        <img :src="media.poster" alt="Cover" class="cover-image" />
        <div class="title-area">
          <p class="secondary-title">{{ media.titles.secondary }}</p>
          <h1 class="primary-title">{{ media.titles.primary }}</h1>
          <p class="status">{{ getStatus(media.status) }}</p>
          <div class="synopsis">
            <p>{{ media.description }}</p>
          </div>
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
      </div>

      <div class="episodes-section" v-if="categories.length > 0">
        <div class="season-selector" @click="toggleSeasonModal" v-if="hasMultipleSeasons">
          <h2>{{ (currentSeason as SeasonData).name }}</h2>
          <p v-if="!isChaptersModule">{{ currentEpisodes.length }} Episodes</p>
          <p v-else>{{ currentEpisodes.length }} Chapters</p>
          <div class="chevron-right">›</div>
        </div>

        <div class="episodes-content">
          <div class="category-selector">
            <button v-for="category in categories" :key="category.title" @click="selectCategory(category.title)"
              :class="{ active: selectedCategory === category.title }">
              {{ category.title }}
            </button>
          </div>

          <div class="pagination-controls" v-if="totalPages > 1">
            <button @click="prevPage" :disabled="currentPage === 0">Previous</button>
            <span>Page {{ currentPage + 1 }} of {{ totalPages }}</span>
            <button @click="nextPage" :disabled="currentPage >= totalPages - 1">Next</button>
          </div>

          <transition-group class="episodes-list" name="episode-fade" tag="div">
            <router-link v-if="!isChaptersModule"
              :to="'/streams?episodeId=' + episode.url + '&episodeTitle=' + `${episode.title == '' ? 'Episode ' + episode.number : episode.title}` + '&title=' + media.titles.primary + '&episodes=' + JSON.stringify(episodes)"
              v-for="episode in paginatedEpisodes" :key="episode.number" class="episode">
              <div class="thumbnail-container">
                <img v-if="episode.thumbnail" class="thumbnail" :src="episode.thumbnail" alt="Thumbnail" />
              </div>
              <div class="episode-info">
                <h3 class="episode-title">{{ episode.title || 'Episode ' + episode.number }}</h3>
                <p class="episode-details">Episode {{ episode.number }}</p>
              </div>
            </router-link>
            <router-link v-else
              :to="'/reader?episodeId=' + episode.url + '&episodeTitle=' + `${episode.title == '' ? 'Episode ' + episode.number : episode.title}` + '&title=' + media.titles.primary + '&chapters=' + JSON.stringify(episodes)"
              v-for="episode in paginatedEpisodes" :key="'chapter-' + episode.number" class="episode">
              <div class="thumbnail-container">
                <img v-if="episode.thumbnail" class="thumbnail" :src="episode.thumbnail" alt="Thumbnail" />
              </div>
              <div class="episode-info">
                <h3 class="episode-title">{{ episode.title || 'Episode ' + episode.number }}</h3>
                <p class="episode-details">Episode {{ episode.number }}</p>
              </div>
            </router-link>
          </transition-group>
        </div>
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
    <div class="skeleton-container">
      <div class="skeleton-header">
        <div class="buttons">
          <div class="back skeleton-button"></div>
          <div class="bookmark skeleton-button"></div>
        </div>
        <div class="background-image-container">
          <div class="skeleton-banner"></div>
        </div>
        <div class="content">
          <div class="skeleton-poster"></div>
          <div class="skeleton-title-area">
            <div class="skeleton-text short"></div>
            <div class="skeleton-text medium"></div>
            <div class="skeleton-text short"></div>
          </div>
          <div class="skeleton-rating"></div>
        </div>
      </div>

      <div class="main-content">
        <div class="skeleton-metadata">
          <div class="skeleton-tags">
            <div class="skeleton-tag"></div>
            <div class="skeleton-tag"></div>
            <div class="skeleton-tag"></div>
          </div>
          <div class="skeleton-synopsis">
            <div class="skeleton-text medium"></div>
            <div class="skeleton-text long"></div>
            <div class="skeleton-text long"></div>
            <div class="skeleton-text medium"></div>
          </div>
        </div>

        <div class="skeleton-episodes-section">
          <div class="skeleton-season-selector"></div>
          <div class="skeleton-category-selector">
            <div class="skeleton-category"></div>
            <div class="skeleton-category"></div>
            <div class="skeleton-category"></div>
          </div>
          <div class="skeleton-episodes-grid">
            <div class="skeleton-episode" v-for="n in 6" :key="n">
              <div class="skeleton-thumbnail"></div>
              <div class="skeleton-episode-info">
                <div class="skeleton-text medium"></div>
                <div class="skeleton-text short"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>



<script lang="ts">
import {inject} from 'vue';

import { useStore } from 'vuex';
import ArrowLeftIcon from 'vue-material-design-icons/ArrowLeft.vue';
import BookmarkIcon from 'vue-material-design-icons/Bookmark.vue';
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
    const showToast = inject('showToast') as (title: string, message: string, icon?: string, duration?: number) => void;
    return {
      store,
      showToast,
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
      episodes : [] as MediaInfo[],
    }
  },
  props: {
    url: {
      type: String,
      required: true
    }
  },
  components: {
    ArrowLeftIcon,
    BookmarkIcon,
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
        console.log(this.media);
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
        console.log(this.categories);
        this.episodes = this.categories[0].pagination[0].items;
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
      // check if the page already exists in the array and update it
      let index = currentPages.findIndex((page: { url: string; }) => page.url === url);
      if (index !== -1) {
        currentPages[index].page = page;
      }
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
            { label: 'Get Chouten', url: 'https://github.com/Bilnaa/chouten-electron'},
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
    localStorage.lastInfo = this.url;
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.showSeasonModal) {
        this.toggleSeasonModal();
      }
    });
  }
}
</script>



<style scoped>
/* Media Details Container */
.media-details {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  position: relative;
}

.media-details::-webkit-scrollbar {
  width: 8px;
}

.media-details::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.media-details::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.media-details::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Header Section */
.header {
  position: relative;
  height: 55vh;
  min-height: 55vh;
  overflow: hidden;
  margin: 0;
  border-radius: 0;
}

.background-image-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.background-image-container::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(20, 20, 20, 0.7) 0%,
    rgba(20, 20, 20, 0.8) 50%,
    rgba(20, 20, 20, 1) 100%
  );
}

.background-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.buttons {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  z-index: 100;
  display: flex;
  justify-content: space-between;
}

.back button, .bookmark {
  background: rgba(0, 0, 0, 0.7);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.back button:hover, .bookmark:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.05);
}

.content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 40px;
  display: flex;
  align-items: flex-end;
  gap: 40px;
  z-index: 1;
}

.cover-image {
  width: 220px;
  height: 330px;
  object-fit: cover;
  border-radius: 12px;
  margin: 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.title-area {
  flex: 1;
  max-width: 1200px;
}

.secondary-title {
  color: #aaa;
  margin: 0;
  font-size: 1.1em;
}

.primary-title {
  margin: 8px 0;
  font-size: 2.5em;
  color: white;
}

.status {
  display: inline-block;
  padding: 6px 16px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  font-size: 0.95em;
  color: var(--accent-color);
  margin-bottom: 20px;
}

.synopsis {
  color: #ddd;
  line-height: 1.7;
  max-width: 1200px;
  background: rgba(0, 0, 0, 0.4);
  padding: 20px 25px;
  border-radius: 12px;
  max-height: 150px;
  overflow-y: auto;
  margin-top: 5px;
}

.synopsis p {
  margin: 0;
  font-size: 1.05em;
  opacity: 0.95;
  padding-right: 10px;
}

.synopsis::-webkit-scrollbar {
  width: 8px;
}

.synopsis::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.synopsis::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.synopsis::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Main Content */
.main-content {
  flex: 1;
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 20px;
  padding: 20px;
  max-width: 91vw;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.main-content::-webkit-scrollbar {
  width: 8px;
}

.main-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.main-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.main-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Section métadonnées */
.metadata {
  background: #1a1a1a;
  border-radius: 8px;
  padding: 20px;
  height: fit-content;
  min-width: 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.tag {
  background: #2a2a2a;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.9em;
  color: #ddd;
}

.synopsis {
  color: #ddd;
  line-height: 1.6;
}

.synopsis h2 {
  margin-bottom: 10px;
  font-size: 1.2em;
  color: white;
}

/* Section épisodes */
.episodes-section {
  background: #1a1a1a;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.episodes-content {
  width: 100%;
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

/* Style pour la liste d'épisodes */
.episodes-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
}

/* Style pour un épisode */
.episode {
  background: #222;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
  display: flex;
  gap: 12px;
  padding: 8px;
  height: 110px;
  width: 100%;
  box-sizing: border-box;
}

.episode:hover {
  transform: translateY(-2px);
  background: #2a2a2a;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.thumbnail-container {
  width: 160px;
  height: 94px;
  background: #1a1a1a;
  border-radius: 8px;
  overflow: hidden;
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #1a1a1a;
}

.episode-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 8px 0;
  min-width: 0;
  overflow: hidden;
}

.episode-title {
  margin: 0;
  font-size: 1.1em;
  color: white;
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.3;
}

.episode-details {
  margin: 0;
  color: #aaa;
  font-size: 0.9em;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  width: fit-content;
  white-space: nowrap;
  margin-top: auto;
}

/* Sélecteur de catégories */
.category-selector {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  background: #1a1a1a;
  z-index: 10;
  padding: 20px;
  position: sticky;
  top: 0;
  width: 100%;
  box-sizing: border-box;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.category-selector button {
  background: #2a2a2a;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  font-size: 0.95em;
  min-width: fit-content;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.category-selector button:hover {
  background: #333;
  transform: translateY(-1px);
}

.category-selector button.active {
  background: var(--accent-color);
  font-weight: 500;
}

/* Pagination Controls */
.pagination-controls {
  padding: 15px 20px;
  display: flex;
  justify-content: center;
  gap: 20px;
  background: #1a1a1a;
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.pagination-controls button {
  background: #2a2a2a;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95em;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pagination-controls button:hover:not(:disabled) {
  background: #333;
  transform: translateY(-1px);
}

.pagination-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive Design */
@media (max-width: 1599px) {
  .episodes-list {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (max-width: 900px) {
  .main-content {
    grid-template-columns: 1fr;
    height: auto;
    overflow-y: auto;
    max-height: calc(100vh - 40vh);
  }

  .metadata {
    height: fit-content;
  }

  .episodes-section {
    height: fit-content;
    min-height: 500px;
  }

  .episodes-content {
    height: 100%;
  }

  .episodes-list {
    grid-template-columns: 1fr;
  }
}

/* Scrollbar Styles */
.episodes-list::-webkit-scrollbar {
  width: 8px;
}

.episodes-list::-webkit-scrollbar-track {
  background: #1a1a1a;
  border-radius: 4px;
}

.episodes-list::-webkit-scrollbar-thumb {
  background: #333;
  border-radius: 4px;
}

.episodes-list::-webkit-scrollbar-thumb:hover {
  background: #444;
}

/* Styles pour le skeleton loading */
.skeleton-container {
  width: 100%;
  height: 100vh;
  background: #141414;
  overflow: hidden;
}

.skeleton-header {
  height: 40vh;
  position: relative;
  overflow: hidden;
}

.skeleton-button {
  width: 40px;
  height: 40px;
  background: linear-gradient(110deg, #1a1a1a 30%, #222 50%, #1a1a1a 70%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
  border-radius: 50%;
}

.skeleton-banner {
  width: 100%;
  height: 100%;
  background: linear-gradient(110deg, #1a1a1a 30%, #222 50%, #1a1a1a 70%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
}

.skeleton-poster {
  width: 150px;
  height: 225px;
  background: linear-gradient(110deg, #1a1a1a 30%, #222 50%, #1a1a1a 70%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
  border-radius: 8px;
}

.skeleton-rating {
  width: 50px;
  height: 50px;
  background: linear-gradient(110deg, #1a1a1a 30%, #222 50%, #1a1a1a 70%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
  border-radius: 50%;
}

.skeleton-title-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0 20px;
}

.skeleton-text {
  height: 20px;
  background: linear-gradient(110deg, #1a1a1a 30%, #222 50%, #1a1a1a 70%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
  border-radius: 4px;
}

.skeleton-text.short {
  width: 30%;
}

.skeleton-text.medium {
  width: 60%;
}

.skeleton-text.long {
  width: 90%;
}

.skeleton-metadata {
  background: #1a1a1a;
  border-radius: 8px;
  padding: 20px;
  height: fit-content;
}

.skeleton-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.skeleton-tag {
  width: 80px;
  height: 30px;
  background: linear-gradient(110deg, #222 30%, #2a2a2a 50%, #222 70%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
  border-radius: 4px;
}

.skeleton-synopsis {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-episodes-section {
  background: #1a1a1a;
  border-radius: 8px;
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.skeleton-season-selector {
  height: 50px;
  background: linear-gradient(110deg, #222 30%, #2a2a2a 50%, #222 70%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
  border-radius: 8px;
}

.skeleton-category-selector {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.skeleton-category {
  width: 100px;
  height: 35px;
  flex-shrink: 0;
  background: linear-gradient(110deg, #222 30%, #2a2a2a 50%, #222 70%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
  border-radius: 6px;
}

.skeleton-episodes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
  overflow-y: auto;
}

.skeleton-episode {
  background: #222;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  gap: 12px;
  padding: 8px;
  height: 110px;
}

.skeleton-thumbnail {
  width: 160px;
  height: 94px;
  background: linear-gradient(110deg, #1a1a1a 30%, #222 50%, #1a1a1a 70%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
  border-radius: 8px;
}

.skeleton-episode-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@media (max-width: 900px) {
  .skeleton-episodes-grid {
    grid-template-columns: 1fr;
  }
  
  .skeleton-poster {
    width: 120px;
    height: 180px;
  }
}

/* Styles pour le modal des saisons */
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
  background-color: #1E1E1E;
  padding: 20px;
  border-radius: 12px;
  width: 300px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
}

.season-modal-content h2 {
  color: #ffffff;
  padding: 12px 15px;
  margin: 5px 0;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 1em;
}

.season-modal-content h2:hover {
  background-color: #2a2a2a;
}

.season-modal-content h2.selected {
  background-color: var(--accent-color);
  color: white;
}

.close-button {
  position: absolute;
  top: -40px;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
  color: #ffffff;
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

/* Transitions pour le modal */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-scale-enter-active,
.modal-scale-leave-active {
  transition: transform 0.3s ease;
}

.modal-scale-enter-from,
.modal-scale-leave-to {
  transform: scale(0.9);
}

.list-complete-enter-active,
.list-complete-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.list-complete-enter-from,
.list-complete-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Styles pour la scrollbar du modal */
.season-modal-content::-webkit-scrollbar {
  width: 8px;
}

.season-modal-content::-webkit-scrollbar-track {
  background: #1a1a1a;
  border-radius: 4px;
}

.season-modal-content::-webkit-scrollbar-thumb {
  background: #333;
  border-radius: 4px;
}

.season-modal-content::-webkit-scrollbar-thumb:hover {
  background: #444;
}

/* Styles des boutons de catégorie */
.category-selector::-webkit-scrollbar {
  display: none;
}

.category-selector button {
  background: #2a2a2a;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  font-size: 0.9em;
  min-width: fit-content;
}

.category-selector button:hover {
  background: #333;
}

.category-selector button.active {
  background: var(--accent-color);
  font-weight: 500;
}

/* Styles des boutons de pagination */
.pagination-controls button {
  background: #2a2a2a;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.pagination-controls button:hover:not(:disabled) {
  background: #333;
}

.pagination-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.season-selector {
  background: #2a2a2a;
  padding: 20px;
  border-radius: 12px;
  margin: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.season-selector:hover {
  background: #333;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  border-color: var(--accent-color);
}

.season-selector h2 {
  margin: 0;
  font-size: 1.2em;
  font-weight: 500;
  color: white;
}

.season-selector p {
  margin: 5px 0 0 0;
  font-size: 0.9em;
  color: #aaa;
}

.chevron-right {
  font-size: 1.8em;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
}

.season-selector:hover .chevron-right {
  transform: translateX(4px);
  color: #ffffff;
}

/* Nouveau style simple pour un seul épisode */
.single-episode-container {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.single-episode-simple {
  background: var(--accent-color);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  text-decoration: none;
  color: white;
  width: 100%;
  max-width: 400px;
  transition: all 0.2s ease;
}

.single-episode-simple:hover {
  transform: scale(1.02);
  filter: brightness(1.1);
}

.play-button {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.episode-info-simple {
  flex: 1;
}

.episode-info-simple h3 {
  margin: 0;
  font-size: 1.2em;
  font-weight: 600;
  margin-bottom: 5px;
}

.episode-info-simple p {
  margin: 0;
  opacity: 0.9;
  font-size: 0.9em;
}

@media (max-width: 768px) {
  .single-episode-simple {
    max-width: 100%;
  }
}

/* Ajout du style pour un seul épisode */
.episodes-list.single {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.episodes-list.single .episode {
  width: 100%;
  max-width: 600px;
}

/* Media Queries */
@media (min-width: 1600px) {
  .header {
    height: 65vh;
    min-height: 65vh;
  }

  .main-content {
    padding: 30px;
    gap: 30px;
  }

  .cover-image {
    width: 280px;
    height: 420px;
  }

  .synopsis {
    max-height: 200px;
    font-size: 1.1em;
    line-height: 1.8;
  }

  .primary-title {
    font-size: 3em;
  }

  .secondary-title {
    font-size: 1.2em;
  }
}

@media (max-width: 900px) {
  .header {
    height: 45vh;
    min-height: 45vh;
  }

  .main-content {
    grid-template-columns: 1fr;
    padding: 15px;
    gap: 15px;
  }

  .cover-image {
    width: 160px;
    height: 240px;
  }

  .primary-title {
    font-size: 2em;
  }
}
</style>