# eros — CLI

**v0.1.0 · early preview**

Wizard fullscreen para arrancar proyectos con el pipeline de Eros. Go + Bubble Tea.

> Esto es v0 — API y flags pueden cambiar entre commits. Pin a un commit si querés estabilidad.

---

## TL;DR

```powershell
git clone https://github.com/MateoGs013/eros.git
cd eros
.\scripts\install-cli.ps1        # compila + instala global en %LOCALAPPDATA%\Microsoft\WindowsApps
eros                              # abre el wizard desde cualquier carpeta
```

Requiere Go 1.22+ y Node 18+ (`winget install GoLang.Go OpenJS.NodeJS`).

---

## Instalación

Dos formas, según cuánto lo vayas a usar.

### A) Global (recomendado)

```powershell
.\scripts\install-cli.ps1
```

Instala a `%LOCALAPPDATA%\Microsoft\WindowsApps\eros.exe` que ya está en el PATH por default en Win10/11. Funciona inmediatamente — sin restart, sin `setx PATH`. El script además mata cualquier `eros.exe` corriendo antes de copiar, para que el binary no quede lockeado.

Verificá:

```powershell
eros --version
# eros version 0.1.0+commit.{hash}
```

Si `Microsoft\WindowsApps` está bloqueado por política corporativa, el installer cae a `%LOCALAPPDATA%\eros\bin\eros.exe` y patchea el PATH del usuario. En ese caso reiniciá la shell.

### B) Local al repo (sin PATH global)

```powershell
.\eros.ps1       # wrapper PowerShell nativo (recomendado)
.\eros           # wrapper batch — fallback si tenés PSReadLine tuneada
```

La primera vez compila solo; después corre instantáneo. Al terminar el primer build te pregunta si querés instalar global (opción A).

---

## Qué hace el wizard

Recolecta un brief en 13 pantallas y scaffolds el proyecto en `~/Desktop/{slug}/`:

| # | Pantalla | Qué pide |
|---|---|---|
| 1 | splash | N nuevo · R resume · L proyectos · Q salir |
| 2 | template_loader | scratch (cero) o cargar template guardado |
| 3 | name | nombre del proyecto (deriva slug automáticamente) |
| 4 | type | creative-studio · product-saas · brutalist-editorial · luxury-brand · dashboard-app · portfolio · agency · ecommerce-boutique |
| 5 | mood | dark cinematic editorial · brutalist bold · luxury refined · product UI (con live preview) |
| 6 | scheme | dark · light |
| 7 | pages | home · work · about · contact · ...custom |
| 8 | mode | autonomous · interactive · supervised |
| 9 | references | URLs opcionales |
| 10 | constraints | reglas duras opcionales |
| 11 | banned_seeds | 31 seed names a evitar |
| 12 | summary | preview + confirm |
| 13 | exec | scaffold + bootstrap |
| 14 | launch | abrir Claude con el proyecto |

Al confirmar:
1. Copia scaffold a `~/Desktop/{slug}/`.
2. Bootstrap de `.eros/` (moods, blueprints, libraries, intake.json).
3. `npm install` visible en la terminal (no adentro del wizard — para que veas el progreso).
4. Launch de `claude "nuevo proyecto"` en el project dir.

---

## Comandos

| Comando | Qué hace |
|---|---|
| `eros` | Abre el wizard (alias de `eros new`) |
| `eros new [slug]` | Wizard interactivo |
| `eros list` | Lista proyectos existentes en `~/Desktop/` con fase y progreso |
| `eros resume <slug>` | Abre Claude Code en un proyecto existente |
| `eros template list` | Lista templates guardados |
| `eros template delete <name>` | Borra un template |
| `eros --version` | Version + commit |
| `eros --help` | Ayuda |

---

## Shortcuts del wizard

| Tecla | Acción |
|---|---|
| `Enter` | Confirmar / avanzar |
| `Esc` · `←` | Volver |
| `Tab` | Saltar pantalla opcional (referencias, constraints, banned seeds) |
| `Ctrl+C` | Cancelar (ofrece guardar como draft) |
| `Ctrl+S` | Guardar brief actual como template reutilizable |
| `Ctrl+A` | Abrir overlay "Advanced" (audience, description, brand, backend) |
| `Ctrl+E` | Forzar edición manual del slug (en pantalla de nombre) |
| `Ctrl+Y` | Copiar último error al clipboard (en pantalla de error) |
| `?` | Ayuda contextual |
| `Q` | Salir (en splash) |

