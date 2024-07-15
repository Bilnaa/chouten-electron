<template>
  <div class="home">
    <div class="top-bar">
      <SearchButton />
    </div>
    <div class="main-content">
      <CardGrid :cards="carouselData" />
      <Section v-for="section in sections" :key="section.title" v-bind="section" use="TextItem" />
    </div>
  </div>
</template>

<script>
import Sidebar from './Sidebar.vue'
import CardGrid from './CardGrid.vue'
import Section from './Section.vue'
import SearchButton from './SearchButton.vue'

export default {
  name: 'Home',
  components: {
    Sidebar,
    CardGrid,
    Section,
    SearchButton,
  },
  data() {
    return {
      discover: {},
      carouselData: [],
      sections: [],
      module : {}
    }
  },
  methods : {
    async executeJs(code){
      let executedJs = await window.ipcRenderer.invoke('execute-script',code);
      if(executedJs.success){
        return executedJs.result;
      }
    },
    processDiscoverData() {
      if (this.discover && Array.isArray(this.discover)) {
        this.carouselData = this.discover.find(item => item.title === "Carousel")?.data || [];
        this.sections = this.discover.filter(item => item.title !== "Carousel");
      } 
      if(this.carouselData.length === 0){
        this.carouselData = this.discover[0].data;
        this.sections = this.discover.slice(1);
      }
    }
  },
  mounted : async function() {
    let activeModule = localStorage.getItem('activeModule');
    activeModule = JSON.parse(activeModule);
    let modulePath = await window.ipcRenderer.invoke('get-module-path', activeModule.id);
    let code = modulePath.modulePath + '/code.js';
    console.log(code);
    await window.ipcRenderer.invoke('load-script', code);
    let getDiscover = await window.ipcRenderer.invoke('execute-script','const instance = new source.default(); return instance.discover();');
    if (getDiscover.success) {
    this.discover = getDiscover.result;
    console.log(this.discover);
    let getModuleInfo = await window.ipcRenderer.invoke('execute-script','const instance = new source.default(); return instance');
    if(getModuleInfo.success){
      this.module = getModuleInfo.result;
    }
  this.processDiscoverData();

}
  }
}
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  height: 100vh;
  color: #ffffff; /* Light text color for contrast */
}

.top-bar {
  display: flex;
  margin-top: 20px;
  justify-content: flex-end;
  align-items: center;
  padding: 10px 20px;
}

.main-content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
  min-width: 900px;
}
</style>