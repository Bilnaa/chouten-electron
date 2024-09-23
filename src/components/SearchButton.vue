<template>
  <div>
    <button @click="openSearch" class="search-button">
      <MagnifyIcon :size="24" />
    </button>
    <div v-if="isSearchOpen" class="spotlight-overlay" @click="closeSearch">
      <div class="spotlight-modal" @click.stop>
        <div class="search-input-wrapper">
          <MagnifyIcon :size="24" />
          <input v-model="searchQuery" @keyup.enter="onSearch" @keypress="results = []" class="search-input"
            placeholder="Press Enter to search" ref="searchInput" />
        </div>
        <div v-if="recentSearches.length > 0 && !searchQuery" class="recent-searches">
          <h3>Recent Searches</h3>
          <ul>
            <li v-for="(search, index) in recentSearches" :key="index" @click="setSearchQuery(search)">
              {{ search }}
            </li>
          </ul>
        </div>
        <div v-else class="search-results" ref="searchResults" @scroll="handleScroll">
          <div v-for="result in results" :key="result.url" class="search-result-item">
            <router-link :to="'/infos?url=' + result.url" class="result-link">
              <img :src="result.poster" :alt="result.titles.primary" class="result-poster">
              <div class="result-info">
                <h3 class="result-title">{{ result.titles.primary }}</h3>
                <p v-if="result.titles.secondary" class="result-subtitle">{{ result.titles.secondary }}</p>
                <div class="result-details">
                  <span class="result-indicator">{{ result.indicator }}</span>
                  <span v-if="result.current && result.total" class="result-progress">
                    {{ result.current }} / {{ result.total }}
                    
                  </span>
                </div>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import MagnifyIcon from 'vue-material-design-icons/Magnify.vue';
import TextItem from './TextItem.vue';

type Titles = {
  primary: string;
  secondary?: string;
};

interface SearchResult {
  url: string;
  titles: Titles;
  poster: string;
  indicator: string;
  current?: number;
  total?: number;
}


export default defineComponent({
  name: 'SearchButton',
  components: {
    MagnifyIcon,
    TextItem
  },
  setup() {
    const isSearchOpen = ref(false);
    const searchQuery = ref('');
    const results = ref<SearchResult[]>([]);
    const recentSearches = ref<string[]>([]);
    const searchInput = ref<HTMLInputElement | null>(null);
    const searchResults = ref<HTMLDivElement | null>(null);
    const currentPage = ref<number>(1);
    const totalPages = ref<number>(1);
    const isLoading = ref<boolean>(false);
    const hasMorePages = computed(() => currentPage.value < totalPages.value);
    const openSearch = () => {
      isSearchOpen.value = true;
      setTimeout(() => searchInput.value?.focus(), 0);
      loadRecentSearches();
    };

    const closeSearch = () => {
      isSearchOpen.value = false;
      searchQuery.value = '';
    };

    const onSearch = async () => {
      console.log('Searching for:', searchQuery.value);
      results.value = [];
      currentPage.value = 1;
      const search = await window.ipcRenderer.invoke('execute-script', `const instance = new source.default(); return instance.search("${searchQuery.value}",1)`);
      if (search.success) {
        totalPages.value = search.result.info.pages;
        results.value = search.result.results;
        addToRecentSearches(searchQuery.value);
      }
      console.log('Results:', results.value);
    };

    const loadMoreResults = async () => {
      if (isLoading.value || currentPage.value >= totalPages.value) return;

      isLoading.value = true;
      currentPage.value++;

      const search = await window.ipcRenderer.invoke('execute-script', `const instance = new source.default(); return instance.search("${searchQuery.value}",${currentPage.value})`);
      if (search.success) {
        results.value  = [...results.value, ...search.result.results];
      }

      isLoading.value = false;
    };

    const handleScroll = () => {
      const element = searchResults.value;
      if (element) {
        const { scrollTop, scrollHeight, clientHeight } = element;
        if (scrollTop + clientHeight >= scrollHeight - 50 && !isLoading.value && hasMorePages.value) {
          loadMoreResults();
        }
      }
    };

    const setSearchQuery = (query: string) => {
      searchQuery.value = query;
      onSearch();
    };

    const addToRecentSearches = (query: string) => {
      const maxRecentSearches = 10;
      const index = recentSearches.value.indexOf(query);
      if (index > -1) {
        recentSearches.value.splice(index, 1);
      }

      recentSearches.value.unshift(query);

      if (recentSearches.value.length > maxRecentSearches) {
        recentSearches.value = recentSearches.value.slice(0, maxRecentSearches);
      }

      saveRecentSearches();
    };

    const loadRecentSearches = () => {
      const savedSearches = localStorage.getItem('recentSearches');
      if (savedSearches) {
        recentSearches.value = JSON.parse(savedSearches);
      }
    };

    const saveRecentSearches = () => {
      localStorage.setItem('recentSearches', JSON.stringify(recentSearches.value));
    };

    onMounted(() => {
      loadRecentSearches();
    });

    return {
      isSearchOpen,
      searchQuery,
      results,
      recentSearches,
      searchInput,
      searchResults,
      openSearch,
      closeSearch,
      onSearch,
      setSearchQuery,
      addToRecentSearches,
      loadRecentSearches,
      saveRecentSearches,
      loadMoreResults,
      hasMorePages,
      isLoading,
      handleScroll
    };
  }
});
</script>

<style scoped>
.search-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  color: #ffffff;
}

.spotlight-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 100px;
  z-index: 1000;
}

.spotlight-modal {
  background-color: #2d2d2d;
  border-radius: 8px;
  position: fixed;
  top: 35%;
  width: 600px;
  max-width: 90%;
  max-height: 80vh;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid #444444;
}

.search-input {
  flex-grow: 1;
  border: none;
  font-size: 16px;
  margin-left: 10px;
  outline: none;
  background-color: transparent;
  color: #ffffff;
}

.search-input::placeholder {
  color: #888888;
}

.search-results {
  flex-grow: 1;
  overflow-y: auto;
  padding: 1rem;
  max-height: 480px;
}

.recent-searches {
  padding: 10px;
  overflow-y: auto;
}

.recent-searches h3 {
  margin-top: 0;
  color: #888888;
  font-size: 14px;
}

.recent-searches ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.recent-searches li {
  padding: 5px 0;
  cursor: pointer;
  color: #ffffff;
}

.recent-searches li:hover {
  background-color: #3d3d3d;
}

.search-result-item {
  margin-bottom: 1rem;
  border-bottom: 1px solid #444444;
  padding-bottom: 1rem;
  transition: background-color 0.3s ease;
}

.search-result-item:hover {
  background-color: #3d3d3d;
}

.result-link {
  display: flex;
  text-decoration: none;
  color: inherit;
}

.result-poster {
  width: 80px;
  height: 120px;
  object-fit: cover;
  margin-right: 1rem;
  border-radius: 4px;
}

.result-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.result-title {
  font-size: 1.1rem;
  margin: 0 0 0.3rem 0;
  color: #ffffff;
}

.result-subtitle {
  font-size: 0.9rem;
  color: #bbbbbb;
  margin: 0 0 0.3rem 0;
}

.result-details {
  display: flex;
  align-items: center;
  margin-top: auto;
}

.result-indicator {
  display: inline-block;
  background-color: #007bff;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
  margin-right: 0.5rem;
}

.result-progress {
  font-size: 0.8rem;
  color: #bbbbbb;
}
</style>