# Orquestación multiagente e intervención humana

## Orden de ejecución

```text
ResearchAgent
  → IdeationAgent
  → nueve respuestas obligatorias del usuario
  → MethodologyAgent
  → BudgetAgent
  → ImpactAgent
```

La pausa posterior a Ideación es un estado persistido del proyecto. Metodología
y Presupuesto no pueden ejecutarse hasta que las respuestas hayan sido
confirmadas.

## Regla arquitectónica

El orquestador controla el proceso, los agentes realizan tareas especializadas y
el código tradicional se ocupa de estados, persistencia y validaciones
estructurales. En modo backend, NestJS ejecuta los agentes mediante OpenAI
Agents SDK y persiste las salidas en MongoDB. El modo mock mantiene el mismo
contrato para pruebas y desarrollo aislado.

## ProjectOrchestrator

`ProjectOrchestrator` combina una secuencia determinista de agentes con estados
persistidos. El corte de intervención humana utiliza:

```text
CONTEXT_CONFIRMED
→ GENERATING_COMPONENTS
→ WAITING_EXECUTION_DETAILS
→ EXECUTION_DETAILS_CONFIRMED
→ GENERATING_COMPONENTS
→ VALIDATING_COMPONENTS
→ WAITING_REVIEW
```

Un proyecto no puede saltar directamente desde contexto confirmado hasta
revisión.

## FormulatorAgent y subagentes

`FormulatorAgent` coordina, pero no redacta todos los componentes con un único
prompt. Delega según un registro estable:

| Subagente          | Componentes                                                                              |
| ------------------ | ---------------------------------------------------------------------------------------- |
| `ResearchAgent`    | Marco teórico, estado del arte, planteamiento del problema, antecedentes y bibliografía. |
| `IdeationAgent`    | Actividades, objetivos SMART y cronograma.                                               |
| `MethodologyAgent` | Metodología, fases, productos y relación con los objetivos.                              |
| `BudgetAgent`      | Presupuesto.                                                                             |
| `ImpactAgent`      | Beneficiarios, riesgos e impactos esperados.                                             |

Los cinco agentes generan 13 apartados. Los borradores usan exclusivamente el
contexto confirmado. `ResearchAgent` señala la necesidad de fuentes y no
inventa autores, DOI, estadísticas o citas. Antes de ejecutar `BudgetAgent`, un
subagente recopila referencias de mercado vigentes para Colombia. El presupuesto
confirma precios respaldados por esa evidencia o por datos económicos del
usuario, y puede derivar cantidades y duraciones desde actividades, metodología
y cronograma. Cuando falta una especificación exacta, utiliza un escenario
técnico conservador y marca el valor como estimado; ningún ítem ni el total
general pueden quedar pendientes o nulos.

`IdeationAgent` normaliza los identificadores de actividad con la nomenclatura
jerárquica objetivo.actividad: `1.1`, `1.2`, `2.1`, `2.2` y así sucesivamente.
El cronograma, la metodología y los agentes posteriores reciben esos mismos
identificadores.

`BudgetAgent` usa el prompt maestro V2.3 y cada ítem conserva identificadores y
textos legibles de objetivo y actividad, rubro, descripción concreta, costo
unitario, unidad, cantidad y total. El componente visible se construye como una
tabla Markdown con esas ocho columnas; la revisión, la vista consolidada y las
exportaciones DOCX/PDF la representan como una tabla real. La regeneración
aislada de Presupuesto reutiliza Investigación, Ideación y Metodología ya
persistidos, se detiene después de Budget y no vuelve a ejecutar Impacto.
Durante la revisión, el presupuesto también puede descargarse como un libro
`.xlsx` con una pestaña por rubro. Al reimportarlo, el backend valida las ocho
columnas, recupera la relación con objetivos y actividades, recalcula cada
total como cantidad por costo unitario y persiste la tabla reconstruida para el
documento final.

Las salidas usan contratos JSON estrictos. Si OpenAI devuelve una respuesta
truncada o fuera del esquema, el ejecutor realiza hasta dos reintentos
correctivos. Cuando un proyecto queda en `ERROR`, la recuperación conserva las
salidas persistidas y se reanuda desde el primer agente pendiente, sin repetir
Investigación, Ideación ni Metodología.

## Revisión humana

Cada componente conserva dos valores:

- `aiGeneratedContent`: borrador original generado por el agente o el mock.
- `currentContent`: versión vigente que puede editar el usuario.

Cuando el usuario guarda, el estado pasa a `MODIFIED`; al aprobar, pasa a
`APPROVED`. La versión manual nunca se reemplaza silenciosamente por la versión
generada.

## Modos de ejecución

Las pantallas consumen el contrato `AgoraApi`. `BackendAgoraApi` conecta la
generación real y `MockAgoraApi` reproduce el flujo local, incluida la pausa de
nueve preguntas, sin obligar a reescribir la interfaz.
