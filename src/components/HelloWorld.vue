<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <canvas
      ref="canvas"
      @mousemove="handleMousemove"
      @mouseup="handleMouseup"
      @mousedown="handleMousedown"
    ></canvas>
  </div>
</template>

<script setup>
import { defineEmits, defineProps, ref, useTemplateRef } from "vue";
const emit = defineEmits(["change"]);

defineProps({
  msg: {
    type: String,
    default: "hi",
  },
});

const canvas = useTemplateRef("canvas");
const isDrawing = ref(false);
const start = ref({ x: 0, y: 0 });

function handleMousedown(evt) {
  isDrawing.value = true;
  start.value = getPosition(evt);
}

function handleMousemove(evt) {
  const ctx = canvas.value.getContext("2d");
  const end = getPosition(evt);
  clear(ctx);
  drawGuideLines(ctx, end);
  if (!isDrawing.value) {
    return;
  }
  drawRect(ctx, computeRect(start.value, end));
}

function handleMouseup(evt) {
  isDrawing.value = false;
  const end = getPosition(evt);
  const rect = computeRect(start.value, end);
  if (isValidRect(rect)) {
    emit("change", rect);
  }
}

function clear(ctx) {
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
}

function drawGuideLines(ctx, { x, y }) {
  ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
  ctx.lineWidth = 1;

  // Vertical line
  ctx.beginPath();
  ctx.moveTo(x, 0);
  ctx.lineTo(x, canvas.value.height);
  ctx.stroke();

  // Horizontal line
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(canvas.value.width, y);
  ctx.stroke();
}

function isValidRect({ x, y, width, height }) {
  return x >= 0 && y >= 0 && width > 10 && height > 10;
}

function computeRect(p1, p2) {
  const x = Math.min(p1.x, p2.x);
  const y = Math.min(p1.y, p2.y);
  const width = Math.abs(p1.x - p2.x);
  const height = Math.abs(p1.y - p2.y);

  return { x, y, width, height };
}

function drawRect(ctx, { x, y, width, height }) {
  ctx.strokeStyle = "blue";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);
}

function getPosition(evt) {
  const rect = canvas.value.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top,
  };
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
