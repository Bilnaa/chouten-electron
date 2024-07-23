<template>

  <div class="card">
    <button class="add-button" @click="showToast('Not Implemented', 'This feature is not implemented yet', 'Info', 3000)">+</button>
    <router-link :to="'/infos?url='+url">
      <div class="card-content">
      <img :src="poster" alt="poster" />
      <div class="overlay">
        <div class="infos">
          <p class="secondary">{{ titles?.secondary }}</p>
      <div class="primary-row">
        <h2 class="primary">{{ titles?.primary }}</h2>
        <div class="card-footer">
          <span>{{ indicator }}</span>
          <span class="heart">❤️</span>
        </div>
      </div>
      <p class="description">{{ description }}</p>
        </div>
      </div>
    </div>
    
    </router-link>

  </div>

</template>

<script lang="ts">
import {inject, onMounted} from 'vue';

export default {
  name: 'Card',
  props: {
    url: String,
    poster: String,
    titles: Object,
    indicator: String,
    description: String
  },
  setup(props) {
    const showToast = inject('showToast') as (title: string, message: string, icon?: string, duration?: number) => void;

    let truncatedDescription = (props.description ?? '').length > 100 ? (props.description ?? '').slice(0, 150) + '...' : (props.description ?? '');
    truncatedDescription = truncatedDescription.replace(/<[^>]*>?/gm, '');

    const truncatedTitles = {
      primary: (props.titles?.primary ?? '').length > 20 ? (props.titles?.primary ?? '').slice(0, 20) + '...' : (props.titles?.primary ?? ''),
      secondary: (props.titles?.secondary ?? '').length > 20 ? (props.titles?.secondary ?? '').slice(0, 20) + '...' : (props.titles?.secondary ?? '')
    }
    return {
      showToast,
      description: truncatedDescription,
      titles: truncatedTitles
    }
  }
}
</script>

<style scoped>
.card {
  position: relative;
  width: 300px; /* Adjust as needed */
  height: 400px; /* Adjust as needed */
  border-radius: 20px;
  overflow: hidden;
  background-color: #1e1e1e;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  transition: transform 0.3s ease;
}

.card:hover {
  transform: scale(1.05);
}

.card img {
  width: 100%;
  height: 70%; /* Adjust this to control image height */
  object-fit: cover;
}

.overlay {
  position: absolute;
    top: 0;
    bottom: 29px;
    right: 0px;
    left: -13px;
    width: 100%;
    height: 100%;
    display: flex;
    background-color: rgba(0, 0, 0, 0.5);
    flex-direction: column;
    justify-content: flex-end;
    padding: 10px;
}

.infos {
  position: absolute;
    top: 263px;
    margin: 10px;
}
.card-content {
   position: relative;
    right: 0;
    height: 146%;
    background: rgba(0, 0, 0, 0.5);
    color: #fff;
    display: flex;
    flex-direction: column;
}

.secondary {
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 2px;
}

.primary-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 5px;
}

.primary {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
  flex-grow: 1;
}

.card-footer {
  display: flex;
  align-items: center;
  font-size: 12px;
}

.heart {
  color: #ff0000;
  margin-left: 5px;
}

.description {
  font-size: 12px;
  line-height: 1.3;
  opacity: 0.9;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  flex-grow: 1;
}

.add-button {
  z-index: 1;
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(0,0,0,0.5);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-button:hover {
  background-color: rgba(0,0,0,0.8);
}
</style>