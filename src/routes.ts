import { createRouter, createWebHashHistory } from "vue-router";

import Home from "./components/Discover.vue";
import ComingSoon from "./components/ComingSoon.vue";
import Repo from "./components/Repo.vue";
import Info from "./components/Info.vue";
import VideoPlayer from "./components/player/VideoPlayer.vue";
import Reader from "./components/imageReader.vue";
import Collections from "./components/Collections.vue";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      component: Collections,
    },
    {
      name: "Discover",
      path: "/discover",
      component: Home,
    },
    {
      path: "/repo",
      component: Repo,
    },
    {
      path: "/settings",
      component: ComingSoon,
    },
    {
      name: "infos",
      path: "/infos",
      component: Info,
      props: (route) => ({ url: route.query.url }),
    },
    {
      name: "streams",
      path: "/streams",
      component: VideoPlayer,
      props: (route) => ({
        episodeId: route.query.episodeId,
        episodeTitle: route.query.episodeTitle,
        title: route.query.title,
        episodes : route.query.episodes 
      }),
    },
    { path: "/reader", component: Reader,
      props: (route) => ({
      episodeId: route.query.episodeId,
      episodeTitle: route.query.episodeTitle,
      title: route.query.title,
    }),},
  ],
});

// router.beforeEach((to, from, next) => {
//   // if it goes to streams I want a complete reload but just once
//   if (to.name === "streams") {
//     location.reload();
//     return;
//   }
//   next();
// });

export default router;
