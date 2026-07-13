"use strict";
(() => {
  // src/ts/filters.ts
  function createDefaultFilterState() {
    return {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      hue: 0,
      sepia: 0,
      grayscale: false,
      invert: false
    };
  }
  function createDefaultTransformState() {
    return {
      rotation: 0,
      flipH: false,
      flipV: false
    };
  }
  function buildFilterString(state) {
    const parts = [
      `brightness(${state.brightness}%)`,
      `contrast(${state.contrast}%)`,
      `saturate(${state.saturation}%)`,
      `blur(${state.blur}px)`,
      `hue-rotate(${state.hue}deg)`,
      `sepia(${state.sepia}%)`
    ];
    if (state.grayscale) {
      parts.push("grayscale(100%)");
    }
    if (state.invert) {
      parts.push("invert(100%)");
    }
    return parts.join(" ");
  }

  // src/ts/canvasEditor.ts
  var ImageEditor = class {
    constructor(canvas2) {
      this.image = null;
      this.filterState = createDefaultFilterState();
      this.transformState = createDefaultTransformState();
      this.canvas = canvas2;
      const context = canvas2.getContext("2d");
      if (!context) {
        throw new Error("Canvas 2D context is not available");
      }
      this.ctx = context;
    }
    loadImage(image) {
      this.image = image;
      this.filterState = createDefaultFilterState();
      this.transformState = createDefaultTransformState();
      this.render();
    }
    hasImage() {
      return this.image !== null;
    }
    getFilterState() {
      return this.filterState;
    }
    updateFilter(key, value) {
      this.filterState[key] = value;
      this.render();
    }
    toggleFilter(key) {
      this.filterState[key] = !this.filterState[key];
      this.render();
      return this.filterState[key];
    }
    rotate(direction) {
      this.transformState.rotation = (this.transformState.rotation + direction * 90 + 360) % 360;
      this.render();
    }
    flip(axis) {
      if (axis === "horizontal") {
        this.transformState.flipH = !this.transformState.flipH;
      } else {
        this.transformState.flipV = !this.transformState.flipV;
      }
      this.render();
    }
    reset() {
      if (!this.image) {
        return;
      }
      this.filterState = createDefaultFilterState();
      this.transformState = createDefaultTransformState();
      this.render();
    }
    getCanvas() {
      return this.canvas;
    }
    render() {
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
      this.ctx.rotate(this.transformState.rotation * Math.PI / 180);
      this.ctx.scale(this.transformState.flipH ? -1 : 1, this.transformState.flipV ? -1 : 1);
      this.ctx.drawImage(this.image, -width / 2, -height / 2, width, height);
      this.ctx.restore();
    }
  };

  // src/ts/dragDrop.ts
  function readFileAsImage(file) {
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
        image.src = reader.result;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  }
  function setupDragAndDrop(dropzone2, fileInput2, onImageLoaded) {
    dropzone2.addEventListener("click", () => {
      fileInput2.click();
    });
    fileInput2.addEventListener("change", () => {
      const file = fileInput2.files?.[0];
      if (file) {
        readFileAsImage(file).then(onImageLoaded).catch((error) => console.error(error));
      }
    });
    dropzone2.addEventListener("dragover", (event) => {
      event.preventDefault();
      dropzone2.classList.add("drag-over");
    });
    dropzone2.addEventListener("dragleave", () => {
      dropzone2.classList.remove("drag-over");
    });
    dropzone2.addEventListener("drop", (event) => {
      event.preventDefault();
      dropzone2.classList.remove("drag-over");
      const file = event.dataTransfer?.files?.[0];
      if (file) {
        readFileAsImage(file).then(onImageLoaded).catch((error) => console.error(error));
      }
    });
  }

  // src/ts/download.ts
  function downloadCanvasAsImage(canvas2, filename) {
    canvas2.toBlob((blob) => {
      if (!blob) {
        console.error("Failed to export canvas");
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  // src/ts/main.ts
  function queryElement(id) {
    const element = document.getElementById(id);
    if (!element) {
      throw new Error(`Element with id "${id}" was not found`);
    }
    return element;
  }
  var dropzone = queryElement("dropzone");
  var fileInput = queryElement("file-input");
  var canvasWrap = queryElement("canvas-wrap");
  var canvas = queryElement("canvas");
  var resetBtn = queryElement("reset-btn");
  var saveBtn = queryElement("save-btn");
  var brightnessInput = queryElement("brightness");
  var contrastInput = queryElement("contrast");
  var saturationInput = queryElement("saturation");
  var blurInput = queryElement("blur");
  var hueInput = queryElement("hue");
  var sepiaInput = queryElement("sepia");
  var grayscaleToggle = queryElement("grayscale-toggle");
  var invertToggle = queryElement("invert-toggle");
  var rotateLeftBtn = queryElement("rotate-left-btn");
  var rotateRightBtn = queryElement("rotate-right-btn");
  var flipHBtn = queryElement("flip-h-btn");
  var flipVBtn = queryElement("flip-v-btn");
  var allControls = [
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
    flipVBtn
  ];
  var editor = new ImageEditor(canvas);
  function enableControls() {
    for (const control of allControls) {
      control.disabled = false;
    }
  }
  function syncSliderLabels(state) {
    queryElement("brightness-value").textContent = `${state.brightness}%`;
    queryElement("contrast-value").textContent = `${state.contrast}%`;
    queryElement("saturation-value").textContent = `${state.saturation}%`;
    queryElement("blur-value").textContent = `${state.blur}px`;
    queryElement("hue-value").textContent = `${state.hue}\xB0`;
    queryElement("sepia-value").textContent = `${state.sepia}%`;
  }
  function syncSliderInputs(state) {
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
})();
