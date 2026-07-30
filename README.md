![Footballs in Motion](./public/cover.jpg)

# Footballs in Motion

Interactive 3D experience built with **React Three Fiber**, featuring procedural PBR football shaders, real-time physics, and choreographed motion.

**Live demo:** [footballs.nestorrig.com](https://footballs.nestorrig.com)

## Overview

A collection of WebGL scenes that explore the same procedural football material under different lighting, physics, and interaction setups. Each demo is a self-contained experiment — from orbital gravity and enclosed bubble physics to GSAP-driven camera motion.

## Demos

| Route | Name | Description |
|-------|------|-------------|
| `/` | **Home** | Inspect the procedural PBR material. Drag to rotate and zoom. |
| `/1` | **Attractor** | 20 instanced balls orbiting a planetary gravity center. Move the mouse to shift the attractor. |
| `/2` | **Bubble** | Balls trapped inside a transparent sphere. Drag to move the container. |
| `/3` | **Gravity** | Balls inside a 3D bounding box with Rapier physics. Push them with the cursor. |
| `/4` | **Tween** | GSAP-driven orbital animation with adjustable ball count. No interaction required. |
| `/5` | **Gravity** | Gravity simulation triggered by click / tap. |
| `/poster` | **Poster** | Hero composition for the project cover. |

## Tech Stack

- [Next.js 16](https://nextjs.org) — App Router, metadata, static generation
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) — React renderer for Three.js
- [@react-three/drei](https://github.com/pmndrs/drei) — helpers, controls, environment maps
- [@react-three/rapier](https://github.com/pmndrs/react-three-rapier) — WASM physics engine
- [Three.js](https://threejs.org) — WebGL rendering
- [three-custom-shader-material](https://github.com/Faraz-Nodejamali/three-custom-shader-material) — custom vertex/fragment shaders on top of PBR
- [GSAP](https://gsap.com) — timeline-based animation (Demo 4)
- [Tailwind CSS 4](https://tailwindcss.com) — layout and typography

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |

## Project Structure

```
app/
├── layout.tsx              # Root layout, metadata, navigation
├── (balls)/
│   ├── page.tsx            # Home — material inspector
│   └── (pbr)/
│       ├── 1/              # Attractor
│       ├── 2/              # Bubble
│       ├── 3/              # Gravity (mouse)
│       ├── 4/              # Tween
│       ├── 5/              # Gravity (click)
│       └── poster/         # Cover scene
components/
├── common/                 # Shared environment & lighting
└── shaders/                # Procedural football PBR shaders
public/
└── cover.jpg               # OG / social preview image
```

## Author

**Nestor Rios Garcia** — [@nestorrig](https://x.com/nestorrig)

- [Instagram](https://www.instagram.com/nestorrig/)
- [LinkedIn](https://www.linkedin.com/in/nestorrig/)
- [Behance](https://www.behance.net/nestorrig)

## License

Private project. All rights reserved.
