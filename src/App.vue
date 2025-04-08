<template>
  <h1>Image Annotator</h1>
  <input type="file" accept="image/*" multiple @change="handleFile" />

  <main>
    <div class="img-list">
      <button v-if="images.length" @click="handleClear">Clear all</button>
      <div
        class="img-list-item"
        v-for="image in images"
        :key="image.name"
        :class="{ selected: selected === image.id }"
        @click="handleSelect(image)"
      >
        <img :src="image.src" />
        <span>{{ image.name }}</span>
        <button @click="handleDelete(image)">Delete</button>
      </div>
    </div>

    <div v-if="selectedImage">
      <h3>Selected Image</h3>
      <div
        class="canvas"
        style="width: {{ dimensions.width }}px; height: {{ dimensions.height }}px;"
      >
        <canvas
          ref="canvas"
          :width="dimensions.width"
          :height="dimensions.height"
        >
        </canvas>
        <HelloWorld
          :width="dimensions.width"
          :height="dimensions.height"
          @change="handleCanvas"
        />
        <img
          :src="selectedImage.src"
          :width="dimensions.width"
          :height="dimensions.height"
        />
      </div>
      <p>{{ dimensions }}</p>
      <p>{{ selectedImage.name }}</p>
      <p>{{ selectedImage.size }} bytes</p>
      <p>{{ selectedImage.type }}</p>
      <p>{{ selectedImage.lastModifiedDate }}</p>
    </div>
  </main>
</template>

<script setup>
import HelloWorld from "@/components/HelloWorld.vue";
import { ref, computed, useTemplateRef, onMounted } from "vue";
import { queryImages, deleteImage, addImage } from "@/repository/image";
import { resizeImage } from "@/models/image";

const canvas = useTemplateRef("canvas");
const selected = ref(null);
const dimensions = ref({ width: 0, height: 0 });
const images = ref([]);

onMounted(async () => {
  images.value = await queryImages();
});

const selectedImage = computed(() => {
  const id = selected.value;
  if (id == null) {
    return null;
  }

  return images.value.find((image) => image.id === id);
});

async function handleFile(evt) {
  const files = Array.from(evt.target.files);
  files.sort((a, b) => a.name < b.name);
  for await (const file of files) {
    // Automatically skips duplicate files.
    await addImage(file);
  }

  images.value = await queryImages();
}

function handleSelect(image) {
  selected.value = image.id;

  const img = new Image();
  img.onload = () => {
    const { width, height } = resizeImage(img);
    dimensions.value = {
      width,
      height,
    };
  };
  img.src = image.src;
}

function handleClear() {
  selected.value = null;
}

async function handleDelete(image) {
  // Clear selection.
  if (selected.value === image.id) {
    selected.value = null;
  }

  // Delete image.
  await deleteImage(image.id);

  // Refresh image list.
  images.value = await queryImages();
}

function handleCanvas({ x, y, width, height }) {
  const ctx = canvas.value.getContext("2d");
  ctx.lineWidth = 2;
  ctx.strokeStyle = "blue";
  ctx.strokeRect(x, y, width, height);
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

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

.canvas {
  position: relative;
  canvas {
    position: absolute;
  }
}

main {
  display: flex;
  gap: 10px;
}
</style>
