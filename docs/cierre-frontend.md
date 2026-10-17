# Cierre del frontend web de Ágora

**Versión:** Fase 6

**Fecha de verificación:** 14 de agosto de 2026

**Estado:** frontend funcional y validado para demostración

**Tecnología:** React 19, TypeScript 6, Vite 8 y Tailwind CSS 4

## 1. Conclusión ejecutiva

El frontend web de Ágora completa el recorrido previsto para la prueba de
concepto: una persona parte de la landing, selecciona la skill disponible, crea
un proyecto, elige el idioma, conversa con un asistente para completar el
contexto, confirma la información, genera trece apartados mediante cinco agentes
simulados, revisa y aprueba cada resultado y ensambla un documento consolidado.
Después puede navegar la vista previa, simular la traducción, exportar y cerrar
el proyecto.

La Fase 6 no añadió nuevas promesas funcionales. Se concentró en cerrar el
frontend con calidad verificable: responsive real, accesibilidad estructural,
administración de foco, estados de carga y error, reducción del paquete inicial,
pruebas de recorrido completo y documentación de los límites técnicos.

Resultado de cierre: **17 pruebas automáticas aprobadas, 0 errores de TypeScript,
0 errores de lint, formato correcto, build de producción satisfactorio y 0
desbordamientos horizontales en los tres anchos validados**.

## 2. Alcance funcional entregado

### 2.1 Descubrimiento y creación

- Landing responsive con identidad visual Ágora, animaciones y respeto por
  `prefers-reduced-motion`.
- Catálogo de skills con estados “Disponible” y “Próximamente”.
- Creación de proyecto con formulario validado.
- Selección persistente de idioma español o inglés.

### 2.2 Captura y confirmación de contexto

- Conversación guiada para problema, población, ubicación, solución, resultados
  esperados y alcance inicial.
- Panel de contexto que se actualiza durante la conversación.
- Diagnóstico simulado de completitud y coherencia.
- Resumen editable y confirmación humana antes de generar contenido.

### 2.3 Orquestación y generación

- `ProjectOrchestrator` como máquina de estados del proceso.
- `FormulatorAgent` como coordinador de cinco agentes especializados.
- Generación progresiva de trece apartados.
- Indicadores visibles y accesibles del progreso.
- Persistencia de cada resultado apenas termina.

### 2.4 Revisión humana

- Navegación entre trece componentes.
- Conservación separada del texto inicial de IA y la versión vigente.
- Edición, guardado, sugerencias simuladas, regeneración y aprobación.
- Estados pendiente, modificado y aprobado.
- Avance automático al siguiente componente después de aprobar.
- Habilitación del ensamblaje únicamente cuando los trece componentes están
  aprobados.

### 2.5 Documento

- Verificación final de aprobaciones.
- Ensamblaje determinista sin reescribir contenido aprobado.
- Vista previa navegable por secciones.
- Menú de secciones desplegable en móvil y tableta.
- Traducción opcional simulada.
- Exportación simulada y finalización del proyecto.

## 3. Composición definitiva de agentes

| Agente | Responsabilidad | Apartados |
| --- | --- | --- |
| `ResearchAgent` | Fundamentación y evidencia | Marco teórico, estado del arte, planteamiento del problema, antecedentes y bibliografía |
| `IdeationAgent` | Planeación de la propuesta | Actividades, objetivos SMART y cronograma |
| `ImpactAgent` | Alcance social y resultados | Beneficiarios, riesgos e impactos esperados |
| `BudgetAgent` | Estructura financiera | Presupuesto |
| `MethodologyAgent` | Diseño de ejecución | Metodología |

El frontend no presenta estos agentes como sistemas autónomos reales. Son
implementaciones locales deterministas que respetan los límites de la futura
arquitectura multiagente.

## 4. Arquitectura aplicada

El código utiliza una separación inspirada en Clean Architecture, adaptada al
tamaño de la prueba de concepto:

```text
Interfaz (pages/components)
        ↓
Aplicación (hooks y casos de uso de cada feature)
        ↓
Dominio (tipos, estados, registro de componentes y validaciones)
        ↓
Infraestructura (AgoraApi, MockAgoraApi y localStorage)
```

Decisiones principales:

- Las páginas no acceden directamente a `localStorage`.
- `AgoraApi` define el contrato que consumen los hooks.
- `MockAgoraApi` es una implementación sustituible por una API HTTP.
- TanStack Query administra lecturas, mutaciones, cache e invalidaciones.
- Zustand queda reservado para estado puramente visual.
- React Router asigna una URL recargable a cada etapa.
- El ensamblador es determinista y no modifica el contenido aprobado.

Esta separación permite conectar posteriormente un backend sin rehacer las
pantallas ni alterar el flujo principal.

## 5. Mejoras específicas de la Fase 6

### 5.1 Rendimiento

Se implementó división de código por ruta con `React.lazy` y `Suspense`. Antes,
la aplicación generaba un único archivo JavaScript cercano a 586 KB y Vite
mostraba una advertencia por superar 500 KB. Después del ajuste:

- Paquete inicial JavaScript: **244,63 KB** sin comprimir.
- Paquete inicial comprimido: **77,19 KB gzip**.
- Pantallas pesadas separadas: revisión 21,91 KB, landing 16,00 KB y chat
  13,60 KB, entre otras.
- Build sin advertencia por tamaño de chunk.

### 5.2 Accesibilidad

- Enlace “Saltar al contenido”.
- Foco automático en el contenido principal al cambiar de ruta.
- Título del documento actualizado según la pantalla.
- Regiones de carga con `role="status"`, `aria-live` y `aria-busy`.
- Barras y anillo de progreso con `role="progressbar"`, valores mínimos,
  máximos y actuales.
