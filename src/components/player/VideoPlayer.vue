<template>
  <div class="fullscreen-container" v-if="!error">
    <div class="video-player-container">
      <media-player ref="mediaPlayer" viewType="video" streamType="on-demand" logLevel="warn" :crossOrigin="true"
        style="border-radius: 20px;" :playsInline="true" @provider-change="onProviderChange" :type="type" canAirPlay
        canChromecast @controls-change="onControlsChange" storage="local" load="eager" @canPlay="onCanPlay"
        captions="default-showing">
        <media-provider>
          <div class="top-bar" :style="{ visibility: showInterface ? 'visible' : 'hidden' }">
            <button class="back" @click="goBack">
              <media-icon type="arrow-left" />
            </button>
            <button class="quality">
              <media-icon type="menu-vertical" />
              <div class="quality-dropdown">
                <button v-if="qualities.length !== 0" v-for="quality in qualities" @click="changeQuality(quality)">{{
                  quality }}</button>
              </div>
            </button>
          </div>
          <div class="bottombar" :style="{ visibility: showInterface ? 'visible' : 'hidden' }">
            <div class="episodeTitle">
              {{ title }}
            </div>
            <div class="title">
              {{ episodeTitle }}
            </div>
          </div>
          <media-poster :src="posterUrl" default="" class="vds-poster" />
          <source :src="streamUrl" />
          <track v-for="(subtitle, index) in subtitles" :key="index" :src="subtitle.url" :srclang="subtitle.language"
            :label="subtitle.language" :kind="subtitle.type === SubtitleType.VTT ? 'subtitles' : 'chapters'"
            :default="index === 0" />
        </media-provider>

        <div class="vds-buffering-indicator">
          <media-spinner class="vds-buffering-spinner"></media-spinner>
        </div>
        <VideoLayout :thumbnails="thumbnails" :episodes="episodes" />
      </media-player>
    </div>
  </div>
  <div v-else class="error-message" style="z-index: 999999;">
    <alert-circle-outline class="icon" />
    <p class="error-title">{{ errorMessage }}</p>
    <p class="error-details">{{ errorDetails }}</p>
    <button class="back-button" @click="goBack">Go Back</button>
  </div>
</template>

<script lang="ts">
import 'vidstack/player/styles/base.css';
import 'vidstack/player';
import 'vidstack/player/ui';
import 'vidstack/icons';
import 'vidstack/player/styles/default/theme.css';
import 'vidstack/player/styles/default/layouts/audio.css';
import 'vidstack/player/styles/default/layouts/video.css';
import './buttons.css';
import Hls from 'hls.js';
import { useStore } from 'vuex';
import type { MediaPlayerElement } from 'vidstack/elements';
import VideoLayout from './layouts/VideoLayout.vue';

import {
  MediaPlayer, isHLSProvider, type MediaCanPlayEvent, type MediaProviderChangeEvent, type MediaControlsChangeEvent,
} from 'vidstack';
import { type Presence } from 'discord-rpc';
import { ref } from 'vue';
import AlertCircleOutline from 'vue-material-design-icons/AlertCircleOutline.vue'

const mediaPlayer = ref<MediaPlayerElement | null>(null);

enum SubtitleType {
  VTT = 0,
  SRT = 1,
  ASS = 2
}

interface SubtitleData {
  url: string;
  language: string;
  type: SubtitleType,
}

type SkipData = {
  start: number;
  end: number;
  title: string;
};

enum MediaDataType {
  HLS,
  MP4,
}

type MediaItem = {
  quality: string;
  file: string;
  type: MediaDataType;
};

type MediaPreview = {
  img: string;
  time: number;
};

export type SourceData = {
  name: string;
  url: string;
};

export type SourceList = {
  title: string;
  sources: SourceData[];
};

