# vue-image-annotator

## Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production

```
npm run build
```

### Lints and fixes files

```
npm run lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

## Tips

```js
import { defineEmits, defineProps, ref, useTemplateRef } from "vue";

const emit = defineEmits(['change'])
emit('change', { name: 'test' })

defineProps({
  msg: {
    type: String,
    default: "hi",
  },
});

const canvas = useTemplateRef("canvas");
canvas.value = ...

const start = ref({ x: 0, y: 0 });
start.value.x = 0;
start.value = { x: 0, y: 0 };
```
