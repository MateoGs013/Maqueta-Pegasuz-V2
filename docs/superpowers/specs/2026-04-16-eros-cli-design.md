# Eros CLI — Design Spec

**Date:** 2026-04-16
**Author:** brainstorm con Mateo
**Status:** Draft — pending user review
**Scope:** v0.1 (wizard) + v0.2 (TUI persistente) preview

---

## 1. Problema

Hoy iniciar un proyecto con Eros requiere:

1. Escribir a mano un `intake.json` con 15 campos
2. Recordar el comando exacto `npm run init:project -- --brief-file <X> --project <Y>`
3. `cd` al proyecto generado
4. Abrir Claude y escribir "nuevo proyecto" para disparar `Skill("project")`

Fricción alta. El usuario (Mateo) quiere escribir `eros` en PowerShell y que se abra una interfaz que:

- Recolecte el brief de forma interactiva (tipo, mood, páginas, etc.)
- Cree el proyecto automáticamente
- Lance Claude ya en el directorio correcto con el prompt inicial que dispara el pipeline

Referencia estética: OpenCode (TUI fullscreen en Go/Bubble Tea). El resultado tiene que verse nivel Awwwards para terminal — no un wizard genérico.

## 2. Objetivos y no-objetivos

### Objetivos (v0.1)

- Escribir `eros` en PowerShell abre un wizard fullscreen
- Wizard recolecta los 10 campos clave del brief (los otros 5 son derivados o default)
- Al confirmar: crea el proyecto y ofrece lanzar Claude con handoff limpio
- Binario único `eros.exe` distribuible, sin dep-hell
- Comandos de soporte: `eros list`, `eros resume`, `eros template save/load`

### Objetivos (v0.2 — preview, no se implementa ahora)

- Home TUI persistente con menú principal
- Watch mode que refleja la queue del proyecto en vivo
- Memory inspector para browse del `design-intelligence/`
- Quotes rotator "Eros dice" del `personality.json`

### No-objetivos

- Reimplementar la validación del brief en Go (vive en Node, single source of truth)
- Reemplazar el panel web existente (el CLI es entrada, el panel es review)
- Soportar múltiples shells (foco: PowerShell en Windows; bash/zsh como bonus)
- Ejecutar agentes o evaluaciones desde el CLI (eso es trabajo de Claude + scripts)

## 3. Decisiones de arquitectura

### 3.1 Stack: Go + Bubble Tea

**Elegido:** Go + `charmbracelet/bubbletea` + `lipgloss` + `bubbles`.

**Razón:** el benchmark visual es OpenCode, que es Bubble Tea. Go compila a `.exe` único sin runtime en PATH — cero fricción de instalación en PowerShell. Ink (Node) era la alternativa pero requiere Node runtime y la calidad visual es notoriamente peor.

**Tradeoff aceptado:** Go es un lenguaje nuevo en el repo (todo lo demás es Node). Mitigación: el CLI es capa fina de UX; no reimplementa lógica de dominio.

### 3.2 Puente Go ↔ Node

El CLI **no duplica** `normalizeBrief`, mood profiles, ni schema de intake. Dos mecanismos:

- **Lectura:** script nuevo `scripts/pipeline/export-moods.mjs` imprime los mood profiles como JSON. El CLI lo corre al arrancar, cachea en memoria.
- **Escritura:** el CLI serializa `Brief` a JSON y llama `node scripts/pipeline/init-project.mjs --brief-file <path> --project <path>`. Streaming de stdout al TUI.

### 3.3 Layout del repo

```
Eros/
├── cli/                          ← Go module nuevo
│   ├── go.mod
│   ├── main.go
│   ├── cmd/                      ← Cobra commands
│   │   ├── root.go               ← "eros" → TUI
│   │   ├── new.go                ← alias directo al wizard
│   │   ├── list.go
│   │   ├── resume.go
│   │   └── template.go
│   ├── internal/
│   │   ├── tui/
│   │   │   ├── wizard/           ← 13 pantallas (v0.1)
│   │   │   ├── home/             ← menú persistente (v0.2)
│   │   │   └── styles/           ← theme lipgloss
│   │   ├── brief/                ← struct Brief + serialización
│   │   ├── moods/                ← cache de export-moods.mjs
│   │   ├── projects/             ← scan de ~/Desktop/
│   │   └── runner/               ← exec wrappers (node, claude)
│   ├── bin/eros.exe              ← artefacto (gitignored)
│   └── README.md
└── scripts/
    ├── pipeline/
    │   ├── init-project.mjs      ← modificación mínima (ver §5.2)
    │   ├── bootstrap-eros-feed.mjs
    │   └── export-moods.mjs      ← nuevo
    └── install-cli.ps1           ← nuevo, instalador one-shot
```

