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
            <router-link v-if="isChaptersModule"
              :to="'/reader?episodeId=' + episode.url + '&episodeTitle=' + `${episode.title == '' ? 'Episode ' + episode.number : episode.title}` + '&title=' + media.titles.primary + '&chapters=' + JSON.stringify(episodes)"
              v-for="episode in paginatedEpisodes" :key="episode.number" class="episode">
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
        <div class="skeleton-banner"></div>
        <div class="skeleton-content">
          <div class="skeleton-poster"></div>
          <div class="skeleton-title-area">
            <div class="skeleton-text short"></div>
            <div class="skeleton-text medium"></div>
            <div class="skeleton-text short"></div>
          </div>
        </div>
      </div>
      <div class="skeleton-main">
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
        <div class="skeleton-episodes">
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
  overflow: hidden;
}

/* Header Section */
.header {
  position: relative;
  height: 40vh;
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
  z-index: 2;
  display: flex;
  justify-content: space-between;
}

.back button, .bookmark {
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: background-color 0.2s ease;
}

.back button:hover, .bookmark:hover {
  background: rgba(0, 0, 0, 0.7);
}

.content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  display: flex;
  align-items: flex-end;
  gap: 20px;
  z-index: 1;
}

.cover-image {
  width: 150px;
  height: 225px;
  object-fit: cover;
  border-radius: 8px;
  margin: 0;
}

.title-area {
  flex: 1;
}

.secondary-title {
  color: #aaa;
  margin: 0;
  font-size: 1em;
}

.primary-title {
  margin: 8px 0;
  font-size: 2em;
  color: white;
}

.status {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  font-size: 0.9em;
  color: var(--accent-color);
}

/* Main Content */
.main-content {
  flex: 1;
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 20px;
  padding: 20px;
  height: calc(100vh - 40vh);
  overflow: hidden;
}

.metadata {
  background: #1a1a1a;
  border-radius: 8px;
  padding: 20px;
  height: 100%;
  overflow-y: auto;
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

/* Episodes Section */
.episodes-section {
  background: #1a1a1a;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.episodes-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 20px;
}

.season-selector {
  background: #2a2a2a;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.season-selector h2 {
  margin: 0;
  font-size: 1.1em;
}

.chevron-right {
  font-size: 1.5em;
  opacity: 0.7;
}

.season-selector:hover {
  background: #333;
}

.category-selector {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  background: #1a1a1a;
  z-index: 10;
  padding: 20px;
  padding-bottom: 15px;
  position: sticky;
  top: 0;
}

/* Cacher la scrollbar sur Webkit */
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

.episodes-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
  padding: 0 10px 20px 0;
  width: 100%;
  height: auto;
  align-items: stretch;
}

.episode {
  background: rgba(42, 42, 42, 0.5);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: row;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  height: 110px;
  width: 100%;
}

