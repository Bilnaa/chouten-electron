<template>
  <div class="home">
    <div class="top-bar">
      <SearchButton />
    </div>
    <div class="main-content">
      <component
        v-for="(item, index) in discover"
        :key="index"
        :is="getComponent(item.type)"
        v-bind="item"
        :data="item.data"
        :use="use(item.type)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Sidebar from "./Sidebar.vue";
import CardGrid from "./CardGrid.vue";
import Section from "./Section.vue";
import SearchButton from "./SearchButton.vue";
import { useStore } from "vuex";
import store from "../store";

type HexColor = `#${string}`;

type Titles = {
  primary: string;
  secondary?: string;
};
type Label = {
  text: string;
  color: HexColor;
};
enum DiscoverTypes {
  CAROUSEL,
  LIST,
  GRID_2x,
  GRID_3x,
}

type DiscoverListing = {
  url: string;
  titles: Titles;
  poster: string;
  description: string;
  label?: Label;
  indicator: string;
  current?: number;
  total?: number;
};

type DiscoverListings = {
  type: DiscoverTypes;
  title: string;
  data: DiscoverListing[];
};

export default defineComponent({
  name: "Home",
  components: {
    Sidebar,
    CardGrid,
    Section,
    SearchButton,
  },
  setup() {
    const store = useStore();
    return {
      store,
    };
  },
  data() {
    return {
      discover: [] as DiscoverListings[],
      module: {},
    };
  },
  methods: {
    async injectInstance() {
      let activeModule = store.state.activeModule;
      if (!activeModule) {
        console.error("No active module found");
        return;
      }
      let modulePath = await window.ipcRenderer.invoke(
        "get-module-path",
        activeModule?.id
      );
      let code = modulePath.modulePath + "/code.js";
      console.log(code);
      let injectJs = await window.ipcRenderer.invoke("load-script", code);
      while (injectJs.success === false) {
        console.log(injectJs.error);
        if (injectJs.error === "ENOENT: no such file or directory") {
          console.error("No code.js file found in module directory");
          break;
        }
        injectJs = await window.ipcRenderer.invoke("load-script", code);
      }
    },
    async executeJs(code : string) {
      let executedJs = await window.ipcRenderer.invoke("execute-script", code);
      if (executedJs.success) {
        return executedJs.result;
      }
    },
    getComponent(type: DiscoverTypes) {
      switch (type) {
        case DiscoverTypes.CAROUSEL:
          return CardGrid;
        case DiscoverTypes.LIST:
        case DiscoverTypes.GRID_2x:
        case DiscoverTypes.GRID_3x:
          return Section;
        default:
          return Section;
      }
    },
    use (type: DiscoverTypes) {
      switch (type) {
        case DiscoverTypes.LIST:
          return "NumberedItem";
        case DiscoverTypes.GRID_2x:
        case DiscoverTypes.GRID_3x:
          return "TextItem";
        default:
          return null;
      }
    }
  },
  mounted: async function () {
    console.log("Home mounted");
    await this.injectInstance();
    let getDiscover = await window.ipcRenderer.invoke(
      "execute-script",
      "const instance = new source.default(); return instance.discover()"
    );
    if (getDiscover.success) {
      this.discover = getDiscover.result;
      let getModuleInfo = await window.ipcRenderer.invoke(
        "execute-script",
        "const instance = new source.default(); return instance"
      );
      if (getModuleInfo.success) {
        this.module = getModuleInfo.result;
      }
    }
  },
});
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  height: 100vh;
  color: #ffffff;
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
