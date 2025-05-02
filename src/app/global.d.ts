export { };

declare module '*.glb';
declare module '*.png';

declare module 'meshline' {
  export const MeshLineGeometry: any;
  export const MeshLineMaterial: any;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      meshLineGeometry: any;
      meshLineMaterial: any;
    }
  }
}

/* Animation untuk counter */
.counter-item {
  @apply transition-all duration-500;
}

.counter-item:hover {
  @apply transform -translate-y-1;
}

.count-number {
  @apply transition-all duration-300;
  text-shadow: 0 0 10px rgba(56, 189, 248, 0.3);
}

.counter-item:hover .count-number {
  @apply text-sky-400;
}

- src/vite-env.d.ts
/// <reference types="vite/client" />
declare module '*.glb';
declare module '*.png';
