# Eros Studio — superficie de colaboración en vivo

No es un chat. No es un dashboard. Es la superficie donde Eros trabaja **a la vista**,
propone decisiones por su cuenta, y se critica a sí mismo en loop continuo.

Origen: Frente 4 de `docs/research/2026-07-04-fable-evolution.md` · investigación en
`docs/research/raw/2026-07-04-collab-interface.md` (patrones robados con criterio de
Onlook, Devin, tldraw make-real, Vercel Comments, v0, Krea).

## Los tres paneles

| Panel | Qué es |
|---|---|
| **Live Preview** | iframe del dev server del proyecto. **Pin mode**: anotás sobre la última captura (patrón tldraw "draw on top") — cada pin llega a Eros como feedback estructurado anclado a coordenadas. |
| **Decision Dock** | Las preguntas proactivas de Eros llegan como cards estructuradas (opciones + detalle + swatches + su recomendación). Una card bloqueante por vez. Abajo: feed de presencia ("eros dice") e historial. |
| **Eyes Strip** | Filmstrip de capturas (cada una atada a un git ref + % de diff pixel). El último veredicto de autocrítica (SHIP / ADJUST / RETHINK) con sus pins de severidad sobre la captura. |

## Arquitectura (restricción dura respetada)

```
Vue app (4310) ⇄ WS ⇄ Node server (4300)
                        ├─ Agent SDK query() streaming → spawnea `claude` CLI logueado
                        │    → EL RAZONAMIENTO CORRE EN LA SUSCRIPCIÓN, cero API keys
                        ├─ MCP in-process → propose_decision (bloquea hasta que respondés),
                        │    report_critique, get_pending_feedback, capture_now
                        ├─ Ojos: chokidar src/** → debounce 900ms → Playwright warm →
                        │    pixelmatch → solo diffs >1.2% despiertan la crítica (economía)
                        └─ Stop hook: rechaza cerrar fase con críticas "adjust" abiertas
```

El server **nunca** llama a un LLM. Orquesta, captura, persiste (`server/.state/`) y presenta.

## Uso

```powershell
cd studio
npm install          # instala server + app
npm run server       # terminal 1 — server :4300
npm run app          # terminal 2 — UI :4310
```

1. Abrí `http://localhost:4310`
2. "Abrir proyecto" → directorio del proyecto + URL de su dev server (el dev server lo levantás vos o `scripts/panel/server.mjs start`)
3. "▶ Iniciar sesión Eros" (con brief opcional) — la sesión corre el protocolo Studio:
   decide → pregunta con cards → construye → se mira (`capture_now` + Read) → se critica
   (`report_critique`) → ajusta hasta SHIP.

## Por qué así (hallazgos que definieron el diseño)

- **Agent SDK usa la suscripción** — el cambio de billing se pausó 2026-06-15. Mitigación de riesgo: un solo entry point `query()` en `session.mjs`.
- **AskUserQuestion está roto en modo programático** (issue #30983, cerrado not-planned) → `propose_decision` es una MCP tool propia cuya Promise no se resuelve hasta que la UI responde.
- **Pins sobre capturas, no sobre el iframe** — evita todo el problema cross-origin en v1; la instrumentación tipo Onlook (`data-eros-id` con plugin Vite) queda para fase 2.
- **Dos niveles de ojos** — percepción determinista continua (cero tokens) + crítica gated por diff de píxeles, para no quemar la ventana de 5 horas del plan.
- Las críticas se persisten en `server/.state/` — el transcript nunca es el archivo.

## Fase 2 (no construido aún, decidido)

- Instrumentación `data-eros-id` (estudiar `packages/parser` de Onlook, MIT)
- Workshop absorbido (edición de tokens sin tokens de LLM, à la v0 design mode)
- Before/after wipe entre capturas consecutivas
- Asset tray conectado al pipeline de medios (`.eros/workflows/media.md`)
- Heartbeat de link-health (hook HTTP → server caído = badge "Eros está sordo")
