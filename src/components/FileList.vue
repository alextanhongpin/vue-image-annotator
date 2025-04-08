<template>
  <div class="img-list">
    <button v-if="images.length" @click="handleClear">Clear all</button>
    <div
      class="img-list-item"
      v-for="img in images"
      :key="img.name"
      :class="{ selected: selected === img.id }"
      @click="handleSelect(img)"
    >
      <img :src="img.src" />
      <span>{{ img.name }}</span>
      <button @click="handleDelete(img)">Delete</button>
    </div>
  </div>
</template>

<script setup>
import { queryImages, deleteImage } from "@/repository/image";
import { ref, defineEmits, onMounted } from "vue";

const emit = defineEmits(["select"]);

const selected = ref(null);
const images = ref([]);

onMounted(async () => {
  images.value = await queryImages();
});

function handleSelect(img) {
  selected.value = img.id;
  emit("select", img);
}

async function handleDelete(img) {
  await deleteImage(img.id);

  // Refresh image list.
  images.value = await queryImages();
}
</script>

<style>
.img-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 320px;
}
.img-list-item {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  &:hover {
    background: #eee;
  }

  &.selected {
    background: #ddd;
  }

  img {
    max-width: 100px;
    max-height: 100px;
    border: 1px solid #ccc;
  }
}
</style>
