export interface FilterState {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  hue: number;
  sepia: number;
  grayscale: boolean;
  invert: boolean;
}

export interface TransformState {
  rotation: number;
  flipH: boolean;
  flipV: boolean;
}

export type ImageSource = HTMLImageElement;
