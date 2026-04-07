# Plan: Vercel Preview Deploys para Proyectos

## Objetivo

Cada proyecto construido por Eros se deploya automáticamente a Vercel,
generando una URL de preview persistente. Sin levantar nada local, se
puede ver el proyecto desde cualquier dispositivo.

## Arquitectura

```
proyecto en Desktop/
  ├── vite build → dist/
  └── vercel deploy --prebuilt → https://{slug}.vercel.app
```

### Dos opciones de integración

#### Opción A: CLI directo (simple)

Después de que el proyecto pasa gates, correr:

```javascript
// En eros-project-sync.mjs o un nuevo eros-deploy.mjs
const deploy = async (projectDir, slug) => {
  // 1. Build
  await exec('npx vite build', { cwd: projectDir })

  // 2. Deploy
  const result = await exec(
    `npx vercel deploy --prod --yes --name ${slug}`,
    { cwd: projectDir }
  )
  // result.stdout contiene la URL

  return { url: result.stdout.trim() }
}
```

**Requiere:** `npm i -g vercel` + `vercel login` (una vez por máquina)

#### Opción B: GitHub Actions (automático)

Trigger en cada push al archive repo (`pegasuz-projects`).

```yaml
# .github/workflows/deploy-preview.yml
name: Deploy Preview
on:
  push:
    branches-ignore: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22

      - run: npm install
      - run: npx vite build

      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./dist
          alias-domains: ${{ github.ref_name }}.pegasuz.vercel.app
```

**Requiere:**
- Cuenta Vercel (free tier: 100 deploys/día)
- Secrets en el repo: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- Crear proyecto Vercel una vez: `vercel link` en el archive repo

## URLs resultantes

```
https://champions-for-good.pegasuz.vercel.app
https://artefakt-practice.pegasuz.vercel.app
https://fluid-glass-v2.pegasuz.vercel.app
```

## Cambios necesarios

### 1. Setup inicial (una vez)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Crear proyecto Vercel linkeado al archive repo
cd Desktop/algun-proyecto
vercel link
# → Guardar org-id y project-id
```

### 2. Script: `eros-deploy.mjs`

```
Subcommands:
  deploy  --project <path>   Build + deploy a Vercel
  list                       List all deployed previews
  remove  --project <slug>   Remove a deploy
```

### 3. Integración en pipeline

En `eros-project-sync.mjs push`:
- Después del push a GitHub, trigger deploy
- Guardar URL en `project-registry.json`
- Mostrar URL en el panel

### 4. Panel UI

- Agregar botón "Preview ↗" al lado de cada proyecto
- Link directo a la URL de Vercel

## Estimación

| Componente | Esfuerzo |
|-----------|----------|
| Setup Vercel + secrets | 15 min |
| eros-deploy.mjs (CLI deploy) | 1h |
| GitHub Action (si se prefiere automático) | 30 min |
| Integración en pipeline + panel | 30 min |
| **Total** | **~2.5h** |

## Prioridad

Media. Los thumbnails ya dan visibilidad. Vercel agrega la capacidad de compartir
y ver en mobile real, lo cual es valioso para QA pero no bloquea el training.

## Consideraciones

- **Free tier Vercel:** 100 deploys/día, 100GB bandwidth/mes — más que suficiente
- **Cleanup:** deploys viejos se pueden borrar con `vercel rm`
- **Dominio custom:** opcional, se puede mapear `preview.pegasuz.dev` si se quiere
- **Assets:** si los proyectos usan imágenes pesadas, considerar optimizar en build
