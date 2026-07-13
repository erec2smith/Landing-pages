import { ImageSource } from "./types.js";

type ImageLoadedCallback = (image: ImageSource) => void;

function readFileAsImage(file: File): Promise<ImageSource> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Selected file is not an image"));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Failed to decode image"));
      image.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function setupDragAndDrop(
  dropzone: HTMLElement,
  fileInput: HTMLInputElement,
  onImageLoaded: ImageLoadedCallback
): void {
  dropzone.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    if (file) {
      readFileAsImage(file).then(onImageLoaded).catch((error) => console.error(error));
    }
  });

  dropzone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropzone.classList.add("drag-over");
  });

  dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("drag-over");
  });

  dropzone.addEventListener("drop", (event) => {
    event.preventDefault();
    dropzone.classList.remove("drag-over");

    const file = event.dataTransfer?.files?.[0];
    if (file) {
      readFileAsImage(file).then(onImageLoaded).catch((error) => console.error(error));
    }
  });
}
