# Rebrand — Transfer Efecty

Registro de la decisión de marca tomada durante el desarrollo de v2, para no
perder el contexto de por qué el nombre/paleta cambió a mitad de proyecto.

## Qué cambió

- **Nombre visible en la UI**: "Global Efecty" → "Transfer Efecty" (sidebar,
  landing, metadata, emails de seed/demo, `platform_settings.site_name`).
- **Dominio de producción**: `transferefecty.com` (antes `globalefecty.com`,
  que sigue siendo el dominio de la v1 en `www/`).
- **Paleta**: de oscuro violeta/magenta/cian → **claro, azul→cian**, tomada
  del logo compartido por el cliente (wallet + flecha, wordmark en degradado
  azul-cian sobre fondo blanco).
- **Estética**: se agregó un efecto "glitch" (RGB split sutil en hover/focus)
  para el wordmark y titulares — ver `.ge-glitch` en `src/app/globals.css` y
  `src/components/motion/glitch-text.tsx`.
- **Motion**: se instaló `framer-motion` y se agregaron primitivas
  reutilizables (`src/components/motion/`) — entradas fade-in, stagger de
  grids, hover en cards/botones.

## Por qué los nombres de variable CSS no cambiaron

`--ge-magenta`, `--ge-violet`, etc. siguen existiendo en
`src/app/globals.css`, pero ahora apuntan a valores **azules** — se
remapearon los hex en un solo lugar en vez de renombrar la variable y tocar
cada componente que la usa. Si en algún momento se quiere limpiar la
nomenclatura (`--ge-violet` ya no es violeta), es un rename mecánico
buscar/reemplazar, no una reescritura.

## Precisión del color — pendiente

La paleta actual (`#1D4ED8` → `#2563EB` → `#22D3EE`) es una aproximación
visual al logo compartido en el chat, no un muestreo exacto de píxeles. Si
el cliente entrega el archivo de logo real (PNG/SVG) dentro del proyecto —
por ejemplo en `marca/logo/` o `v2/public/brand/` — se puede recalibrar el
degradado exacto en un solo lugar (`globals.css`) y regenerar el favicon
(`src/app/icon.svg`, hoy una aproximación del ícono de wallet+flecha) a
partir del archivo real.

## Qué NO se tocó

- `www/` (v1) sigue con la marca y dominio anteriores — es el sitio en
  producción hoy, no se toca hasta el corte.
- `docs/MIGRACION-DATOS.md` sigue refiriendo `globalefecty.com` porque
  describe la migración *desde* esa base de datos real.
- `marca/`, `brand/`, `assets/` (manual de marca fuente del proyecto) no se
  modificaron — si el rebrand es definitivo, valdría la pena actualizarlos
  también más adelante para que quede una sola fuente de verdad.
