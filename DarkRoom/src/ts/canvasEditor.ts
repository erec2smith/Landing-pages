import { FilterState, TransformState, ImageSource } from "./types.js";
import { createDefaultFilterState, createDefaultTransformState, buildFilterString } from "./filters.js";

export class ImageEditor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private image: ImageSource | null = null;
  private filterState: FilterState = createDefaultFilterState();
  private transformState: TransformState = createDefaultTransformState();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas 2D context is not available");
    }
    this.ctx = context;
  }

  loadImage(image: ImageSource): void {
    this.image = image;
    this.filterState = createDefaultFilterState();
    this.transformState = createDefaultTransformState();
    this.render();
  }

  hasImage(): boolean {
    return this.image !== null;
  }

  getFilterState(): FilterState {
    return this.filterState;
  }

  updateFilter<K extends keyof FilterState>(key: K, value: FilterState[K]): void {
    this.filterState[key] = value;
    this.render();
  }

  toggleFilter(key: "grayscale" | "invert"): boolean {
    this.filterState[key] = !this.filterState[key];
    this.render();
    return this.filterState[key];
  }

  rotate(direction: 1 | -1): void {
    this.transformState.rotation = (this.transformState.rotation + direction * 90 + 360) % 360;
    this.render();
  }

  flip(axis: "horizontal" | "vertical"): void {
    if (axis === "horizontal") {
      this.transformState.flipH = !this.transformState.flipH;
    } else {
      this.transformState.flipV = !this.transformState.flipV;
    }
    this.render();
  }

  reset(): void {
    if (!this.image) {
      return;
    }
    this.filterState = createDefaultFilterState();
    this.transformState = createDefaultTransformState();
    this.render();
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  private render(): void {
    if (!this.image) {
      return;
    }

    const swapDimensions = this.transformState.rotation === 90 || this.transformState.rotation === 270;
    const width = this.image.naturalWidth;
    const height = this.image.naturalHeight;

    this.canvas.width = swapDimensions ? height : width;
    this.canvas.height = swapDimensions ? width : height;

    this.ctx.save();
    this.ctx.filter = buildFilterString(this.filterState);
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.rotate((this.transformState.rotation * Math.PI) / 180);
    this.ctx.scale(this.transformState.flipH ? -1 : 1, this.transformState.flipV ? -1 : 1);
    this.ctx.drawImage(this.image, -width / 2, -height / 2, width, height);
    this.ctx.restore();
  }
}
