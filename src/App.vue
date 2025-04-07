<template>
  <h1>Image Annotator</h1>
  <HelloWorld msg="Welcome" @change="handleCanvas" />
  <input type="file" accept="image/*" multiple @change="handleFile" />

  <button v-if="files.length" @click="handleClear">Clear all</button>

  <div
    class="img-item"
    v-for="(file, i) in files"
    :key="file.name"
    :class="{ selected: selected === i }"
  >
    <img :src="srcs[i]" />
    <span @click="handleSelect(i)">{{ file.name }}</span>
    <button @click="handleDelete(i)">Delete</button>
  </div>

  <div v-if="selected !== null">
    <h3>Selected Image</h3>
    <img :src="srcs[selected]" />
    <p>{{ files[selected].name }}</p>
    <p>{{ files[selected].size }} bytes</p>
    <p>{{ files[selected].type }}</p>
    <p>{{ files[selected].lastModifiedDate }}</p>
  </div>
</template>

<script setup>
import HelloWorld from "./components/HelloWorld.vue";
import { ref } from "vue";

const files = ref([]);
const srcs = ref([]);
const cache = ref({});
const selected = ref(null);

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
    srcs.value.push(src);
  }

  files.value = files.value.concat(newFiles);
}

function handleSelect(i) {
  selected.value = i;
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

function handleCanvas(rect) {
  console.log(rect);
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.img-item {
  cursor: pointer;
  display: flex;
  align-items: center;
  grid-gap: 10px;
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