export default {
  name: 'VideoPlayerPage',
  data() {
    return {
      streamUrl: '',
      subtitlesUrl: '',
      posterUrl: '',
      streams: [] as MediaItem[],
      subtitles: [] as SubtitleData[],
      skips: [] as SkipData[],
      previews: [] as MediaPreview[],
      thumbnails: '',
      type: '',
      currentTime: 0,
      duration: 0,
      currentQuality: '',
      showSettings: false,
      qualities: [] as string[],
      showInterface: true,
      urlMedia: window.location.href,
      error: false,
      errorMessage: 'An error occured',
      errorDetails: '',
      SubtitleType,
    }
  },
  components: {
    VideoLayout,
    AlertCircleOutline
  },
  props: ["episodeId", "episodeTitle", "title", "episodes"],
  computed: {
    progress() {
      return this.duration ? (this.currentTime / this.duration) * 100 : 0;
    }
  },
  methods: {
    goBack() {
      this.$router.push({ name: 'infos', query: { url: localStorage.lastInfo } });
    },
    onControlsChange(event: MediaControlsChangeEvent) {
      console.log(event);
      this.showInterface = event.detail;
    },
    async loadStream() {
      if (this.streamUrl.length > 0) {
        await new Promise<void>((resolve, reject) => {
          const player = this.$refs.mediaPlayer as MediaPlayerElement;
          player.addEventListener('loadedmetadata', () => {
        resolve();
          });
          player.addEventListener('error', (error) => {
        reject(error);
          });
          player.src = this.streams.find(stream => stream.file === this.streamUrl)?.file || '';
        });
      }
    },
    onProviderChange(event: MediaProviderChangeEvent) {
      const provider = event.detail;
      if (isHLSProvider(provider)) {
        provider.config = {
          enableWebVTT: true,
        };
      }
    },
    onCanPlay(event: MediaCanPlayEvent) {
      if (event.detail) {
        const player = this.$refs.mediaPlayer as HTMLVideoElement;
        player.play();
      }
    },
    changeQuality(HLSQuality: string) {
      const player = this.$refs.mediaPlayer as HTMLVideoElement;
      this.currentQuality = HLSQuality;
      const currentTime = player.currentTime;
      this.streamUrl = this.streams.find(stream => stream.quality === HLSQuality)?.file || '';
      this.loadStream();
      player.currentTime = currentTime;
    },
    skipOpening() {
      const player = this.$refs.mediaPlayer as HTMLVideoElement;
      player.currentTime = this.skips[0].start;
    },
    togglePlay() {
      const player = this.$refs.mediaPlayer as HTMLVideoElement;
      if (player.paused) {
        player.play();
      } else {
        player.pause();
      }
    },
    toggleSettings() {
      this.showSettings = !this.showSettings;
    },
    skipBackward() {
      const player = this.$refs.mediaPlayer as HTMLVideoElement;
      player.currentTime -= 10;
    },
    skipForward() {
      const player = this.$refs.mediaPlayer as HTMLVideoElement;
      player.currentTime += 10;
    },
    toggleFullscreen() {
      const player = this.$refs.mediaPlayer as HTMLVideoElement;
      if (!document.fullscreenElement) {
        player.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    },
    seek(event: Event) {
      const player = this.$refs.mediaPlayer as HTMLVideoElement;
      const percent = (event.target as HTMLInputElement).value;
      player.currentTime = (parseFloat(percent) / 100) * this.duration;
    },
    padZero(value: number): string {
      return value.toString().padStart(2, "0");
    },
    formatTime(time: number | string): string {
      const seconds = Number(time);
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;

      const formattedHours = this.padZero(Math.floor(hours));
      const formattedMinutes = this.padZero(Math.floor(minutes));
      const formattedSeconds = this.padZero(Math.floor(remainingSeconds));

      return `${formattedHours}:${formattedMinutes}:${formattedSeconds}.000`;
    },
    updateTime() {
      const player = this.$refs.mediaPlayer as MediaPlayerElement
      console.log(player.currentTime, player.duration);
    },
    async injectInstance() {
      const store = useStore();
      const activeModule = store.state.activeModule;
      let modulePath = await window.ipcRenderer.invoke('get-module-path', activeModule.id);
      let code = modulePath.modulePath + '/code.js';
      let injectJs = await window.ipcRenderer.invoke('load-script', code);
      while (injectJs.success === false) {
        console.log(injectJs.error);
        if (injectJs.error === 'ENOENT: no such file or directory') {
          console.error('No code.js file found in module directory');
          break;
        }
        injectJs = await window.ipcRenderer.invoke('load-script', code);
      }
    },
    async executeJs(code: string) {
      let executedJs;
      try {
        executedJs = await window.ipcRenderer.invoke('execute-script', code);
      } catch (error) {
        throw new Error((error as Error).message);
      }
      return executedJs
    },
    handleError(e: unknown) {
      this.error = true;
      this.errorDetails = (e as Error).message.replace("Error invoking remote method 'execute-script':", "");
    },
    updateDiscordPresence(state: string) {
      const { episodeTitle, title } = this;
      const player = this.$refs.mediaPlayer as MediaPlayerElement;

      const presence: Presence = {
        details: episodeTitle ?? 'No episode title',
        state: `${state} ${title}`,
        largeImageKey: 'icon',
        largeImageText: 'Chouten',
        buttons: [
          { label: 'Get Chouten', url: 'https://github.com/Bilnaa/chouten-electron' },
          { label: 'Join Discord', url: 'https://discord.gg/j5ETh7uSy6' },
        ],
        instance: false,
      };

      if (state === 'Watching') {
        presence.startTimestamp = Date.now();
        presence.endTimestamp = Date.now() + (player.duration - player.currentTime) * 1000;
      }

      window.ipcRenderer.invoke('set-discord-presence', presence);
    },
    onPause() {
      this.updateDiscordPresence('Paused');
    },
    onPlay() {
      this.updateDiscordPresence('Watching');
    },
    onTimeUpdate() {
      this.updateDiscordPresence('Watching');
    },
    convertToWebVTT(data: { start: number; end: number; title: string }[]): string {
      let webVTT = "WEBVTT\n\n";

      for (let i = 0; i < data.length; i++) {
        const entry = data[i];
        const start = this.formatTime(entry?.start ?? 0);
        const end = this.formatTime(entry?.end ?? 0);

        webVTT += `${start} --> ${end}\n`;
        webVTT += `${entry?.title ?? ""}\n`;
        webVTT += "\n";
      }
      return webVTT;
    },
    async loadVideoPage() {
      this.updateDiscordPresence('Waiting to play');
      console.log(`const instance = new source.default(); return instance.streams("${this.episodeId}")`)
      let sourcesRes;
      try {
        sourcesRes = await this.executeJs(`const instance = new source.default(); return instance.sources("${this.episodeId}")`);
      } catch (error) {
        return;
      }
      let error;
      for (const result of sourcesRes.result as SourceList[]) {
        let title = result.title;
        let sources = result.sources;
        for (let x = 0; x < sources.length; x++) {
          let source = sources[x];
          console.log(source.name);
          let resStreams;
          try {
            console.log(`const instance = new source.default(); return instance.streams("${source.url}")`)
            resStreams = await this.executeJs(`const instance = new source.default(); return instance.streams("${source.url}")`);
          } catch (error) {
            error = error;
            continue;
          }
          this.streams.push(...resStreams.result.streams);
          this.qualities = this.streams.filter(stream => stream.type === 0).map(stream => stream.quality);
          this.subtitles = resStreams.result.subtitles;
          this.thumbnails = this.subtitles.find(sub => sub.language.toLowerCase() === 'thumbnails')?.url || '';
          this.subtitles = this.subtitles.filter(sub => sub.language.toLowerCase() !== 'thumbnails');
          this.skips = resStreams.result.skips;
        }
      }
      if (this.streams.length === 0) {
        this.handleError(error);
        return;
      }

      if (this.skips.length > 0) {
        const webvtt = this.convertToWebVTT(this.skips);
        const blob = new Blob([webvtt], { type: 'text/vtt' });
        const url = URL.createObjectURL(blob);
        (this.$refs.mediaPlayer as MediaPlayerElement).textTracks.add({
          src: url,
          label: 'Chapters',
          kind: 'chapters',
          default: true,
        });
      }

      this.streamUrl = this.streams.find(stream => stream.quality === 'auto' || stream.quality === 'default')?.file || this.streams[0].file;
      this.currentQuality = this.streams.find(stream => stream.quality === 'auto' || stream.quality === 'default')?.quality || this.streams[0].quality;
      this.loadStream();
      if ((this.streams[0].type === MediaDataType.HLS) && Hls.isSupported()) {
        this.type = 'application/x-mpegURL';
        var hls = new Hls();
        hls.loadSource(this.streamUrl);
        hls.attachMedia(this.$refs.mediaPlayer as HTMLVideoElement);
        (this.$refs.mediaPlayer as MediaPlayerElement).src = this.streamUrl;
      } else {
        this.type = 'video/mp4';
      }

      const player = this.$refs.mediaPlayer as MediaPlayerElement;
      player.addEventListener('timeupdate', this.onTimeUpdate);
      player.addEventListener('seeking', this.onTimeUpdate);
      player.addEventListener('play', this.onPlay);
      player.addEventListener('pause', this.onPause);

    }
  },
  setup(props, ctx) {
      console.log('props', props);
  },
  async mounted() {
    await this.loadVideoPage();
  },
  beforeUnmount() {
    const player = this.$refs.mediaPlayer as MediaPlayerElement;
    if (player) {
      player.removeEventListener('timeupdate', this.onTimeUpdate);
      player.removeEventListener('seeking', this.onTimeUpdate);
      player.removeEventListener('play', this.onPlay);
      player.removeEventListener('pause', this.onPause);
      player.destroy();
    }
  },
  unmounted() {
    this.updateDiscordPresence('Leaving');
  },
  watch: {
    '$route.query.episodeId': async function () {
      // Reset the player
      const player = this.$refs.mediaPlayer as MediaPlayerElement;
      player.currentTime = 0;
      player.pause();
      player.src = '';
      // player.textTracks.forEach(track => {
      //   track.mode = 'disabled';
      // });
      this.streams = [];
      this.subtitles = [];
      this.skips = [];
      this.previews = [];
      this.thumbnails = '';
      this.qualities = [];
      this.streamUrl = '';
      this.currentQuality = '';
      this.showSettings = false;
      this.error = false;
      this.errorMessage = 'An error occured';
      this.errorDetails = '';
      await this.loadVideoPage();
      await this.loadStream();

    }
  }
}
</script>

<style scoped>
[data-media-player]:not([data-view-type='audio']) [data-media-provider],
[data-media-player][data-fullscreen] [data-media-provider] {
  height: 100vh !important;
}

.title-bar {
  background: rgba(0, 0, 0, 0.5);
}

.top-bar {
  margin: 30px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 10px;
  z-index: 100;
}

.bottombar {
  position: absolute;
  bottom: 88px;
  left: 0;
  right: 0;
  padding: 20px;
  color: white;
  transition: opacity 0.5s;
  text-shadow: 2px 2px 4px #000000;
}

.title {
  font-size: 16px;
  margin-bottom: 5px;
  color: #D4D4D4;
}

.episodeTitle {
  font-size: 24px;
  font-weight: bold;
}

.fullscreen-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9998;
  /* Ensure it's on top of everything */
  background-color: black;
  /* To cover any potential gaps */
  border-radius: 10px;
}