- Etiquetas accesibles para botones únicamente icónicos.
- Controles todavía no implementados deshabilitados y anunciados como
  “disponible próximamente”.
- Animaciones desactivables con `prefers-reduced-motion`.
- Dos pruebas smoke con axe-core, sin violaciones estructurales detectadas. La
  regla de contraste se excluye en JSDOM porque no dispone de pintura real; el
  contraste debe seguir validándose visualmente o con una herramienta de
  navegador dedicada.

### 5.3 Responsive y UX

- Chat con altura basada en `100dvh` en móvil para evitar un lienzo forzado de
  44 rem.
- Pie fijo de revisión reorganizado en columnas en pantallas estrechas y reserva
  inferior suficiente para que no cubra contenido.
- Menú de secciones del documento operativo en tableta y móvil.
- Encabezado de workspace simplificado en 360 px.
- Ensamblaje apilado en móvil y alineado en dos columnas en escritorio.
- Objetivos táctiles de aproximadamente 44 px o más en acciones principales.

## 6. Estrategia y resultados de pruebas

### 6.1 Pruebas automáticas

| Área | Validación | Resultado |
| --- | --- | --- |
| Router | Landing, skills, rutas directas y página 404 | Aprobado |
| Proyecto | Creación, idioma y persistencia | Aprobado |
| Contexto | Conversación completa, diagnóstico y confirmación | Aprobado |
| Orquestación | Transiciones válidas del proyecto | Aprobado |
| Agentes | Distribución exacta de 13 apartados entre 5 agentes | Aprobado |
| Revisión | Edición, guardado, aprobación y avance automático | Aprobado |
| Documento | Ensamblaje de versiones aprobadas y orden estable | Aprobado |
| Recorrido E2E simulado | Generación hasta traducción, exportación y cierre | Aprobado |
| Accesibilidad | Landing y catálogo con axe-core | Aprobado |
| UI reutilizable | Variantes y estados de `AgoraButton` | Aprobado |

Resumen de Vitest:

```text
Test Files  6 passed (6)
Tests       17 passed (17)
```

### 6.2 Calidad estática y build

Comandos ejecutados con Node.js 24.19.0:

```bash
npm run format:check
npm run typecheck
npm run lint
npm test -- --run
npm run build
```

Todos finalizaron con código de salida 0. `npm install` también informó **0
vulnerabilidades conocidas** en las dependencias auditadas.

### 6.3 Validación en navegador real

Se usó el servidor local `http://127.0.0.1:5173/` y se inspeccionaron tamaños,
contenido visible, navegación y atributos semánticos.

| Perfil | Viewport | Pantallas | Desbordamiento horizontal |
| --- | ---: | --- | --- |
| Móvil | 360 × 800 | Landing, revisión y ensamblaje | No |
| Tableta | 768 × 1024 | Documento consolidado y menú de secciones | No |
| Escritorio | 1440 × 900 | Workspace de revisión | No |

Verificaciones adicionales:

- La landing muestra el H1 correcto y el enlace de salto.
- El anillo de revisión expone valor y texto de progreso.
- El encabezado ofrece ayuda real y marca los controles futuros como
  deshabilitados.
- El ensamblaje muestra trece apartados y su acción principal.
- El menú de contenido es visible después de activarlo en tableta.
- El foco activo termina en `main#main-content` después de navegar.

## 7. Estados de interfaz cubiertos

- Carga inicial y carga por ruta.
- Operación pendiente de conversación, diagnóstico, generación, guardado,
  aprobación y ensamblaje.
- Error recuperable con mensaje y reintento cuando corresponde.
- Contenido vacío o pendiente.
- Contenido generado, modificado y aprobado.
- Proyecto incompleto, listo para ensamblar y finalizado.
- Controles deshabilitados por reglas del flujo.

## 8. Límites conocidos y trabajo de backend pendiente

El cierre corresponde exclusivamente al frontend. Todavía no existen:

- Backend HTTP, base de datos MongoDB ni autenticación.
- Conexión real con OpenAI u otro proveedor de modelos.
- Ejecución distribuida de agentes o colas de trabajo.
- Gestión real de notificaciones o menú de cuenta.
- Generación binaria real de DOCX/PDF desde el producto.
- Citación académica automática validada contra fuentes externas.
- Traducción profesional real.

Estos límites se comunican en la interfaz cuando afectan una acción. No deben
interpretarse como defectos ocultos de la entrega frontend.

## 9. Recomendaciones para la integración futura

1. Implementar una clase `HttpAgoraApi` que cumpla el contrato existente.
2. Configurar una variable de entorno para escoger entre mock y backend.
3. Mantener los estados y transiciones definidos en el dominio compartido.
4. Usar respuestas estructuradas y versionadas para cada agente.
5. Persistir por separado el borrador de IA, la versión humana y la aprobación.
6. Añadir autenticación, autorización por proyecto y auditoría de cambios.
7. Ejecutar pruebas de contrato entre frontend y backend.
8. Incorporar pruebas E2E con un entorno de integración estable.
9. Ejecutar Lighthouse y una revisión WCAG con contraste calculado en navegador.
10. Generar DOCX/PDF en servidor y validar los archivos resultantes.

## 10. Criterio de cierre

El frontend queda cerrado para demostración porque el recorrido completo es
navegable, persistente y verificable; las reglas principales tienen pruebas; el
build de producción es satisfactorio; las pantallas clave responden en móvil,
tableta y escritorio; y las responsabilidades que pertenecen al backend están
separadas y documentadas.

La entrega está preparada para la siguiente etapa: integrar servicios reales
sin sustituir la experiencia, la estructura de rutas ni el contrato funcional
ya validado.
