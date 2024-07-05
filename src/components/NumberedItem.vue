<template>
   <router-link class="numbered-item" to="/infos">
    <div class="content">
      <div class="image-placeholder">
        <img src="/mountains.svg" alt="Placeholder" class="placeholder-image">
      </div>
      <div class="text-content">
        <span class="title">Title</span>
        <span class="count">{{ number }}/12</span> 
      </div>
    </div>
    <span class="number">{{ number }}</span>
  </router-link>
  
</template>

<script>
export default {
  name: 'NumberedItem',
  props: {
    title: String,
    number: Number
  }
}
</script>

<style scoped>


.numbered-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #1e1e1e;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  max-width: 34vw;
}

.image-placeholder {
  width: 50px;
  height: 50px;
  background-color: #333;
  border-radius: 4px;
  margin-right: 10px;
  flex-shrink: 0;
}

.placeholder-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.content {
  display: flex;
  flex-direction: row;
}

.text-content {
  display: flex;
  flex-direction: column;
  justify-content: center
}

.title {
  font-size: 14px;
  color: #ffffff;
  opacity: 0.7;
}

.count {
  font-size: 12px;
  color: #ffffff;
  opacity: 0.5;
}

.number {
  font-size: 24px;
  font-weight: bold;
  color: #ffffff;
  margin-left: auto;
}
</style>