.video-player-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 20px;
}

.back {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  z-index: 10;
}

.seek-buttons {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 30px;
  z-index: 10;
}

.back,
.quality {
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
}

.skip-backward :deep(svg),
.skip-forward :deep(svg),
.back :deep(svg),
.quality :deep(svg) {
  width: 26px;
  height: 28px;
}

.skip-button {
  position: absolute;
  bottom: 60px;
  right: 20px;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.title {
  position: absolute;
  bottom: 60px;
  left: 20px;
  font-size: 18px;
  font-weight: bold;
}

.player {
  aspect-ratio: 16 /9;
  background-color: #212121;
  border-radius: var(--media-border-radius);
  color: #f5f5f5;
  contain: layout;
  font-family: sans-serif;
  overflow: hidden;
}

.player[data-focus]:not([data-playing]) {
  box-shadow: var(--media-focus-ring);
}

.player :deep(video),
.poster {
  border-radius: var(--media-border-radius);
}

.poster {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
}

.poster :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.poster[data-visible] {
  opacity: 1;
}

.quality-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: rgba(28, 28, 28, 0.9);
  border-radius: 8px;
  padding: 10px;
  display: none;
  flex-direction: column;
  min-width: 120px;
}

.quality:hover .quality-dropdown,
.quality:focus .quality-dropdown {
  display: flex;
}

.quality-dropdown button {
  background: none;
  border: none;
  color: white;
  padding: 8px 16px;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
}

.quality-dropdown button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* Error message styles */
.error-message {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9998;
  background-color: black;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: white;
  padding: 20px;
  box-sizing: border-box;
}

.error-message .icon {
  font-size: 48px;
  color: #5c5cff;
  margin-bottom: 20px;
}

.error-message .error-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.error-message .error-details {
  font-size: 16px;
  text-align: center;
  margin-bottom: 20px;
}

.error-message .back-button {
  background-color: #5c5cff;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.error-message .back-button:hover {
  background-color: #4a4aff;
}

.error-message .back-button:active {
  background-color: #3939ff;
}
</style>