.episode:hover {
  transform: translateY(-2px);
  background: rgba(52, 52, 52, 0.7);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

/* Conteneur pour la thumbnail */
.thumbnail-container {
  width: 160px;
  min-width: 160px;
  position: relative;
  height: 94px;
  background: #2a2a2a;
  margin: 8px;
  border-radius: 8px;
  overflow: hidden;
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Style pour quand il n'y a pas de thumbnail */
.thumbnail-container:empty::after {
  content: 'No Preview';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #666;
  font-size: 0.8em;
}

/* Ajuster pour mobile */
@media (max-width: 768px) {
  .thumbnail-container {
    width: 120px;
    min-width: 120px;
  }
}

.episode-info {
  padding: 12px;
  flex: 1;
  display: grid;
  grid-template-rows: 1fr auto;
  gap: 8px;
  min-width: 0;
  overflow: hidden;
}

.episode-title {
  margin: 0;
  font-size: 1em;
  color: white;
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.2;
  align-self: start;
  word-break: break-word;
}

.episode-details {
  margin: 0;
  color: #aaa;
  font-size: 0.9em;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  width: fit-content;
  align-self: end;
  white-space: nowrap;
}

/* Pagination Controls */
.pagination-controls {
  padding: 15px 20px;
  border-bottom: 1px solid #2a2a2a;
  display: flex;
  justify-content: center;
  gap: 15px;
  background: #1a1a1a;
  margin-bottom: 5px;
  position: sticky;
  top: 0;
  z-index: 10;
}

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

/* Garder les styles existants pour les modals et les transitions */

/* Responsive Design */
@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 300px 1fr;
    gap: 20px;
    padding: 20px;
  }

  .episodes-list {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
}

@media (max-width: 900px) {
  .main-content {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 20px;
    height: calc(100vh - 350px);
    overflow-y: hidden;
  }

  .metadata {
    height: 300px;
    min-height: 300px;
    overflow-y: auto;
  }

  .episodes-section {
    height: calc(100vh - 700px);
    min-height: 300px;
    overflow: hidden;
  }

  .episodes-content {
    overflow-y: auto;
  }

  .synopsis {
    overflow-y: visible;
  }

  .header {
    height: auto;
    min-height: 350px;
  }

  .content {
    padding: 20px;
    gap: 20px;
  }

  .cover-image {
    width: 130px;
    height: 195px;
  }
}

@media (max-width: 600px) {
  .main-content {
    padding: 15px;
    gap: 15px;
    height: calc(100vh - 300px);
  }

  .metadata {
    height: 250px;
    min-height: 250px;
    padding: 15px;
  }

  .episodes-section {
    height: calc(100vh - 600px);
    min-height: 250px;
  }

  .episodes-content {
    padding: 0 15px;
  }

  .cover-image {
    width: 120px;
    height: 180px;
  }

  .primary-title {
    font-size: 1.4em;
  }

  .episodes-list {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .episode {
    height: 100px;
  }

  .thumbnail-container {
    width: 130px;
    min-width: 130px;
    height: 84px;
  }

  .episode-info {
    padding: 10px;
  }

  .category-selector {
    padding: 12px;
    gap: 8px;
  }

  .category-selector button {
    padding: 8px 12px;
    font-size: 0.9em;
    white-space: nowrap;
  }

  .pagination-controls {
    padding: 12px;
    gap: 10px;
  }

  .pagination-controls button {
    padding: 6px 12px;
    font-size: 0.9em;
  }
}

@media (max-width: 400px) {
  .header {
    min-height: 280px;
  }

  .content {
    padding: 12px;
    gap: 12px;
  }

  .cover-image {
    width: 100px;
    height: 150px;
  }

  .primary-title {
    font-size: 1.2em;
  }

  .episode {
    height: 90px;
  }

  .thumbnail-container {
    width: 110px;
    min-width: 110px;
    height: 74px;
  }

  .episode-title {
    font-size: 0.9em;
  }

  .episode-details {
    font-size: 0.8em;
  }
}

/* Mode paysage sur mobile */
@media (max-height: 500px) {
  .main-content {
    height: calc(100vh - 250px);
    display: flex;
    flex-direction: row;
    overflow: hidden;
  }

  .metadata {
    width: 300px;
    height: 100%;
  }

  .episodes-section {
    flex: 1;
    height: 100%;
  }
}

/* Corrections des styles */

/* Ajout des styles manquants pour le modal */
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

/* Ajout des styles pour le loading */
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #141414;
}

.spinner {
  border: 4px solid #333;
  border-top: 4px solid var(--accent-color);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Ajout des transitions manquantes */
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

.episode-fade-enter-active,
.episode-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.episode-fade-enter-from,
.episode-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Ajouter des styles pour les barres de défilement personnalisées */
.metadata::-webkit-scrollbar,
.episodes-list::-webkit-scrollbar {
  width: 8px;
}

.metadata::-webkit-scrollbar-track,
.episodes-list::-webkit-scrollbar-track {
  background: #1a1a1a;
}

.metadata::-webkit-scrollbar-thumb,
.episodes-list::-webkit-scrollbar-thumb {
  background: #333;
  border-radius: 4px;
}

.metadata::-webkit-scrollbar-thumb:hover,
.episodes-list::-webkit-scrollbar-thumb:hover {
  background: #444;
}

/* Ajuster pour les cas avec peu d'épisodes */
@media (min-width: 769px) {
  .episodes-list:only-child {
    grid-template-columns: minmax(300px, 600px);
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .episode {
    margin: 0;
    max-width: 100%;
  }
}

/* Ajuster pour mobile */
@media (max-width: 768px) {
  .category-selector {
    margin: -15px -15px 15px -15px;
    padding: 12px;
  }

  .episodes-section {
    padding: 15px;
  }
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
}

.skeleton-banner {
  width: 100%;
  height: 100%;
  background: linear-gradient(110deg, #1a1a1a 30%, #222 50%, #1a1a1a 70%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
}

.skeleton-content {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  display: flex;
  gap: 20px;
  align-items: flex-end;
}

.skeleton-poster {
  width: 150px;
  height: 225px;
  background: linear-gradient(110deg, #1a1a1a 30%, #222 50%, #1a1a1a 70%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
  border-radius: 8px;
}

.skeleton-title-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
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

.skeleton-main {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 20px;
  padding: 20px;
  height: calc(60vh - 40px);
}

.skeleton-metadata {
  background: #1a1a1a;
  border-radius: 8px;
  padding: 20px;
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

.skeleton-episodes {
  background: #1a1a1a;
  border-radius: 8px;
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
  overflow-y: auto;
}

.skeleton-episode {
  background: #222;
  border-radius: 12px;
  height: 110px;
  display: flex;
  gap: 12px;
  padding: 8px;
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
  justify-content: space-between;
  padding: 8px 0;
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
  .skeleton-main {
    grid-template-columns: 1fr;
    height: auto;
  }

  .skeleton-metadata {
    height: 300px;
  }

  .skeleton-episodes {
    height: calc(100vh - 700px);
  }
}

@media (max-width: 600px) {
  .skeleton-poster {
    width: 120px;
    height: 180px;
  }

  .skeleton-episodes {
    grid-template-columns: 1fr;
  }

  .skeleton-thumbnail {
    width: 130px;
    height: 84px;
  }
}
</style>