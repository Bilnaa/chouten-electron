<template>
  <div class="module-selector">
    <div class="repo-container" ref="repoContainer" @scroll="handleScroll">
      <div class="repo-slider" :style="{ width: `${(repos.length + 1) * 100}%` }">
        <!-- Repo Modules -->
        <div
          v-for="(repo, repoIndex) in repos"
          :key="repo.id"
          class="repo-section"
          :style="{ width: `${100 / (repos.length + 1)}%` }"
        >
          <div class="repo-card">
            <img :src="repo.icon" alt="Repo Image" class="repo-image" />
            <div class="repo-info">
              <h3>{{ repo.title }}</h3>
              <p>{{ repo.author }}</p>
              <span class="repo-desc">
              {{ repo.description }}
            </span>
            </div>
            <span class="repo-version">v1.0.0</span>
            
          </div>
          <h4>Modules</h4>
          <div class="modules-grid">
            <div
              v-for="module in repo.modules.filter(m => m.installed === true)"
              :key="module.id"
              class="module-card"
              :class="{ 'selected': isModuleSelected(module) }"
              @click="selectModule(module)"
            >
              <img :src="module.iconPath || placeholder" alt="Module Image" class="module-image" />
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

        <!-- Orphan Modules -->
        <div class="repo-section orphan-section" :style="{ width: `${100 / (repos.length + 1)}%` }" v-if="orphanModules.length > 0">
          <h4>Orphan Modules</h4>
          <div class="modules-grid">
            <div
              v-for="module in orphanModules"
              :key="module.id"
              class="module-card orphan"
              :class="{ 'selected': isModuleSelected(module) }"
              @click="selectModule(module)"
            >
              <img :src="module.iconPath || placeholder" alt="Module Image" class="module-image" />
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
        v-if="orphanModules.length > 0"
        v-for="(repo, index) in [...repos, { id: 'orphan' }]"
        :key="repo.id"
        class="dot"
        :class="{ active: index === currentRepoIndex }"
        @click="scrollToRepo(index)"
      ></span>
      <span
        v-else
        v-for="(repo, index) in repos"
        :key="repo.title"
        class="dot"
        :class="{ active: index === currentRepoIndex }"
        @click="scrollToRepo(index)"
      ></span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, inject } from 'vue';
import { useStore } from 'vuex';
import store, { Repo, Module } from '../store/index';
export default defineComponent({
  setup() {
    const store = useStore();
    const showToast = inject('showToast') as (title: string, message: string, icon?: string, duration?: number) => void;
    const repos = ref<Repo[]>([]);
    const activeModule = computed(() => store.state.activeModule);
    const currentRepoIndex = ref(0);
    const repoContainer = ref<HTMLElement | null>(null);
    const placeholder = 'mountains.svg';
    const modules = ref<Module[]>([]);

    const orphanModules = computed(() => {
      return modules.value
    });

    const loadModules = async () => {
      try {
        const result = await window.ipcRenderer.invoke('get-module-list');
        if (result.success) {
          console.log('Modules:', result.moduleList);
          modules.value = result.moduleList;
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error('Failed to load modules:', error);
        showToast('Failed to load modules', 'An error occurred while trying to load the modules.', 'Error', 5000);
      }
    };

    const loadRepos = async () => {
      try {
        const result = await window.ipcRenderer.invoke('get-repo-list');
        if (result.success) {
          console.log('Repos:', result.repoList);
          repos.value = result.repoList;
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error('Failed to load repos:', error);
        showToast('Failed to load repos', 'An error occurred while trying to load the repos.', 'Error', 5000);
      }
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


    const isModuleSelected = (module: Module) => {
      return activeModule.value && activeModule.value.id === module.id;
    };

    onMounted(loadRepos);
    onMounted(loadModules);

    return {
      repos,
      modules,
      orphanModules,
      currentRepoIndex,
      repoContainer,
      handleScroll,
      scrollToRepo,
      isModuleSelected,
      loadModules,
      placeholder,
    };
  },
  methods : {
      selectModule(module: Module) {
      store.dispatch('setActiveModule', module);
    }
  }
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
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 20px;
  position: relative;
  max-width: 600px;
  overflow: hidden;
}

.repo-image {
  width: 60px;
  height: 60px;
  border-radius: 10px;
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
  border-radius: 10px;
  padding: 10px;
  cursor: pointer;
  transition: background-color 0.3s;
  max-width: 600px;
  overflow: hidden;
}

.module-card:hover {
  background-color: #2a2a2a;
}

.module-image {
  width: 50px;
  height: 50px;
  border-radius: 10px;
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

.module-card.orphan {
  border: 1px dashed #666;
}

.module-card.orphan.selected {
  border: 2px dashed #007AFF;
}

.repo-desc {
  margin-top: 10px;
  color: #888;
}
</style>