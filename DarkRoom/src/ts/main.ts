import { ImageEditor } from "./canvasEditor.js";
import { setupDragAndDrop } from "./dragDrop.js";
import { downloadCanvasAsImage } from "./download.js";
import { FilterState } from "./types.js";

function queryElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Element with id "${id}" was not found`);
  }
  return element as T;
}

const dropzone = queryElement<HTMLDivElement>("dropzone");
const fileInput = queryElement<HTMLInputElement>("file-input");
const canvasWrap = queryElement<HTMLDivElement>("canvas-wrap");
const canvas = queryElement<HTMLCanvasElement>("canvas");

const resetBtn = queryElement<HTMLButtonElement>("reset-btn");
const saveBtn = queryElement<HTMLButtonElement>("save-btn");

const brightnessInput = queryElement<HTMLInputElement>("brightness");
const contrastInput = queryElement<HTMLInputElement>("contrast");
const saturationInput = queryElement<HTMLInputElement>("saturation");
const blurInput = queryElement<HTMLInputElement>("blur");
const hueInput = queryElement<HTMLInputElement>("hue");
const sepiaInput = queryElement<HTMLInputElement>("sepia");

const grayscaleToggle = queryElement<HTMLButtonElement>("grayscale-toggle");
const invertToggle = queryElement<HTMLButtonElement>("invert-toggle");

const rotateLeftBtn = queryElement<HTMLButtonElement>("rotate-left-btn");
const rotateRightBtn = queryElement<HTMLButtonElement>("rotate-right-btn");
const flipHBtn = queryElement<HTMLButtonElement>("flip-h-btn");
const flipVBtn = queryElement<HTMLButtonElement>("flip-v-btn");

const allControls: HTMLElement[] = [
  resetBtn,
  saveBtn,
  brightnessInput,
  contrastInput,
  saturationInput,
  blurInput,
  hueInput,
  sepiaInput,
  grayscaleToggle,
  invertToggle,
  rotateLeftBtn,
  rotateRightBtn,
  flipHBtn,
  flipVBtn,
];

const editor = new ImageEditor(canvas);

function enableControls(): void {
  for (const control of allControls) {
    (control as HTMLButtonElement | HTMLInputElement).disabled = false;
  }
}

function syncSliderLabels(state: FilterState): void {
  queryElement<HTMLSpanElement>("brightness-value").textContent = `${state.brightness}%`;
  queryElement<HTMLSpanElement>("contrast-value").textContent = `${state.contrast}%`;
  queryElement<HTMLSpanElement>("saturation-value").textContent = `${state.saturation}%`;
  queryElement<HTMLSpanElement>("blur-value").textContent = `${state.blur}px`;
  queryElement<HTMLSpanElement>("hue-value").textContent = `${state.hue}°`;
  queryElement<HTMLSpanElement>("sepia-value").textContent = `${state.sepia}%`;
}

function syncSliderInputs(state: FilterState): void {
  brightnessInput.value = String(state.brightness);
  contrastInput.value = String(state.contrast);
  saturationInput.value = String(state.saturation);
  blurInput.value = String(state.blur);
  hueInput.value = String(state.hue);
  sepiaInput.value = String(state.sepia);
  grayscaleToggle.classList.toggle("is-active", state.grayscale);
  invertToggle.classList.toggle("is-active", state.invert);
  syncSliderLabels(state);
}

setupDragAndDrop(dropzone, fileInput, (image) => {
  editor.loadImage(image);
  dropzone.hidden = true;
  canvasWrap.hidden = false;
  enableControls();
  syncSliderInputs(editor.getFilterState());
});

brightnessInput.addEventListener("input", () => {
  editor.updateFilter("brightness", Number(brightnessInput.value));
  syncSliderLabels(editor.getFilterState());
});

contrastInput.addEventListener("input", () => {
  editor.updateFilter("contrast", Number(contrastInput.value));
  syncSliderLabels(editor.getFilterState());
});

saturationInput.addEventListener("input", () => {
  editor.updateFilter("saturation", Number(saturationInput.value));
  syncSliderLabels(editor.getFilterState());
});

blurInput.addEventListener("input", () => {
  editor.updateFilter("blur", Number(blurInput.value));
  syncSliderLabels(editor.getFilterState());
});

hueInput.addEventListener("input", () => {
  editor.updateFilter("hue", Number(hueInput.value));
  syncSliderLabels(editor.getFilterState());
});

sepiaInput.addEventListener("input", () => {
  editor.updateFilter("sepia", Number(sepiaInput.value));
  syncSliderLabels(editor.getFilterState());
});

grayscaleToggle.addEventListener("click", () => {
  const isActive = editor.toggleFilter("grayscale");
  grayscaleToggle.classList.toggle("is-active", isActive);
});

invertToggle.addEventListener("click", () => {
  const isActive = editor.toggleFilter("invert");
  invertToggle.classList.toggle("is-active", isActive);
});

rotateLeftBtn.addEventListener("click", () => editor.rotate(-1));
rotateRightBtn.addEventListener("click", () => editor.rotate(1));
flipHBtn.addEventListener("click", () => editor.flip("horizontal"));
flipVBtn.addEventListener("click", () => editor.flip("vertical"));

resetBtn.addEventListener("click", () => {
  editor.reset();
  syncSliderInputs(editor.getFilterState());
});

saveBtn.addEventListener("click", () => {
  if (editor.hasImage()) {
    downloadCanvasAsImage(editor.getCanvas(), "edited-image.png");
  }
});
