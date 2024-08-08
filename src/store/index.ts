import { createStore } from 'vuex';

// Existing state, mutations, actions, and getters
export interface Module {
  name: string;
  author: string;
  version: string;
  iconPath: string;
  filePath: string;
  subtypes: string[];
  id: string;
  selected?: boolean;
  installed?: boolean;
}

export interface Repo {
  id: string;
  title: string;
  author: string;
  description: string;
  url: string;
  icon: string;
  modules: Module[];
}

export interface State {
  repos: Repo[];
  activeModule: Module | null;
  // Add new state property for Discord RPC
  discordRpcEnabled: boolean;
}

const activeModuleKey = 'activeModule';
const discordRpcEnabledKey = 'discordRpcEnabled';

const store = createStore({
  state: {
    activeModule: JSON.parse(localStorage.getItem(activeModuleKey) || 'null'),
    // Initialize Discord RPC state from localStorage
    discordRpcEnabled: JSON.parse(localStorage.getItem(discordRpcEnabledKey) || 'true'),
  },
  mutations: {
    setActiveModule(state, module) {
      state.activeModule = module;
      localStorage.setItem(activeModuleKey, JSON.stringify(module));
    },
    // Add new mutation to update Discord RPC state
    setDiscordRpcEnabled(state, enabled) {
      state.discordRpcEnabled = enabled;
      localStorage.setItem(discordRpcEnabledKey, JSON.stringify(enabled));
    },
  },
  actions: {
    setActiveModule({ commit }, module) {
      commit('setActiveModule', module);
    },
    // Add new action to enable/disable Discord RPC
    enableDiscordRPC({ commit }) {
      commit('setDiscordRpcEnabled', true);
      window.ipcRenderer.invoke('enable-discord');
    },
    disableDiscordRPC({ commit }) {
      commit('setDiscordRpcEnabled', false);
      window.ipcRenderer.invoke('disable-discord');
    },
    async fetchDiscordRPCStatus({ commit }) {
      await window.ipcRenderer.invoke('get-discord-status').then((enabled) => {
        commit('setDiscordRpcEnabled', enabled);
      });
    },
  },
  getters: {
    activeModule: (state) => state.activeModule,
    discordRpcEnabled: (state) => state.discordRpcEnabled,
  },
});

export default store;