import {
    createRouter,
    createWebHistory
  } from "vue-router";

import Home from './components/Home.vue';
import ComingSoon from './components/ComingSoon.vue';
import Repo from './components/Repo.vue';
import Info from './components/Info.vue';
import VideoPlayer from './components/player/VideoPlayer.vue';


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
      },
      {
        path : '/streams',
        component:  VideoPlayer,
        props : route => ({ episodeId: route.query.episodeId, episodeTitle: route.query.episodeTitle, title : route.query.title})
      }
     ]
});