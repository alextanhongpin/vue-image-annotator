<template>
  <div class="img-list">
    <button @click="handleFilter(0)">Not Annotated</button>
    <button @click="handleFilter(1)">Annotated</button>
    <button @click="handleFilter(-1)">All</button>
    <button v-if="filteredImages.length" @click="handleClear">Clear all</button>
    <div
      class="img-list-item"
      v-for="img in filteredImages"
      :key="img.name"
      :class="{ selected: selected === img.id }"
      @click="handleSelect(img)"
    >
      <img :src="img.src" />
      <span>{{ img.name }}</span>
      <div v-if="img.annotations.length">Annotated</div>
      <button @click="handleDelete(img)">Delete</button>
    </div>
  </div>
</template>

<script setup>
import { queryImages, deleteImage } from "@/repository/image";
import { ref, defineExpose, defineEmits, onMounted, computed } from "vue";

const emit = defineEmits(["select"]);

const selected = ref(null);
const images = ref([]);
const annotated = ref(-1);

const filteredImages = computed(() => {
  switch (annotated.value) {
    case 0:
      return images.value.filter((img) => !img.annotations.length);
    case -1:
      return images.value;
    default:
      return images.value.filter((img) => img.annotations.length);
  }
});

onMounted(reload);

function handleFilter(value) {
  annotated.value = value;
}

async function reload() {
  images.value = await queryImages();
}

function handleSelect(img) {
  selected.value = img.id;
  emit("select", img);
}

async function handleDelete(img) {
  await deleteImage(img.id);
  await reload();
}

// Allow parent to call child component's ref method.
defineExpose({
  reload,
});
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
