<template>
  <div>
    <button @click="openSearch" class="search-button">
      <MagnifyIcon :size="24" />
    </button>
    <div v-if="isSearchOpen" class="spotlight-overlay" @click="closeSearch">
      <div class="spotlight-modal" @click.stop>
        <div class="search-input-wrapper">
          <MagnifyIcon :size="24" />
          <input v-model="searchQuery" @keyup.enter="onSearch" @keypress="results = {}" class="search-input"
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
        <div v-else class="search-results">
          <router-link v-for="result in results" :key="result.url" :to="'/infos?url=' + result.url">
            {{ result.titles.primary }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import MagnifyIcon from 'vue-material-design-icons/Magnify.vue';
import TextItem from './TextItem.vue';

interface SearchResult {
  url: string;
  titles: {
    primary: string;
  };
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
    const results = ref<Record<string, SearchResult>>({});
    const recentSearches = ref<string[]>([]);
    const searchInput = ref<HTMLInputElement | null>(null);

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
      results.value = {};
      const search = await window.ipcRenderer.invoke('execute-script', `const instance = new source.default(); return instance.search("${searchQuery.value}")`);
      if (search.success) {
        results.value = search.result.results;
        addToRecentSearches(searchQuery.value);
      }
      console.log('Results:', results.value);
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
      openSearch,
      closeSearch,
      onSearch,
      setSearchQuery,
      addToRecentSearches,
      loadRecentSearches,
      saveRecentSearches
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
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
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
  max-height: 400px;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
}

.recent-searches {
  padding: 10px;
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
</style>