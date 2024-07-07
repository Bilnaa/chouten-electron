<template>
    <div class="module-selector">
      <h2>Repositories and Modules</h2>
      <div class="repo-container" ref="repoContainer" @scroll="handleScroll">
        <div class="repo-slider" :style="{ width: `${repos.length * 100}%` }">
          <div v-for="(repo, index) in repos" :key="repo.id" class="repo-section" :style="{ width: `${100 / repos.length}%` }">
            <div class="repo-card">
              <img :src="repo.image" alt="Repo Image" class="repo-image">
              <div class="repo-info">
                <h3>{{ repo.name }}</h3>
                <p>{{ repo.description }}</p>
              </div>
              <span class="repo-version">v{{ repo.version }}</span>
            </div>
            <div class="modules-grid">
              <div v-for="module in repo.modules" :key="module.id" class="module-card" @click="selectModule(repo, module)">
                <img :src="module.image" alt="Module Image" class="module-image">
                <div class="module-info">
                  <h4>{{ module.name }}</h4>
                  <div class="module-meta">
                    <span class="module-author">{{ module.author }}</span>
                    •
                    <span class="module-version">{{ module.version }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="pagination">
        <span
          v-for="(repo, index) in repos"
          :key="repo.id"
          class="dot"
          :class="{ active: index === currentRepoIndex }"
          @click="scrollToRepo(index)"
        ></span>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ModuleSelector',
    data() {
      return {
        currentRepoIndex: 0,
        repos: [
          {
            id: 1,
            name: 'Test Repo',
            description: 'This is a test repo for internal Chouten testing.',
            version: '1.0.0',
            image: '/mountains.svg',
            modules: [
              { id: 1, name: 'Aniwave.to', image: '/mountains.svg', version: '1.0.0', author: 'Chouten-Team' },
              { id: 2, name: 'Hianime.to', image: '/mountains.svg', version: '0.1.0', author: 'Anonymous' },
            ]
          },
          {
            id: 2,
            name: 'Another Repo',
            description: 'This is another repository with different modules.',
            version: '0.5.0',
            image: '/mountains.svg',
            modules: [
              { id: 3, name: 'Module A', image: '/mountains.svg', version: '0.3.0', author: 'Author A' },
              { id: 4, name: 'Module B', image: '/mountains.svg', version: '0.2.1', author: 'Author B' },
            ]
          },
        ]
      }
    },
    computed: {
      currentRepo() {
        return this.repos[this.currentRepoIndex]
      }
    },
    methods: {
      selectModule(repo, module) {
        this.$emit('module-selected', { repo, module })
      },
      handleScroll() {
        const container = this.$refs.repoContainer;
        const scrollPosition = container.scrollLeft;
        const containerWidth = container.clientWidth;
        this.currentRepoIndex = Math.round(scrollPosition / containerWidth);
      },
      scrollToRepo(index) {
        const container = this.$refs.repoContainer;
        container.scrollTo({
          left: index * container.clientWidth,
          behavior: 'smooth'
        });
        this.currentRepoIndex = index;
      }
    }
  }
  </script>
  
  <style scoped>
  .module-selector {
    padding: 20px;
  }
  
  .repo-container {
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* Internet Explorer 10+ */
  }
  
  .repo-container::-webkit-scrollbar {
    display: none; /* WebKit */
  }
  
  .repo-slider {
    display: flex;
    transition: transform 0.3s ease;
  }
  
  .repo-section {
    flex: 0 0 auto;
    scroll-snap-align: start;
    padding: 0 20px;
    box-sizing: border-box;
  }
  
  .repo-card {
    display: flex;
    align-items: center;
    background-color: #171717;
    border-radius: 10px; /* Add rounded borders */
    padding: 15px;
    margin-bottom: 20px;
    position: relative;
    max-width: 600px; /* Adjust the width as needed */
    overflow: hidden; /* Ensure the border radius is applied to the entire card, including the image */
  }
  
  .repo-image {
    width: 60px;
    height: 60px;
    border-radius: 10px; /* Ensure the image also has rounded borders */
    margin-right: 15px;
  }
  
  .repo-info {
    flex-grow: 1;
  }
  
  .repo-info h3 {
    margin: 0 0 5px 0;
  }
  
  .repo-info p {
    margin: 0;
  }
  
  .repo-version {
    position: absolute;
    top: 15px;
    right: 15px;
    background-color: #2a2a2a;
    color: #fff;
    padding: 5px 10px;
    border-radius: 20px;
    font-size: 0.8em;
  }
  
  .modules-grid {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .module-card {
    display: flex;
    align-items: center;
    background-color: #171717;
    border-radius: 10px; /* Add rounded borders */
    padding: 10px;
    cursor: pointer;
    transition: background-color 0.3s;
    max-width: 600px; /* Adjust the width as needed */
    overflow: hidden; /* Ensure the border radius is applied to the entire card, including the image */
  }
  
  .module-card:hover {
    background-color: #2a2a2a;
  }
  
  .module-image {
    width: 50px;
    height: 50px;
    border-radius: 10px; /* Ensure the image also has rounded borders */
    margin-right: 15px;
  }
  
  .module-info {
    display: flex;
    flex-direction: column;
  }
  
  .module-info h4 {
    margin: 0 0 5px 0;
    font-size: 1em;
  }
  
  .module-meta {
    display: flex;
    justify-content: space-between;
    font-size: 0.8em;
    color: #888;
  }
  
  .module-author {
    margin-right: 5px;
  }
  
  .module-version {
    color: #fff;
    margin-left: 5px;
  }
  
  .pagination {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
  
  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #666;
    margin: 0 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .dot.active {
    background-color: #fff;
  }
  </style>
  