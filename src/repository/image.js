import Dexie from "dexie";
import { loadBlob } from "@/models/image.js";

const db = new Dexie("mydb");

// https://dexie.org/docs/API-Reference
db.version(1).stores({
  images:
    "++id, &name, size, type, lastModifiedDate, blob, annotations, createdAt",
});

export async function queryImages() {
  const images = await db.images.toArray();

  return images.map((it) => ({
    ...it,
    src: URL.createObjectURL(it.blob),
  }));
}

export async function addImage(file) {
  const data = {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModifiedDate: file.lastModifiedDate,
    blob: await loadBlob(file),
    annotations: [],
  };

  try {
    const id = await db.images.add(data);
    return {
      id,
      ...data,
      src: URL.createObjectURL(data.blob),
    };
  } catch (err) {
    if (isConstraintError(err)) {
      return null;
    } else {
      throw err;
    }
  }
}

export async function deleteImage(...ids) {
  await db.images.bulkDelete(ids);
}

function isConstraintError(error) {
  return error.name === "ConstraintError";
}
