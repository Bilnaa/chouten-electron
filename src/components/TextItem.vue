<template>
  <router-link class="text-item" :to="'/infos?url='+url">
    <div class="image-container">
      <img :src="poster" :alt="titles.primary" class="cover">
      <span class="text-label">{{ indicator }}</span>
    </div>
    <div class="text-content">
      <h3 class="title">{{ titles.primary }}</h3>
      <span class="index">{{ current ? current + '/' : '??/'}}{{ total ? total : '??' }}</span>
    </div>
  </router-link>
</template>

<script>
export default {
  name: 'TextItem',
  props: {
    url: String,
    poster: String,
    titles: Object,
    indicator: String,
    current: Number,
    total: Number
  }
}
</script>


<style scoped>
.text-item {
  width: 160px;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.image-container {
  width: 100%;
  height: 240px; /* Fixed height for all images */
  position: relative;
  overflow: hidden;
}

.cover {
  width: 100%;
  height: 100%;
  object-fit: cover; /* This will maintain aspect ratio and cover the container */
  object-position: center; /* Center the image within the container */
  border-radius: 12px;
}

.text-label {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(51, 51, 51, 0.8);
  color: #fff;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.text-content {
  padding: 10px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.title {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.index {
  font-size: 12px;
  color: #666;
}
</style>