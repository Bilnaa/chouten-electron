import {
    createRouter,
    createWebHistory
  } from "vue-router";

import Home from './components/Home.vue';
import ComingSoon from './components/ComingSoon.vue';
import Repo from './components/Repo.vue';


export default createRouter({
    history: createWebHistory(),
    routes: [
      {
        path: '/',
        component: ComingSoon
      },
      {
        path:'/discover',
        component: Home
      },
      {
        path:'/repo',
        component: Repo
      },
      {
        path:'/settings',
        component: ComingSoon
      },
     ]
});