<template>
    <Tooltip :placement="tooltipPlacement" v-if="hasNextEpisode">
      <template #trigger>
        <media-toggle-button class="media-button" @click="nextEpisode">
          <media-icon type="fast-forward"></media-icon>
        </media-toggle-button>
      </template>
      <template #content>
        <span class="on-tooltip-text">Next Episode</span>
      </template>
    </Tooltip>
  </template>
  
  <script lang="ts">
  import { defineComponent, computed, watch } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import Tooltip from '../Tooltip.vue';
  import { TooltipPlacement } from 'vidstack';
  
  export default defineComponent({
    components: {
      Tooltip
    },
    props: {
      tooltipPlacement: {
        type: String as () => TooltipPlacement,
        required: true
      },
      episodes: {
        type: String,
        default: '[]'
      }
    },
    setup(props) {
      const router = useRouter();
      const route = useRoute();
  
      const parsedEpisodes = computed(() => JSON.parse(props.episodes));
  
      const currentEpisodeIndex = computed(() => 
        parsedEpisodes.value.findIndex((episode: { url: string }) => 
          episode.url === route.query.episodeId
        )
      );
  
      const nextEpisodeObject = computed(() => {
        const nextEpisode = parsedEpisodes.value[currentEpisodeIndex.value + 1];
        if (!nextEpisode) return null;
  
        return {
          url: nextEpisode.url,
          title: route.query.title as string,
          episodeId: nextEpisode.episodeId,
          episodeTitle: nextEpisode.title,
        };
      });
  
      const hasNextEpisode = computed(() => !!nextEpisodeObject.value);
  
      const nextEpisode = () => {
        if (nextEpisodeObject.value) {
          router.push({
            name: 'streams',
            query: {
              episodeId: nextEpisodeObject.value.url,
              episodeTitle: nextEpisodeObject.value.episodeTitle,
              title: route.query.title,
              episodes: props.episodes
            }
          });
        }
      };
  
      watch(() => route.query.episodeId, () => {
        console.log('Route changed');
        console.log('episodes', props.episodes);
      });
  
      return {
        hasNextEpisode,
        nextEpisode
      };
    }
  });
  </script>
  
  <style scoped>
  .media-button:not([data-active]) .on-icon,
  .media-button[data-active] .off-icon {
    display: none;
  }
  </style>