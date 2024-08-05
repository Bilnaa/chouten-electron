import { createRouter, createWebHashHistory } from "vue-router";

import Home from "./components/Discover.vue";
import ComingSoon from "./components/ComingSoon.vue";
import Repo from "./components/Repo.vue";
import Info from "./components/Info.vue";
import VideoPlayer from "./components/player/VideoPlayer.vue";
import Reader from "./components/imageReader.vue";
import Collections from "./components/Collections.vue";

export default createRouter({
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
      path: "/infos",
      component: Info,
      props: (route) => ({ url: route.query.url }),
    },
    {
      path: "/streams",
      component: VideoPlayer,
      props: (route) => ({
        episodeId: route.query.episodeId,
        episodeTitle: route.query.episodeTitle,
        title: route.query.title,
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
