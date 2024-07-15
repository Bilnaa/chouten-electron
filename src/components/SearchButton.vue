<template>
    <div>
      <button @click="openSearch" class="search-button">
        <MagnifyIcon :size="24" />
      </button>
      <div v-if="isSearchOpen" class="spotlight-overlay" @click="closeSearch">
        <div class="spotlight-modal" @click.stop>
          <div class="search-input-wrapper">
            <MagnifyIcon :size="24" />
            <input 
              v-model="searchQuery" 
              @input="onSearch" 
              class="search-input" 
              placeholder="Search..." 
              ref="searchInput"
            />
          </div>
          <div class="search-results">
              <router-link v-for="result in results" :key="result" :to="'/infos?url='+result.url">
                {{ result.titles.primary }}
                <br>
              </router-link>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import MagnifyIcon from 'vue-material-design-icons/Magnify.vue'
  import TextItem from './TextItem.vue';
  
  export default {
    name: 'SearchButton',
    components: {
      MagnifyIcon,
      TextItem
    },
    data() {
      return {
        isSearchOpen: false,
        searchQuery: '',
        results : {}
      }
    },
    methods: {
      openSearch() {
        this.isSearchOpen = true;
        this.$nextTick(() => this.$refs.searchInput.focus());
      },
      closeSearch() {
        this.isSearchOpen = false;
        this.searchQuery = '';
      },
      async onSearch() {
        console.log('Searching for:', this.searchQuery);
        const search = await window.ipcRenderer.invoke('execute-script', `const instance = new source.default(); return instance.search("${this.searchQuery}")`);
        if(search.success){
          this.results = search.result.results;
        }
        console.log('Results:', this.results);
      }
    }
  }
  </script>
  
  <style scoped>
  .search-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    color: #ffffff; /* Light color for the icon */
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
  }
  </style>