### 3.4 Distribución

`scripts/install-cli.ps1`:

1. `go build -ldflags "-X main.version=$(git rev-parse --short HEAD)" -o bin/eros.exe ./cli/`
2. Copia a `$env:LOCALAPPDATA\eros\bin\eros.exe`
3. Agrega esa carpeta al `PATH` del usuario si falta
4. Verifica con `eros --version`

Post-v0.1: GitHub Releases con binarios precompilados. Fuera de scope ahora.

## 4. Wizard v0.1 — pantallas

13 pantallas del wizard propiamente dicho (1-13) + splash (0) + template loader (0.5).

### 4.1 Mapeo de campos del intake

De los 15 campos que espera `normalizeBrief`:

| Grupo | Campos | Fuente |
|---|---|---|
| Wizard (10) | `name`, `slug`, `type`, `mood`, `scheme`, `pages`, `mode`, `references`, `constraints`, `bannedSeeds` | Input directo |
| Derivado (3) | `seedFamilies`, `description`, `promptSummary` | Auto desde `mood profile` + templates (ver abajo) |
| Default (2) | `audience`, `brand`, `backend` | Default salvo pantalla `Ctrl+A` avanzada |

**Templates de derivación:**

- `seedFamilies` = `moodProfile.families` (ej. cinematic → `["cinematic", "ambient", "editorial"]`)
- `description` = `"A {type} site with {mood} direction."` (ej. "A creative-studio site with Dark cinematic editorial direction.")
- `promptSummary` = `description` salvo que el usuario edite vía `Ctrl+A`
- `audience` = lookup por `type` (ej. creative-studio → "Founders y marcas premium que esperan craft editorial")

### 4.2 Flujo

| # | Pantalla | Input | Default | Skippable |
|---|---|---|---|---|
| 0 | Splash + menú inicial | tecla | — | — |
| 0.5 | Cargar desde template? | select | "scratch" | sí |
| 1 | Nombre del proyecto | text | — | no |
| 2 | Slug (editable) | text | `slugify(nombre)` | no |
| 3 | Tipo | select 1-de-8 ¹ | `creative-studio` | no |
| 4 | Mood preset + preview | select 1-de-5 ² | `cinematic` | no |
| 5 | Scheme | `dark`/`light` | `dark` | no |
| 6 | Páginas | multi-select + custom | `[home, work, about, contact]` | no |
| 7 | Modo | `autonomous`/`interactive`/`supervised` | `autonomous` | no |
| 8 | References (URLs) | multi-line | vacío | sí (Tab) |
| 9 | Constraints | multi-line | vacío | sí |
| 10 | Banned seeds | multi-select de 31 | vacío | sí |
| 11 | Resumen + confirmar | view | — | no |
| 12 | Ejecución (spinner + logs) | — | — | no |
| 13 | Lanzar Claude? | `Y/n/c` | `Y` | no |

¹ **Tipos (pantalla 3):** `creative-studio`, `product-saas`, `brutalist-editorial`, `luxury-brand`, `dashboard-app`, `portfolio`, `agency`, `ecommerce-boutique`.

² **Moods (pantalla 4):** `Dark cinematic editorial`, `Brutalist bold`, `Luxury refined`, `Product UI`, `Custom (texto libre)`. Los primeros 4 mapean 1:1 a los `moodProfiles` definidos en `bootstrap-eros-feed.mjs`; "Custom" permite escribir un string libre que `pickMoodProfile` resuelve por regex.

### 4.3 Shortcuts globales

