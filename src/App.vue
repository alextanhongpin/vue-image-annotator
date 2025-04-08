<template>
  <h1>Image Annotator</h1>
  <input type="file" accept="image/*" multiple @change="handleFile" />

  <main>
    <FileList @select="handleSelect" />

    <div v-if="selected">
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
        <CanvasAnnotator
          :width="dimensions.width"
          :height="dimensions.height"
          @change="handleDraw"
        />
        <img
          :src="selected.src"
          :width="dimensions.width"
          :height="dimensions.height"
        />
      </div>
      <p>{{ dimensions }}</p>
      <p>{{ selected.name }}</p>
      <p>{{ selected.src }}</p>
      <p>{{ selected.size }} bytes</p>
      <p>{{ selected.type }}</p>
      <p>{{ selected.lastModifiedDate }}</p>
    </div>
  </main>
</template>

<script setup>
import CanvasAnnotator from "@/components/CanvasAnnotator.vue";
import FileList from "@/components/FileList.vue";
import { addImage, putImage } from "@/repository/image";
import { resizeImage } from "@/models/image";
import { ref, useTemplateRef } from "vue";

const canvas = useTemplateRef("canvas");
const selected = ref(null);
const dimensions = ref({ width: 0, height: 0 });

function handleSelect(img) {
  selected.value = img;

  const image = new Image();
  image.onload = () => {
    const { width, height } = resizeImage(image);
    dimensions.value.width = width;
    dimensions.value.height = height;
  };
  image.src = img.src;

  // Doesn't render immediately
  setTimeout(() => {
    img.annotations.forEach(drawRect);
  }, 5);
}

async function handleFile(evt) {
  const files = Array.from(evt.target.files);
  files.sort((a, b) => a.name < b.name);
  for await (const file of files) {
    // Automatically skips duplicate files.
    await addImage(file);
  }

  // TODO: Fetch images
}

async function handleDraw(rect) {
  const file = selected.value;
  file.annotations = file.annotations || [];
  file.annotations.push(rect);
  await putImage(file);

  drawRect(rect);
}

function drawRect({ x, y, width, height }) {
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
