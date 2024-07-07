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

const store = createStore<State>({
    state: {
        repos: JSON.parse(localStorage.getItem(localStorageKey) || '[]'),
        activeModule: null
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
        }
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
        }
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