| Tecla | Acción |
|---|---|
| `Enter` | confirmar / avanzar |
| `Esc` / `←` | volver |
| `Tab` | saltar pantalla opcional |
| `Ctrl+C` | cancelar (ofrece guardar draft) |
| `Ctrl+S` | guardar brief actual como template |
| `Ctrl+A` | abrir overlay "Advanced" (audience, description, brand, backend) |
| `Ctrl+Y` | copiar mensaje de error al clipboard (en pantallas de error) |
| `?` | ayuda contextual |

### 4.4 Estética (criterio Awwwards)

- Paleta base: near-black `#0a0a0f`, warm white `#fafaf7`
- Acento: se tinta según el mood elegido (cinematic → ámbar, brutalist → rojo, luxury → oro, product → violeta)
- Bordes dobles estilo lipgloss `RoundedBorder`/`DoubleBorder`, mix intencional
- ASCII logo con peso real (no `figlet standard` — custom hand-drawn)
- Previews laterales en mood (pantalla 4) y banned seeds (pantalla 10) — no listas peladas
- Spinner en pantalla 12 no es el default — custom con glifos de craft (`⣷⣯⣟⡿⢿⣻⣽⣾`)
- Toda pantalla tiene al menos una asimetría deliberada (padding no uniforme, sidebar 60/40, no 50/50)

## 5. Data contract

### 5.1 Struct Go

```go
// cli/internal/brief/brief.go
type Brief struct {
    Name          string   `json:"name"`
    Slug          string   `json:"slug"`
    Type          string   `json:"type"`
    Description   string   `json:"description"`
    Audience      string   `json:"audience"`
    Pages         []string `json:"pages"`
    Mood          string   `json:"mood"`
    Scheme        string   `json:"scheme"`
    References    []string `json:"references"`
    Constraints   []string `json:"constraints"`
    Mode          string   `json:"mode"`
    Brand         string   `json:"brand"`
    Backend       string   `json:"backend"`
    PromptSummary string   `json:"promptSummary"`
    SeedFamilies  []string `json:"seedFamilies"`
    BannedSeeds   []string `json:"bannedSeeds"`
}
```

El Go solo serializa. La validación ocurre en Node (`normalizeBrief`).

### 5.2 Flujo de ejecución

```
1. Wizard cierra pantalla 11 con Brief en memoria
2. CLI resuelve paths en Go vía os.UserHomeDir() + os.TempDir():
     intakePath  = <tempDir>/eros-intake-{slug}-{ts}.json
     projectPath = <homeDir>/Desktop/{slug}
3. CLI escribe intake.json a intakePath
4. CLI exec: node scripts/pipeline/init-project.mjs
             --brief-file <intakePath>
             --project   <projectPath>
5. CLI stream stdout → pantalla 12 (últimas 5 líneas + spinner)
6. init-project.mjs (modificado) copia intake.json → <projectPath>/.eros/context/intake.json
7. Exit 0 → pantalla 13
   Exit ≠ 0 → pantalla de error con retry/edit/log
```

**Nota:** los paths se expanden en Go antes de pasar al child process. Nada de variables de shell (`%TEMP%`, `$env:`) en los argumentos — eso evita bugs de escape en PowerShell vs cmd.exe.

**Cambio requerido en `init-project.mjs`:** después del bootstrap, copiar el `--brief-file` al `.eros/context/intake.json` del proyecto. ~3 líneas. Mantiene rastro auditable: "así nació este sitio".

### 5.3 Templates

`Ctrl+S` en cualquier pantalla o desde el resumen:

- Guarda el `Brief` actual (sin `name`/`slug`) a `~/.config/eros/templates/{nombre}.json`
- Popup de nombre del template
- Pantalla 0.5 al arrancar lista templates disponibles

## 6. Launch integration

### 6.1 Handoff terminal (v0.1: exit-and-exec)

```go
// En el handler de pantalla 13:
return tea.Sequence(
    tea.ExitAltScreen,
    tea.ShowCursor,
    tea.Quit,
    execClaudeAfterQuit,
)

// Post tea.Quit:
cmd := exec.Command(claudePath, "nuevo proyecto")
cmd.Dir = projectDir
cmd.Stdin, cmd.Stdout, cmd.Stderr = os.Stdin, os.Stdout, os.Stderr
cmd.Run()
os.Exit(cmd.ProcessState.ExitCode())
```

