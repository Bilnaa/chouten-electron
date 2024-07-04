<template>
  <div class="text-item">
    <div class="image-placeholder">
      <img src="/mountains.svg" alt="Placeholder" class="placeholder-image">
      <span class="text-label">Text</span>
    </div>
    <div class="text-content">
      <h3 class="title">{{ title }}</h3>
      <span class="index">{{ index }}/12</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TextItem',
  props: {
    title: String,
    index: Number
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