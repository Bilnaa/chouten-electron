import {
    createRouter,
    createWebHistory
  } from "vue-router";

import Home from './components/Home.vue';
import ComingSoon from './components/ComingSoon.vue';
import Repo from './components/Repo.vue';
import Info from './components/Info.vue';


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
      {
        path:'/infos',
        component: Info,
        props : route => ({ url: route.query.url })
      }
     ]
});