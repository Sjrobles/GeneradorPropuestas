# Arquitectura del frontend de Ágora

## Estado

La Fase 1 establece la base técnica de la aplicación web. Todavía no implementa
el flujo funcional con datos mock; ese trabajo comienza en la Fase 2.

## Arquitectura

El frontend es una SPA (Single Page Application) web construida con React y
Vite. React Router mantiene una URL independiente para cada etapa del proyecto.
Esto permite abrir o recargar una pantalla sin depender exclusivamente del
estado en memoria.

La estructura se organiza por funcionalidades. Los componentes exclusivos de
una funcionalidad permanecen dentro de su carpeta y los componentes realmente
compartidos viven en `src/components`.

```text
src/
├── app/          # Router, providers y estilos globales
├── components/   # UI, layout y estados reutilizables
├── features/     # Funcionalidades del producto
├── lib/          # Utilidades sin estado
├── services/     # Contratos de acceso a datos
├── stores/       # Estado local de interfaz
├── test/         # Configuración transversal de pruebas
└── types/        # Contratos del dominio
```

## Estado y datos

TanStack Query administrará los datos provenientes de la MockAPI y posteriormente
del backend. Una **query** representa una lectura asíncrona; una **mutation**,
una operación que modifica datos; y la **cache** conserva resultados para evitar
solicitudes duplicadas y mantener la interfaz sincronizada.

Zustand se reserva para estado puramente visual. No debe copiar proyectos,
componentes ni documentos que ya pertenezcan a TanStack Query.

`AgoraApi` es el contrato que separa la interfaz de la fuente de datos. En las
siguientes fases tendrá una implementación mock. Más adelante podrá sustituirse
por HTTP sin reescribir las páginas.

## Providers

Un **provider** es un componente React que hace disponible una configuración a
todo el árbol de componentes. `AppProviders` crea y expone el `QueryClient` de
TanStack Query.

## Sistema visual

Los tokens de color, espaciado, tipografía, radios y sombras están en
`src/app/styles/tokens.css`. La paleta se deriva visualmente del Figma público y
se expresa mediante nombres semánticos como `primary`, `warning` y `border`.

Tailwind CSS 4 consume estos tokens. `components.json` deja shadcn/ui preparado
para incorporar sólo los componentes que sean necesarios. `AgoraButton`
demuestra el patrón de variantes reutilizables.

La aplicación es web responsive:

- Desktop es la experiencia principal.
- Tablet reorganiza paneles y espacios.
- Móvil apila el contenido y mantiene objetivos táctiles de al menos 44 px.
- No se utiliza React Native ni se construye una aplicación móvil nativa.

## Rutas

```text
/
/skills
/projects/new
/projects/:projectId/language
/projects/:projectId/chat
/projects/:projectId/context
/projects/:projectId/generation
/projects/:projectId/review
/projects/:projectId/components/:componentId
/projects/:projectId/document/assemble
/projects/:projectId/document
/projects/:projectId/translation
/projects/:projectId/export
/projects/:projectId/complete
```

En la Fase 1 las rutas futuras muestran estados informativos. Sus pantallas se
reemplazarán incrementalmente sin cambiar las URLs.

## Dependencias principales

- React: interfaz declarativa.
- React Router: navegación web.
- TanStack Query: datos asíncronos y cache.
- Zustand: estado temporal de interfaz.
- React Hook Form y Zod: formularios y validación.
- Tailwind CSS y shadcn/ui: sistema visual.
- Lucide: iconografía.
- Vitest y Testing Library: pruebas de comportamiento.
- ESLint y Prettier: calidad y formato.

## Ejecución

```bash
cd frontend
npm install
npm run dev
```

Vite mostrará la URL local disponible.

## Verificación

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run format:check
```

## Decisiones

- Node 24 LTS evita incompatibilidades con Vite 8, ESLint 10 y jsdom.
- TypeScript 6 se mantiene dentro del rango admitido por typescript-eslint.
- React Router usa rutas reales desde el bootstrap.
- No se introduce Redux.
- No se implementan backend, autenticación, agentes ni llamadas a OpenAI en esta
  fase.