El CLI libera alt-screen, sale limpio, Claude hereda la terminal. Cuando Claude sale → vuelve al prompt de PowerShell en el project dir.

### 6.2 Resolver el binario `claude`

```go
func findClaude() (string, error) {
    if p, err := exec.LookPath("claude"); err == nil {
        return p, nil
    }
    candidates := []string{
        filepath.Join(os.Getenv("APPDATA"), "npm", "claude.cmd"),
        filepath.Join(os.Getenv("LOCALAPPDATA"), "Programs", "claude", "claude.exe"),
    }
    for _, c := range candidates {
        if _, err := os.Stat(c); err == nil {
            return c, nil
        }
    }
    return "", errors.New("claude no encontrado en PATH")
}
```

Si falla → pantalla 13 cambia: solo ofrece `[c] copiar comando` + link a docs de instalación.

### 6.3 Acciones en pantalla 13

| Tecla | Acción |
|---|---|
| `Y` (default) | Exit-and-exec a `claude "nuevo proyecto"` en projectDir |
| `n` | Solo crear. Print: `cd {path}; claude "nuevo proyecto"`. Exit 0 |
| `c` | Copia al clipboard vía `golang.design/x/clipboard`. Exit 0 |

### 6.4 Pre-launch validation

Checklist silencioso, solo se muestra si falla:

- `projectDir/package.json` existe
- `projectDir/.eros/state.md` existe
- `projectDir/.eros/queue.md` tiene al menos un `[PENDING]`
- `claude` resuelve
- `projectDir` es writable

Si algo falla → pantalla 12.5 con `[O] abrir logs`, `[R] retry init`, `[Q] salir`.

## 7. Error handling

| Momento | Falla | Recovery |
|---|---|---|
| Wizard | URL inválida en references | Inline: borde rojo + mensaje · no avanza |
| Wizard | `Ctrl+C` a mitad | Prompt: "¿guardar draft en `~/.config/eros/draft.json`?" |
| Ejecución | `node init-project.mjs` exit ≠ 0 | Pantalla con últimas 20 líneas stderr + `[R]etry` `[O]pen log` `[E]dit intake` `[Q]uit` |
| Ejecución | `npm install` falla o timeout | `[S]retry` `[X]skip install y continuar` `[Q]abort` |
| Launch | `claude` no en PATH | Pantalla 13 degradada: solo `[c] copiar comando` |

**Principio:** ningún error sin mensaje accionable y copiable (`Ctrl+Y`).

## 8. v0.2 — TUI persistente (preview arquitectónico)

### 8.1 Home screen

Menú persistente con 6 items: `nuevo proyecto`, `resume`, `proyectos`, `memoria`, `templates`, `ajustes`. Sidebar izquierda, panel contextual derecho que muestra info del item hoverado. Footer: "Eros dice" con quote rotante del `personality.json`.

### 8.2 Watch mode

Tras lanzar Claude (con `tea.ExecProcess` en v0.2, no exit-and-exec), el TUI queda disponible para split o toggle vía `Ctrl+E`. Muestra en vivo:

- Progress de la queue (barra + sections done/total)
- Lista de sections con score y signature
- Última decisión (`decisions.md` tail)
- Última memoria escrita

Implementación: `fsnotify` sobre `.eros/queue.json` + `.eros/state.json` + `.eros/decisions.md`. Polling 500ms como fallback.

### 8.3 Memory inspector

Browse sobre `.eros/memory/design-intelligence/`:

- Lista de archivos con count + confidence HIGH
- Enter abre vista detalle con filtros (mood, confidence, fecha, proyecto)
- Feature clave: inspeccionar qué aprendió Eros entre sesiones

### 8.4 Compatibilidad con v0.1

La arquitectura de v0.1 no bloquea v0.2:

- `cli/internal/tui/wizard/` se instancia como sub-view desde `home/`
- `cli/internal/projects/` ya escanea `~/Desktop/` → lista del home viene gratis
- `tea.ExecProcess` reemplaza exit-and-exec sin tocar el wizard

