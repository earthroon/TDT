# TDT-RUNTIME-SSOT-01-R1-R1 Applied

## Vue Booleanish Type Closure

`app/src/components/LegacyDomIsland.vue` passed an empty string to Vue's typed `inert` property:

```vue
:inert="inert ? '' : undefined"
```

Vue 3 declares `inert` as `Booleanish | undefined`; the empty string branch caused `TS2322` under `vue-tsc`.

The binding now preserves the native boolean contract directly:

```vue
:inert="inert"
```

This retains the intended runtime behavior:

- `true`: the legacy DOM island is inert.
- `false`: Vue removes or disables the boolean attribute according to DOM property semantics.

## Verification

Passed after the patch:

- Vite authoritative entry closure
- Pinia serializability gate
- Runtime capability and service ownership gates
- Legacy manifest admission and syntax gate
- Deterministic boot receipt parity 100/100
- TypeScript parser syntax gate
- Stable error-code registry gate

The container still has no installed `node_modules`, so `vue-tsc`, Vite production build, and Electron smoke remain local promotion steps.
