import { createStore } from 'vuex';

export interface Module {
    name: string;
    author: string;
    version: string;
    iconPath: string;
    filePath: string;
    subtypes: string[];
    id: string;
    selected?: boolean;
}

export interface Repo {
    id: string;
    name: string;
    author: string;
    url: string;
    icon: string;
    modules: Module[];
}

export interface State {
    repos: Repo[];
    activeModule: Module | null;
}

const localStorageKey = 'repos';
const activeModuleKey = 'activeModule';

const store = createStore<State>({
    state: {
        repos: JSON.parse(localStorage.getItem(localStorageKey) || '[]'),
        activeModule: JSON.parse(localStorage.getItem(activeModuleKey) || 'null')
    },
    mutations: {
        addRepo(state, repo: Repo) {
            state.repos.push(repo);
            localStorage.setItem(localStorageKey, JSON.stringify(state.repos));
        },
        removeRepo(state, repoId: string) {
            state.repos = state.repos.filter(repo => repo.id !== repoId);
            localStorage.setItem(localStorageKey, JSON.stringify(state.repos));
        },
        setActiveModule(state, module: Module | null) {
            state.activeModule = module;
            localStorage.setItem(activeModuleKey, JSON.stringify(module));
        },
        updateRepo(state, updatedRepo: Repo) {
            const index = state.repos.findIndex(repo => repo.id === updatedRepo.id);
            if (index !== -1) {
                state.repos[index] = updatedRepo;
                localStorage.setItem(localStorageKey, JSON.stringify(state.repos));
            }
        },
        updateModule(state, { repoId, updatedModule }: { repoId: string, updatedModule: Module }) {
            const repo = state.repos.find(r => r.id === repoId);
            if (repo) {
                const moduleIndex = repo.modules.findIndex(m => m.id === updatedModule.id);
                if (moduleIndex !== -1) {
                    repo.modules[moduleIndex] = updatedModule;
                    localStorage.setItem(localStorageKey, JSON.stringify(state.repos));
                }
            }
        },
        removeModule(state, { repoId, moduleId }: { repoId: string, moduleId: string }) {
            const repo = state.repos.find(r => r.id === repoId);
            if (repo) {
                repo.modules = repo.modules.filter(m => m.id !== moduleId);
                localStorage.setItem(localStorageKey, JSON.stringify(state.repos));
            }
        }
    },
    actions: {
        addRepo({ commit }, repo: Repo) {
            commit('addRepo', repo);
        },
        removeRepo({ commit }, repoId: string) {
            commit('removeRepo', repoId);
        },
        setActiveModule({ commit }, module: Module | null) {
            commit('setActiveModule', module);
        },
        updateRepo({ commit }, repo: Repo) {
            commit('updateRepo', repo);
        },
        updateModule({ commit }, payload: { repoId: string, updatedModule: Module }) {
            commit('updateModule', payload);
        },
        removeModule({ commit }, payload: { repoId: string, moduleId: string }) {
            commit('removeModule', payload);
        }
    },
    getters: {
        repos: state => state.repos,
        filteredRepos: state => (searchQuery: string) => {
            return state.repos.filter(repo =>
                repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                repo.author.toLowerCase().includes(searchQuery.toLowerCase())
            );
        },
        activeModule: state => state.activeModule
    }
});

export default store;