## 9. Testing

### 9.1 Unit (Go)

- `brief.Serialize()` — round-trip JSON
- `projects.Scan()` — mock de filesystem con testdata
- `moods.Load()` — parseo del JSON exportado por Node
- `slugify()` — casos edge

### 9.2 Integration

- Fixture `testdata/fake-maqueta/` con scripts stub que loguean args y exitean 0
- Assert: wizard completo → `init-project.mjs` se llamó con flags correctos
- No ejecuta scaffold real; verifica contract

### 9.3 Golden (Bubble Tea)

- `teatest` de charmbracelet: inputs simulados → assert sobre vista renderizada
- 1 golden por pantalla crítica (splash, mood, summary, error)
- Detecta regresiones visuales sin screenshots

### 9.4 Coverage

- `internal/brief/`: 70%
- `internal/tui/`: 50% (vistas cambian mucho; no sobreajustar)

## 10. Build & distribución

```powershell
# Desarrollo
cd cli && go build -o bin/eros.exe ./

# Instalación (uno-shot)
.\scripts\install-cli.ps1
```

`install-cli.ps1`:

1. `go build` con version ldflag (commit hash + fecha)
2. Copia a `$env:LOCALAPPDATA\eros\bin\eros.exe`
3. Agrega a `PATH` del usuario
4. Verifica `eros --version`

`eros --version` imprime `eros 0.1.0 (commit abc123, built 2026-04-16)`.

Distribución futura: GitHub Releases, scoop bucket, homebrew tap. Fuera de scope ahora.

## 11. Dependencias Go (v0.1)

| Paquete | Uso |
|---|---|
| `github.com/charmbracelet/bubbletea` | framework TUI |
| `github.com/charmbracelet/lipgloss` | styling |
| `github.com/charmbracelet/bubbles` | componentes (spinner, list, textinput) |
| `github.com/spf13/cobra` | commands |
| `golang.design/x/clipboard` | copy al clipboard |
| (stdlib) `os/exec`, `encoding/json`, `path/filepath`, `fsnotify` (v0.2) | resto |

Total: 5 deps externas para v0.1.

## 12. Roadmap resumido

| Feature | v0.1 | v0.2 |
|---|---|---|
| Wizard completo (13 pantallas) | ✅ | |
| `eros list` / `resume` / `template` | ✅ | |
| Exit-and-exec launch | ✅ | |
| Mood preview panel | ✅ | |
| "Confidence from memory" hint en pantalla 4 | ✅ | |
| Home TUI persistente | | ✅ |
| Watch mode en vivo | | ✅ |
| Memory inspector | | ✅ |
| "Eros dice" quotes rotator | | ✅ |
| `tea.ExecProcess` handoff | | ✅ |

## 13. Decisiones cerradas (ex-preguntas abiertas)

Resueltas 2026-04-16 por decisión del diseñador del CLI ("hace lo que consideres mejores prácticas"):

1. **Pantalla 2 (slug) colapsada por default.** Solo se muestra si el slug derivado colisiona con un proyecto existente en `~/Desktop/`. Tecla `Ctrl+E` en pantalla 1 fuerza edición manual del slug. Razón: evitar preguntar dos veces por data derivable.
2. **Banned seeds v0.1: nombre + mini-descripción de 1 línea.** Preview ASCII del componente queda para v0.2. Razón: ship más chico, iterar.
3. **`EROS_MAQUETA_DIR` env var con fallback.** Orden de resolución: (1) env var `EROS_MAQUETA_DIR`, (2) `~/Desktop/Eros/`, (3) error con instrucción. Razón: 12-factor config, elimina hardcode.

## 14. Criterios de éxito (v0.1)

El CLI se considera éxito si Mateo puede:

1. Escribir `eros` en PowerShell y llegar al wizard sin fricción
2. Crear un proyecto end-to-end en menos de 2 minutos (vs ~15 min a mano hoy)
3. Lanzar Claude con el prompt correcto sin copiar comandos
4. Reusar un brief pasado con 3 teclas (`Ctrl+S` para guardar, selector al arrancar)

Y si al ver el wizard corriendo dice "esto se ve increíble" sin que le pregunten.
