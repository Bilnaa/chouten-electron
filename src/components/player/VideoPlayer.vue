<template>
  <div class="fullscreen-container">
    <div class="video-player-container">
      <media-player ref="mediaPlayer" viewType="video" streamType="on-demand" logLevel="warn" :crossOrigin="true"
        :playsInline="true" :title="`${episodeTitle} - ${title}`" @provider-change="onProviderChange" :type="type" canAirPlay canChromecast @controls-change="onControlsChange"
        storage="local"
        @canPlay="onCanPlay" x-webkit-airplay="allow">
        <media-provider>
          <div class="top-bar" :style="{visibility: showInterface ? 'visible' : 'hidden'}">
            <button class="back" @click="$router.back()">
              <media-icon type="arrow-left" />
            </button>
            <button class="quality">
              <media-icon type="menu-vertical" />
              <div class="quality-dropdown">
                <button v-for="quality in qualities" @click="changeQuality(quality)">{{ quality }}</button>
              </div>
            </button>
          </div>
          <div class="bottombar" :style="{visibility: showInterface ? 'visible' : 'hidden'}">
            <div class="episodeTitle">
              {{ title }}
            </div>
            <div class="title">
              {{ episodeTitle  }}
            </div>
          </div>
          <media-poster :src="posterUrl" default="" class="vds-poster" />
          <source :src="streamUrl" />
          <track v-for="subtitle in subtitles" :src="subtitle.url" :srclang="subtitle.language" :kind="'subtitles'" :label="subtitle.language" />
        </media-provider>
        <VideoLayout :thumbnails="thumbnails"/>
      </media-player>
    </div>
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
import type { TextTrackInit } from 'vidstack';
import VideoLayout from './layouts/VideoLayout.vue';

import { MediaPlayer, isHLSProvider, type MediaCanPlayEvent, type MediaProviderChangeEvent, type MediaControlsChangeEvent,
} from 'vidstack';
import { ref, VideoHTMLAttributes } from 'vue';


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
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      currentQuality: '',
      showSettings : false,
      qualities : [] as string[],
      tracks : [] as TextTrackInit[],
      showInterface : true
    }
  },
  components: {
    VideoLayout
  },
  props: ["episodeId", "episodeTitle", "title"],
  computed: {
    progress() {
      return this.duration ? (this.currentTime / this.duration) * 100 : 0;
    }
  },
  methods: {
    onControlsChange(event: MediaControlsChangeEvent) {
      console.log(event);
      this.showInterface = event.detail;
    },
    loadStream() {
      if (this.streamUrl.length > 0) {
        (this.$refs.mediaPlayer as MediaPlayerElement).src = this.streams.find(stream => stream.file === this.streamUrl)?.file || '';
      }
    },
    loadSubtitles() {
      const player = this.$refs.mediaPlayer as MediaPlayerElement;
      const textTracks = player.textTracks;
      for (let i = 0; i < this.tracks.length; i++) {
        console.log(this.tracks[i]);
        textTracks.add(this.tracks[i]);
      }
      console.log(textTracks);
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
      this.isPlaying = !player.paused;
    },
    toggleSettings (){
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
    formatTime(time: number) {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },
    updateTime() {
      const player = this.$refs.mediaPlayer as HTMLVideoElement;
      this.currentTime = player.currentTime;
      this.duration = player.duration;
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
      try {
        let executedJs = await window.ipcRenderer.invoke('execute-script', code);
        if (executedJs.success) {
          return executedJs
        }
      } catch (error) {
        console.error(error);
      }
    }
  },
  async mounted() {
    await this.injectInstance();
    const sourcesRes = await this.executeJs(`const instance = new source.default(); return instance.streams("${this.episodeId}")`);
    if (sourcesRes && sourcesRes.success === true) {
      let res = sourcesRes.result;
      this.streams = res.streams;
      console.log(this.streams);
      this.qualities = this.streams.filter(stream => stream.type === 0).map(stream => stream.quality);
      this.subtitles = res.subtitles;
      this.skips = res.skips;
      this.previews = res.previews;
    } else {
      console.error(sourcesRes.error);
    }
    this.streamUrl = this.streams.find(stream => stream.quality === 'default')?.file || '';
    this.currentQuality = 'default';
      const tracks: TextTrackInit[] = [];
      for(let subs = 0; subs < this.subtitles.length; subs++) {
        if (subs === 0) {
          tracks.push({
            src: this.subtitles[subs].url,
            label: this.subtitles[subs].language,
            kind: 'subtitles',
            default: true
          });
        } else {
          tracks.push({
            src: this.subtitles[subs].url,
            label: this.subtitles[subs].language,
            kind: 'subtitles'
          });
        }
      }
    this.tracks = tracks;
    this.loadStream();
    this.loadSubtitles();
    if ((this.streams[0].type === MediaDataType.HLS) && Hls.isSupported() || (this.$refs.mediaPlayer as HTMLVideoElement).canPlayType('application/vnd.apple.mpegurl')) {
      this.type = 'application/x-mpegURL';
      var hls = new Hls();
      hls.loadSource(this.streamUrl);
      hls.attachMedia(this.$refs.mediaPlayer as HTMLVideoElement);
      (this.$refs.mediaPlayer as MediaPlayerElement).src = this.streamUrl;
    } else {
      this.type = 'video/mp4';
    }
    console.log(this.type);
    const player = this.$refs.mediaPlayer as MediaPlayerElement;
    player.addEventListener('timeupdate', this.updateTime);
    player.addEventListener('play', () => this.isPlaying = true);
    player.addEventListener('pause', () => this.isPlaying = false);
  },
  beforeUnmount() {
    (this.$refs.mediaPlayer as MediaPlayerElement).destroy();
  }
}
</script>

<style scoped>
[data-media-player]:not([data-view-type='audio']) [data-media-provider], [data-media-player][data-fullscreen] [data-media-provider] {
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
    z-index: 100;
    transition: opacity 0.5s;
}

.title{
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
  z-index: 9998; /* Ensure it's on top of everything */
  background-color: black; /* To cover any potential gaps */
}

.video-player-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
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

.back, .quality {
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
.skip-forward :deep(svg), .back :deep(svg),.quality :deep(svg) {
  width: 26px;
  height: 28px;
}

.skip-button{
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

</style>