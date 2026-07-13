import { FilterState, TransformState } from "./types.js";

export function createDefaultFilterState(): FilterState {
  return {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    hue: 0,
    sepia: 0,
    grayscale: false,
    invert: false,
  };
}

export function createDefaultTransformState(): TransformState {
  return {
    rotation: 0,
    flipH: false,
    flipV: false,
  };
}

export function buildFilterString(state: FilterState): string {
  const parts: string[] = [
    `brightness(${state.brightness}%)`,
    `contrast(${state.contrast}%)`,
    `saturate(${state.saturation}%)`,
    `blur(${state.blur}px)`,
    `hue-rotate(${state.hue}deg)`,
    `sepia(${state.sepia}%)`,
  ];

  if (state.grayscale) {
    parts.push("grayscale(100%)");
  }

  if (state.invert) {
    parts.push("invert(100%)");
  }

  return parts.join(" ");
}
