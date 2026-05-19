# Three.js — Lighting Generator

A small web demo to **compose a lighting setup** in [Three.js](https://threejs.org/), tweak helpers and shadows, then **copy ready-to-paste code** into your own project (vanilla Three.js or React Three Fiber).

## Preview

![Interface preview — 3D scene, lil-gui panel, and code export](preview.png)

## Live demo

**[Open the live demo](https://tolexia.github.io/threejs-lighting-generator)**

## Features

- Reference scene (ground, default cube, PBR materials) with **shadows** and **OrbitControls**.
- **Custom subject** ([`GLTFLoader`](https://threejs.org/docs/#examples/en/loaders/GLTFLoader)): load a local **`.glb` / `.gltf`** from the **Subject** folder in lil-gui, auto-fit to scene scale, shadows on all meshes, **scale** slider, **position** sliders, and **Reset to box** to restore the default cube.
- **Subject translate gizmo** ([`TransformControls`](https://threejs.org/docs/#examples/en/controls/TransformControls)): drag the subject (cube or loaded model) in the viewport; position stays in sync with the GUI.
- **Light types** in a [lil-gui](https://lil-gui.georgealways.com/) panel: Ambient, Directional, Hemisphere, Point, Spot, RectArea (with `RectAreaLightUniformsLib`).
- Per-light enable/disable and **helpers** (Ambient has no native helper in Three.js).
- **Light gizmos** ([`TransformControls`](https://threejs.org/docs/#examples/en/controls/TransformControls)): translate each enabled light (and directional / spot **targets**) directly in the viewport; gizmo size scales with camera distance so handles stay usable when you zoom out.
- **Code export** panel: **enabled** lights only, **vanilla Three.js** or **React Three Fiber** format, refresh and clipboard copy.
- **Stats** (FPS) overlay for quick performance checks.

## Tech stack

- Plain HTML, CSS, and ES modules.
- Three.js **0.183.0** via [import map](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap) and [jsDelivr](https://www.jsdelivr.com/) (`three.module.js` and `examples/jsm` addons).

## Run locally

ES modules and the import map need an HTTP origin (not `file://`). From the repo root:

```bash
npx --yes serve .
```

Then open the URL printed in the terminal (often `http://localhost:3000`).

## Loading a GLB subject

1. Open the **Subject** folder in the lil-gui panel (top of the list).
2. Click **Load GLB…** and pick a `.glb` or `.gltf` file from your machine (processed locally in the browser; nothing is uploaded).
3. Adjust **scale** and **position** with the sliders, or drag the **translate gizmo** on the subject in the 3D view.
4. Click **Reset to box** to remove the model and bring back the default cube.

The loader centers the model on the ground, normalizes its size to roughly match the default cube (~1.2 units), and enables cast/receive shadows on all meshes.

## Repository layout

| File          | Purpose                                      |
| ------------- | -------------------------------------------- |
| `index.html`  | Page shell, import map, export panel         |
| `main.js`     | Three.js scene, GUI, code generation         |
| `style.css`   | Layout (canvas + code panel)                 |
| `preview.png` | Screenshot for README / docs                 |