---

## Requisitos

- **Go 1.22+** — para compilar. `winget install GoLang.Go` o https://go.dev/dl/
- **Node.js 18+** — el CLI shellea a `scripts/pipeline/*.mjs`. `winget install OpenJS.NodeJS`
- **Claude Code** — para el launch. `npm install -g @anthropic-ai/claude-code`

Sin Claude Code, el wizard termina pero te da el comando exacto para copiar al clipboard y correr manualmente.

---

## Configuración

- `EROS_MAQUETA_DIR` — override del path del repo maqueta. Default: `~/Desktop/Eros/`.
- Templates: `%APPDATA%\eros\templates\*.json` (Windows) · `~/.config/eros/templates/*.json` (unix).
- Draft de Ctrl+C: `%APPDATA%\eros\draft.json`.

---

## Troubleshooting

**`eros` no se reconoce en PS**
El installer no está en PATH. Corré `.\scripts\install-cli.ps1` en la raíz del repo. Si sigue fallando, verificá que `%LOCALAPPDATA%\Microsoft\WindowsApps` esté en `$env:PATH`.

**Violeta o cuadros raros en el fondo**
Tu terminal no soporta truecolor o tiene colorprofile no detectable. Probá en Windows Terminal (no en PowerShell ISE / consola legacy).

**La card aparece a la izquierda**
Estás corriendo un binary viejo. El installer no puede sobrescribir el binario global si hay un `eros.exe` corriendo — matá esos procesos (`Get-Process eros | Stop-Process`) y reinstalá. El script nuevo ya lo hace automáticamente.

**`spawn EINVAL` al terminar el wizard**
Bug conocido de Node ≥ 18 en Windows con `.cmd` shims sin `shell: true`. Ya está parcheado en `scripts/pipeline/init-project.mjs`; si persiste, actualizá el repo.

---

## Desarrollo

```powershell
cd cli
go test ./...                     # tests + bleed/jitter guards
go build -o bin/eros.exe ./
.\bin\eros.exe
```

### Estructura

```
cli/
├── cmd/               # Cobra commands (root, new, list, resume, template)
├── internal/
│   ├── brief/         # Brief struct (matches normalizeBrief schema)
│   ├── slug/          # Unicode-safe slugify
│   ├── paths/         # MAQUETA_DIR discovery
│   ├── moods/         # Shell-out a scripts/pipeline/export-moods.mjs
│   ├── projects/      # Scan ~/Desktop para proyectos Eros existentes
│   ├── runner/        # exec wrappers (node, claude, clipboard)
│   ├── templates/     # Template CRUD
│   ├── config/        # Config dir + draft save
│   └── tui/
│       ├── styles/    # Chrome (card fijo 84×56×22, fixBleed, rawBGPad) + tema + logo ASCII
│       ├── keys/      # Global keymap
│       └── wizard/    # 15-screen state machine + pantallas
└── testdata/
    └── fake-maqueta/  # Fixture para integration tests
```

### Arquitectura

El CLI es una **capa fina de UX**. Toda la lógica de validación, bootstrapping y scaffolding vive en Node (`scripts/pipeline/*.mjs`). El CLI serializa un JSON y shellea a `init-project.mjs` — cero duplicación.

Ver el spec completo en [`docs/superpowers/specs/2026-04-16-eros-cli-design.md`](../docs/superpowers/specs/2026-04-16-eros-cli-design.md).

---

## Roadmap (v0 → v1)

v0 actual:
- [x] Wizard 15 pantallas
- [x] Global install sin `./`
- [x] Card fijo 84×22 sin jitter
- [x] TrueColor forzado (sin violet bleed)
- [x] `npm install` visible post-wizard
- [x] Templates save/load

v0.2:
- [ ] `eros resume <slug>` funcional
- [ ] `eros list` con fase + progreso real
- [ ] Draft auto-save en Ctrl+C
- [ ] Stream logs del init-project en vez de spinner mudo

v1:
- [ ] Persistent TUI (Approach C del spec)
- [ ] Live brief editing post-launch
- [ ] Multi-mood interpolation

---

## Estado actual

**v0.1.0** — early preview. Funcional para arrancar proyectos de cero. Flows `resume` y `list` son stubs — usalos al comando solo para debug. API de templates estable.

Reportá bugs con `git log -1` output + terminal + Windows version.
