<template>
  <h1>Image Annotator</h1>
  <input type="file" accept="image/*" multiple @change="handleFile" />

  <div v-for="image in images" :key="image.id">{{ image.name }}</div>

  <main>
    <div class="img-list">
      <button v-if="files.length" @click="handleClear">Clear all</button>
      <div
        class="img-list-item"
        v-for="(file, i) in files"
        :key="file.name"
        :class="{ selected: selected === i }"
      >
        <img :src="srcs[i]" />
        <span @click="handleSelect(i)">{{ file.name }}</span>
        <button @click="handleDelete(i)">Delete</button>
      </div>
    </div>

    <div v-if="selected !== null">
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
        <img :src="srcs[selected]" />
      </div>
      <p>{{ files[selected].name }}</p>
      <p>{{ files[selected].size }} bytes</p>
      <p>{{ files[selected].type }}</p>
      <p>{{ files[selected].lastModifiedDate }}</p>
    </div>
  </main>
</template>

<script setup>
import HelloWorld from "./components/HelloWorld.vue";
import { ref, useTemplateRef, onMounted } from "vue";
import Dexie from "dexie";

const dbs = ref(null);

onMounted(() => {
  const db = new Dexie("mydb");
  db.version(1).stores({
    images: "++id, name, size, type, lastModifiedDate, blob, annotations",
  });
  dbs.value = db;

  dbs.value.images.toArray().then((images) => {
    images.value = images;
    console.log(images);
  });
});

const canvas = useTemplateRef("canvas");
const files = ref([]);
const srcs = ref([]);
const cache = ref({});
const selected = ref(null);
const dimensions = ref({ width: 0, height: 0 });
const images = ref(null);

async function handleFile(evt) {
  const newFiles = [];
  for (let file of evt.target.files) {
    if (cache.value[file.name]) {
      continue;
    }
    cache.value[file.name] = true;
    newFiles.push(file);
  }
  newFiles.sort((a, b) => a.name < b.name);
  for await (const file of newFiles) {
    const src = await loadImage(file);
    const blob = await loadBlob(file);
    await dbs.value.images.add({
      name: file.name,
      size: file.size,
      type: file.type,
      lastModifiedDate: file.lastModifiedDate,
      blob: blob,
      annotations: [],
    });
    srcs.value.push(src);
  }

  files.value = files.value.concat(newFiles);
}

function handleSelect(i) {
  selected.value = i;

  const image = new Image();
  image.onload = () => {
    dimensions.value = {
      width: image.width,
      height: image.height,
    };
  };
  image.src = srcs.value[i];
}

function handleClear() {
  files.value = [];
  srcs.value = [];
  cache.value = {};
  selected.value = null;
}

function handleDelete(selectedIndex) {
  const newFiles = [];
  const newSrcs = [];
  for (let i = 0; i < files.value.length; i++) {
    if (i !== selectedIndex) {
      newFiles.push(files.value[i]);
      newSrcs.push(srcs.value[i]);
    }
  }
  files.value = newFiles;
  srcs.value = newSrcs;
  selected.value = null;
}

async function loadImage(file) {
  const reader = new FileReader();
  return new Promise((resolve) => {
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

async function loadBlob(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const blob = new Blob([new Uint8Array(e.target.result)], {
        type: file.type,
      });
      resolve(blob);
    };
    reader.readAsArrayBuffer(file);
  });
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
