<template>
  <h1>Image Annotator</h1>
  <input type="file" accept="image/*" multiple @change="handleFile" />

  <main>
    <FileList ref="files" @select="handleSelect" />

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
      <div v-for="(an, i) in selected.annotations" :key="an">
        <div @mousemove="handleHighlightAnnotation(i)">
          {{ an }} <button @click="handleDeleteAnnotation">Delete</button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import CanvasAnnotator from "@/components/CanvasAnnotator.vue";
import FileList from "@/components/FileList.vue";
import { addImage, putImage } from "@/repository/image";
import { resizeImage } from "@/models/image";
import { ref, useTemplateRef, watch } from "vue";

const fileList = useTemplateRef("files");
const canvas = useTemplateRef("canvas");
const selected = ref(null);
const dimensions = ref({ width: 0, height: 0 });
const selectedAnnotation = ref(null);

watch(selectedAnnotation, (index) => {
  const ctx = canvas.value.getContext("2d");
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
  selected.value.annotations.forEach((rect, i) => {
    drawRect(rect, i === index ? "blue" : "red");
  });
});

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

  fileList.value.reload();
}

async function handleDraw(rect) {
  const file = selected.value;
  file.annotations = file.annotations || [];
  file.annotations.push(rect);
  await putImage(file);

  drawRect(rect);
}

function drawRect({ x, y, width, height }, color = "blue") {
  const ctx = canvas.value.getContext("2d");
  ctx.lineWidth = 2;
  ctx.strokeStyle = color;
  ctx.strokeRect(x, y, width, height);
}

function handleDeleteAnnotation() {}

function handleHighlightAnnotation(i) {
  selectedAnnotation.value = i;
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
