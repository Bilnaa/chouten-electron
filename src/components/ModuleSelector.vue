<template>
  <div class="module-selector">
    <div class="repo-container" ref="repoContainer" @scroll="handleScroll">
      <div class="repo-slider" :style="{ width: `${repos.length * 100}%` }">
        <div
          v-for="(repo, repoIndex) in repos"
          :key="repo.id"
          class="repo-section"
          :style="{ width: `${100 / repos.length}%` }"
        >
          <div class="repo-card">
            <img :src="repo.icon" alt="Repo Image" class="repo-image" />
            <div class="repo-info">
              <h3>{{ repo.name }}</h3>
              <p>{{ repo.team }}</p>
            </div>
            <span class="repo-version">v1.0.0</span>
          </div>
          <h4>Modules</h4>
          <div class="modules-grid">
            <div
              v-for="(module, moduleIndex) in repo.modules"
              :key="module.id"
              class="module-card"
              :class="{ 'selected': isModuleSelected(module) }"
              @click="selectModule(repo, module)"
            >
              <img :src="module.imagePath || placeholder" alt="Module Image" class="module-image" />
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


<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { Repo, Module } from '../store/index';

export default defineComponent({
  setup() {
    const store = useStore();
    const repos = computed(() => store.state.repos);
    const activeModule = computed(() => store.state.activeModule);
    const currentRepoIndex = ref(0);
    const repoContainer = ref<HTMLElement | null>(null);
    const placeholder = 'path/to/placeholder/image.png';

    const getModulePath = async (repoId: string, moduleName: string) => {
      const path = await window.ipcRenderer.invoke('get-module-path', repoId, moduleName)
      return path || null;
    };

    const handleScroll = () => {
      if (!repoContainer.value) return;

      const scrollLeft = repoContainer.value.scrollLeft;
      const containerWidth = repoContainer.value.clientWidth;
      currentRepoIndex.value = Math.round(scrollLeft / containerWidth);
    };

    const scrollToRepo = (index: number) => {
      if (!repoContainer.value) return;

      const containerWidth = repoContainer.value.clientWidth;
      repoContainer.value.scrollTo({ left: index * containerWidth, behavior: 'smooth' });
    };

    const selectModule = (repo: Repo, module: Module) => {
      store.dispatch('setActiveModule', module);
    };

    const isModuleSelected = (module: Module) => {
      return activeModule.value && activeModule.value.id === module.id;
    };

    const fetchModuleImages = async () => {
      for (const repo of repos.value) {
        for (const module of repo.modules) {
          console.log(repo.id, module.name)
          console.log(await getModulePath(repo.id, module.name))
          let modulePath = await getModulePath(repo.id, module.name);
          let iconPath = modulePath.modulePath + '/icon.jpg'
          module.imagePath = 'file://' + iconPath;
          module.path = modulePath.modulePath;
        }
      }
    };

    onMounted(async () => {
      await fetchModuleImages();
    });

    return {
      repos,
      currentRepoIndex,
      repoContainer,
      handleScroll,
      scrollToRepo,
      selectModule,
      isModuleSelected,
      getModulePath,
      placeholder,
    };
  },
});
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

  .module-card.selected {
    background-color: #2a2a2a;
    border: 2px solid #007AFF;
  }
  </style>
  