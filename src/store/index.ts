import { createStore } from 'vuex';
import axios from 'axios';

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
}

const activeModuleKey = 'activeModule';
const store = createStore({
    state: {
      activeModule: JSON.parse(localStorage.getItem(activeModuleKey) || 'null')
    },
    mutations: {
      setActiveModule(state, module) {
        state.activeModule = module;
        localStorage.setItem(activeModuleKey, JSON.stringify(module));
        location.href = '/discover';
      }
    },
    actions: {
      setActiveModule({ commit }, module) {
        commit('setActiveModule', module);
      }
    },
    getters: {
      activeModule: state => state.activeModule
    }
  });

export default store;