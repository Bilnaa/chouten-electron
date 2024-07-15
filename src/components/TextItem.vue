<template>
  <router-link class="text-item" :to="'/infos?url='+url">
    <div class="image-placeholder">
      <img :src="poster" :alt="titles.primary" class="placeholder-image">
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

.image-placeholder {
  width: 100%;
  background-color: #2a2a2a;
  position: relative;
}

.placeholder-image {
  width: 100%;
  display: block;
}

.text-label {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #333;
  color: #fff;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.text-content {
  padding: 10px;
}

.title {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #fff;
}

.index {
  font-size: 12px;
  color: #666;
}
</style>