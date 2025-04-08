export async function loadImage(file) {
  const reader = new FileReader();
  return new Promise((resolve) => {
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export async function loadBlob(file) {
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
