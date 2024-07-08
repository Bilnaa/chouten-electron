import { createStore } from 'vuex';

export interface Module {
    id: number;
    name: string;
    author: string;
    version: string;
    image: string;
}

export interface Repo {
    id: number;
    name: string;
    team: string;
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
        removeRepo(state, repoId: number) {
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
    },
    actions: {
        addRepo({ commit }, repo: Repo) {
            commit('addRepo', repo);
        },
        removeRepo({ commit }, repoId: number) {
            commit('removeRepo', repoId);
        },
        setActiveModule({ commit }, module: Module | null) {
            commit('setActiveModule', module);
        },
        updateRepo({ commit }, repo: Repo) {
            commit('updateRepo', repo);
        },
    },
    getters: {
        repos: state => state.repos,
        filteredRepos: state => (searchQuery: string) => {
            return state.repos.filter(repo =>
                repo.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        },
        activeModule: state => state.activeModule
    }
});

export default store;