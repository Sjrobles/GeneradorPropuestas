# Guía para el segundo informe del proyecto

En el segundo informe se reflejará el trabajo desarrollado durante el semestre y se avanzará hacia una estructura más formal y cercana a la versión final del documento​
​
Por esta razón, cada componente deberá desarrollarse con un mínimo de tres párrafos, con el fin de asegurar el nivel de profundidad y coherencia esperado en un informe final.

## Resumen / Abstract

La formulación de proyectos de Ciencia, Tecnología e Innovación —CTeI— requiere transformar una idea inicial en una propuesta estructurada cuyos componentes mantengan coherencia entre el problema identificado, los antecedentes, los objetivos, las actividades, la metodología, el cronograma, el presupuesto, los beneficiarios, los riesgos y los impactos esperados. Para estudiantes universitarios con experiencia limitada en formulación, este proceso representa una dificultad debido a la necesidad de identificar qué información se requiere, organizarla técnicamente, mantener relaciones lógicas entre los diferentes apartados y superar la denominada barrera de la “hoja en blanco”.

Como respuesta a esta problemática se desarrolla Ágora, una aplicación web con características de Producto Mínimo Viable —MVP— que utiliza inteligencia artificial generativa y un sistema multiagente especializado para acompañar al usuario desde la definición inicial de su idea hasta la obtención de un documento estructurado de proyecto CTeI. La solución integra recopilación guiada de información, generación mediante inteligencia artificial, revisión humana, edición de componentes, persistencia del progreso, ensamblaje documental, traducción del español al inglés y exportación del resultado.

El alcance funcional inicialmente planteado evolucionó durante el proceso de desarrollo. En su estado actual, Ágora genera trece apartados: marco teórico, estado del arte, planteamiento del problema, antecedentes, bibliografía, actividades, objetivos SMART, cronograma, metodología, presupuesto, beneficiarios, riesgos e impactos esperados. El documento consolidado generado por la plataforma evidencia expresamente esta estructura de trece componentes.

El sistema emplea un orquestador encargado de coordinar los agentes especializados. La formulación se distribuye funcionalmente entre agentes orientados a investigación, ideación, metodología, presupuesto e impactos. Adicionalmente, se incorporó un agente traductor para transformar el documento consolidado del español al inglés. El flujo actual utiliza OpenAI desde un backend modular construido en NestJS y almacena usuarios, proyectos, contexto, estados, resultados generados y contenido editado en MongoDB.

Durante el desarrollo también se identificó la necesidad de obtener información adicional antes de generar la metodología y el presupuesto. Como consecuencia, se incorporó una etapa de preguntas de ejecución que permite recoger información relacionada con las condiciones reales del proyecto antes de continuar con dichos componentes. La interfaz evaluada contempla nueve preguntas asociadas con esta etapa, buscando mantener trazabilidad entre objetivos, actividades, metodología y presupuesto. Asimismo, se reestructuró el prompt correspondiente al agente de presupuesto para mejorar la relación entre actividades, necesidades, recursos y costos.

Actualmente, los agentes se encuentran funcionando y la fase principal del proyecto se concentra en pruebas funcionales, pruebas de usabilidad, corrección de incidencias y estabilización. Se han realizado ejercicios con usuarios y una evaluación comparativa entre el prototipo original desarrollado en Figma y la interfaz implementada. Esta evaluación favoreció a la versión implementada en seis de ocho criterios y obtuvo una valoración ponderada de 84,3 sobre 100 frente a 66,4 del prototipo; sin embargo, el propio estudio aclara que se trata de una evaluación experta comparativa y no de un experimento estadístico de producción.

Los resultados de las pruebas han producido modificaciones concretas en frontend y backend, entre ellas la reorganización del flujo de inicio de sesión, solución de problemas de lentitud durante el acceso, ajustes en el espacio entre botones, incorporación de mecanismos para regresar a pantallas anteriores y al inicio, persistencia del progreso cuando el usuario abandona temporalmente un proyecto, establecimiento de límites para las regeneraciones y delimitación de la cantidad de objetivos generados.

El estado actual permite afirmar que el núcleo funcional del MVP se encuentra implementado y que el proyecto se encuentra en una fase de validación y mejora continua. Las actividades pendientes se concentran principalmente en continuar las pruebas, documentar sistemáticamente los resultados, estabilizar el producto, medir el comportamiento bajo carga y ejecutar las mejoras arquitectónicas que resulten justificadas por evidencia empírica.

**Abstract**

The formulation of Science, Technology and Innovation —STI— projects requires transforming an initial idea into a structured proposal in which the problem, background, objectives, activities, methodology, schedule, budget, beneficiaries, risks and expected impacts remain logically connected. For university students with limited project-formulation experience, this process may be difficult because they need to identify the required information, organize it technically and overcome the initial “blank page” barrier.

To address this problem, Ágora has been developed as a web-based Minimum Viable Product supported by generative artificial intelligence and a specialized multi-agent system. The platform guides users from the initial description of an idea to the production of a structured STI project document through guided information collection, AI-based generation, human review, editing, persistence, document assembly, Spanish-to-English translation and document export.

The current system generates thirteen mandatory components: theoretical framework, state of the art, problem statement, background, bibliography, activities, SMART objectives, schedule, methodology, budget, beneficiaries, risks and expected impacts.

The application currently integrates a React/Vite frontend, a modular NestJS backend, MongoDB persistence and OpenAI-based generative services. Five specialized formulation agents are coordinated by an orchestrator and complemented by a translation agent. An additional information-collection step has also been introduced before methodology and budget generation in order to obtain more realistic execution data.

At the current stage, the core multi-agent flow is operational and the project is focused on functional validation, usability testing, interface improvements and system stabilization. User tests and comparative interface evaluations have already produced changes in both frontend and backend components.

The project therefore has evolved from an initial proof-of-concept design into a functional MVP currently undergoing iterative validation. Remaining work focuses on continued testing, performance measurement, documentation of evidence and architectural reinforcement for future pilot-scale operation.

## 1. Introducción

La formulación de proyectos de Ciencia, Tecnología e Innovación constituye una actividad fundamental en ambientes universitarios, investigativos y de emprendimiento, debido a que permite transformar necesidades, problemáticas, oportunidades e ideas preliminares en iniciativas estructuradas susceptibles de ser analizadas, evaluadas y posteriormente implementadas.

Formular un proyecto no consiste únicamente en escribir diferentes secciones. Requiere establecer relaciones lógicas entre cada una de ellas. El problema identificado debe justificar los objetivos; los objetivos deben traducirse en actividades verificables; las actividades deben organizarse dentro de una metodología y un cronograma; el presupuesto debe responder a los recursos realmente necesarios para ejecutar dichas actividades; y los impactos esperados deben guardar correspondencia con el alcance de la intervención. Para estudiantes con experiencia limitada, esta articulación representa una dificultad importante. Una persona puede reconocer claramente una problemática o contar con una idea potencialmente valiosa y, aun así, desconocer cómo estructurarla dentro de un proyecto formal.

Esta dificultad se relaciona con la denominada barrera de la hoja en blanco. En Ágora, esta expresión no se interpreta únicamente como una dificultad de redacción, sino como la ausencia de una estructura inicial que permita transformar información dispersa en una secuencia organizada de decisiones de formulación. Los avances recientes en inteligencia artificial generativa ofrecen nuevas posibilidades para atender esta situación. Los modelos de lenguaje pueden interpretar información, producir textos, organizar conceptos, transformar contenido y mantener contexto entre diferentes interacciones. No obstante, el uso directo de asistentes generales exige que el usuario conozca qué debe preguntar, qué estructura debe solicitar y cómo evaluar posteriormente la calidad de las respuestas.

Ágora parte de una aproximación diferente. En lugar de proporcionar únicamente un campo abierto para interactuar con un modelo de lenguaje, organiza el proceso mediante un flujo guiado de formulación. El usuario proporciona inicialmente información sobre su idea; el sistema identifica y organiza el contexto; posteriormente los agentes especializados generan diferentes componentes; el usuario revisa, modifica y aprueba los contenidos; finalmente, el sistema los integra dentro de un documento consolidado. Durante el desarrollo, este modelo se amplió hasta alcanzar trece apartados estructurales. El sistema actualmente genera marco teórico, estado del arte, planteamiento del problema, antecedentes, bibliografía, actividades, objetivos SMART, cronograma, metodología, presupuesto, beneficiarios, riesgos e impactos esperados. El documento de prueba generado por Ágora confirma la producción integral de dichos apartados.

Adicionalmente, el proyecto evolucionó desde una arquitectura frontend inicialmente simulada hacia una solución con backend real, persistencia, autenticación e integración con inteligencia artificial. La arquitectura actual está compuesta por un frontend React/Vite, un backend modular en NestJS, MongoDB como mecanismo de persistencia y OpenAI como proveedor de IA. El proyecto ya no se encuentra únicamente en una fase de diseño conceptual. El núcleo funcional está implementado y el esfuerzo actual se concentra en validar su comportamiento, mejorar la experiencia del usuario, corregir incidencias e identificar las condiciones técnicas necesarias para una futura operación piloto.

**1.1 Justificación** 
La pertinencia de Ágora puede analizarse desde dimensiones académicas, prácticas y tecnológicas.

Desde la perspectiva académica, disminuir la barrera inicial de formulación puede permitir que los estudiantes concentren una mayor parte de su esfuerzo en comprender, revisar y mejorar sus ideas. La herramienta no pretende eliminar el trabajo intelectual del estudiante, sino proporcionarle una estructura inicial susceptible de revisión.

La relevancia académica también radica en la posibilidad de hacer visibles las relaciones entre componentes. En lugar de generar de forma completamente independiente un problema, unos objetivos, una metodología y un presupuesto, Ágora busca mantener una cadena de información común que permita que los apartados posteriores utilicen decisiones previamente establecidas.

Esto es especialmente importante para metodología y presupuesto. Durante las pruebas se identificó que la generación de estos componentes requería información operativa adicional. Como consecuencia, se incorporó un espacio de preguntas antes de continuar con estos apartados, de manera que el usuario pueda proporcionar datos relacionados con las condiciones reales de ejecución.

Desde una perspectiva práctica, Ágora permite transformar una idea preliminar en un documento organizado sin obligar al usuario a conocer previamente la totalidad de los componentes o a diseñar por sí mismo todas las instrucciones necesarias para interactuar con una IA generalista.

La plataforma también proporciona continuidad. El usuario puede abandonar temporalmente un proyecto y conservar su progreso, regresar posteriormente, revisar los contenidos generados y continuar desde el punto correspondiente.

Desde la perspectiva tecnológica, Ágora constituye un caso aplicado para evaluar la integración de sistemas multiagente, modelos generativos, persistencia, revisión humana, traducción, generación documental y procesos de validación dentro de un mismo producto.

Su valor no depende de desarrollar un nuevo modelo de lenguaje, sino de diseñar una orquestación especializada que convierta tecnologías existentes en una experiencia específica para formulación de proyectos CTeI.

Por estas razones, el proyecto posee relevancia académica y aplicada: busca disminuir una barrera real del proceso inicial de formulación, mantener al usuario como responsable del contenido final y generar evidencia sobre la viabilidad y limitaciones de utilizar IA generativa como apoyo dentro de este contexto.

## 2. Marco conceptual

El desarrollo de Ágora requiere articular conceptos provenientes de la formulación de proyectos, la ingeniería de software y la inteligencia artificial. Estos fundamentos permiten comprender tanto el problema abordado como las decisiones adoptadas durante el diseño de la solución.

**Ciencia, Tecnología e Innovación —CTeI—**

Los proyectos CTeI constituyen iniciativas estructuradas destinadas a generar, aplicar, adaptar o transferir conocimiento, tecnologías, procesos o soluciones frente a necesidades y oportunidades determinadas. Su formulación requiere establecer de manera coherente componentes como problema, objetivos, antecedentes, metodología, población beneficiaria, resultados e impactos.

Ágora no pretende implementar una metodología institucional completa de formulación CTeI. Su alcance corresponde a la construcción de un borrador inicial que permita organizar los elementos fundamentales de una propuesta antes de una revisión especializada.

**Inteligencia artificial generativa**

La inteligencia artificial generativa comprende sistemas capaces de producir contenido nuevo a partir de patrones identificados durante su entrenamiento y del contexto proporcionado durante una interacción. Dentro del proyecto, esta tecnología se empleará principalmente para interpretar información textual, formular preguntas de aclaración, estructurar contenido y generar borradores.

Su utilización implica limitaciones relacionadas con la precisión, la reproducibilidad y la posibilidad de producir información incorrecta o no sustentada. Por esta razón, Ágora adopta un esquema de revisión humana obligatoria antes de considerar aprobado un componente.

**Modelos de lenguaje de gran tamaño —LLM—**

Los Large Language Models son modelos capaces de procesar y generar lenguaje natural. Dentro de Ágora se utilizará al menos un LLM accesible mediante servicios de integración para apoyar las tareas de diagnóstico y generación.

El modelo no tendrá autonomía absoluta sobre el contenido. Sus respuestas estarán condicionadas por instrucciones estructuradas, información suministrada por el usuario, plantillas asociadas a cada componente y reglas definidas desde la aplicación.

**Sistemas multiagente**

Un sistema multiagente distribuye una tarea compleja entre diferentes componentes especializados. En Ágora, el concepto de agente será utilizado desde una perspectiva funcional: cada agente contará con responsabilidades, entradas y salidas delimitadas y será coordinado mediante un mecanismo de orquestación.

Para el MVP se contemplan cuatro responsabilidades principales:

contexto y diagnóstico;
formulación;
ensamblaje y verificación;
traducción, en caso de alcanzar esta funcionalidad complementaria.

El hecho de denominar estos módulos “agentes” no significa que deban operar como entidades completamente autónomas. La arquitectura busca principalmente separar responsabilidades y facilitar el control del flujo.

**Orquestación**

La orquestación corresponde al mecanismo encargado de determinar qué componente debe intervenir en cada etapa y qué información será transmitida entre ellos. Su función es mantener un recorrido controlado y evitar que cada agente funcione de manera aislada.

El orquestador deberá garantizar que la generación solamente ocurra cuando exista información mínima suficiente y que el ensamblaje utilice las versiones más recientes guardadas por el usuario.

**Human-in-the-loop**

El enfoque human-in-the-loop mantiene a una persona dentro del proceso de decisión y validación de los resultados producidos mediante inteligencia artificial.

En Ágora, este principio se materializa en la posibilidad de visualizar, editar, guardar y aprobar individualmente cada componente. Por consiguiente, la salida generada por inteligencia artificial será tratada como una propuesta inicial y no como contenido definitivo.

**Producto Mínimo Viable —MVP—**

Para este proyecto, el MVP se entiende como la versión mínima funcional que permite demostrar el valor central de Ágora y ejecutar completamente el recorrido propuesto.

Por tanto, una funcionalidad pertenece al MVP obligatorio cuando su ausencia impide demostrar el flujo comprendido entre el ingreso de una idea y la obtención de un documento revisado y exportable.

No se consideran parte del MVP aquellas funcionalidades que mejoren la experiencia pero cuya ausencia no impida demostrar ese recorrido, como paneles administrativos, colaboración en tiempo real, historial avanzado de versiones o selección entre múltiples proveedores de inteligencia artificial.

**Arquitectura monolítica modular**

Una arquitectura monolítica modular concentra la aplicación dentro de una misma unidad de despliegue, pero organiza internamente las responsabilidades mediante módulos desacoplados.

Esta arquitectura resulta apropiada para el alcance académico del proyecto porque reduce la complejidad operativa frente a un esquema de microservicios, conservando al mismo tiempo separación entre interfaz, servicios, persistencia, integración con IA y ensamblaje documental.

**Completitud y coherencia**

La completitud corresponde a la existencia de la información y de los componentes mínimos requeridos.

La coherencia, para efectos del MVP, se entenderá como la existencia de relaciones lógicas básicas entre determinados componentes. Entre ellas se evaluarán principalmente:

correspondencia entre problema y objetivo general;
relación entre objetivo general y objetivos específicos;
presencia de población beneficiaria;
existencia de actividades o fases metodológicas;
relación general entre solución e impactos;
ausencia de componentes vacíos.

Estas comprobaciones tendrán un alcance básico y no equivaldrán a una evaluación de calidad científica.

**Usabilidad**

La usabilidad representa el grado en que una persona puede comprender y completar el flujo propuesto con un nivel razonable de facilidad.

La validación del MVP considerará especialmente la claridad de las preguntas, la navegación entre componentes, la edición del contenido y la capacidad de completar el recorrido sin asistencia directa del equipo desarrollador.

## 3. Planteamiento del problema


### 3.1 Descripción del problema

Los estudiantes universitarios interesados en formular proyectos de Ciencia, Tecnología e Innovación pueden identificar problemas, necesidades u oportunidades y, sin embargo, enfrentar dificultades para convertir dichas ideas en propuestas estructuradas.

La formulación requiere determinar qué información debe recopilarse, cómo debe organizarse y qué relaciones deben conservarse entre los diferentes componentes.

La dificultad se incrementa porque algunos apartados dependen de información previamente definida. Los objetivos deben responder al problema; las actividades deben materializar los objetivos; el cronograma debe organizar temporalmente las actividades; la metodología debe describir cómo serán ejecutadas; y el presupuesto debe representar los recursos realmente necesarios para su desarrollo.

Entre las principales causas del problema se identifican:

experiencia limitada en formulación;
desconocimiento de la estructura de proyectos;
dificultad para identificar información faltante;
problemas para relacionar los diferentes componentes;
necesidad de orientación metodológica;
barrera inicial de la hoja en blanco;
dependencia de conocimientos previos para utilizar adecuadamente asistentes de IA de propósito general.

La consecuencia puede ser la construcción de propuestas incompletas, componentes poco relacionados entre sí, tiempos elevados para obtener una primera versión o abandono temprano de ideas que podrían ser sometidas a revisión académica.

El problema central se define como:

**Los estudiantes universitarios presentan dificultades para transformar ideas iniciales en propuestas estructuradas y coherentes de proyectos de Ciencia, Tecnología e Innovación, debido a la limitada experiencia en formulación, la dificultad para identificar y relacionar la información necesaria y la ausencia de un mecanismo guiado que acompañe progresivamente la construcción de sus componentes.**

El problema no se plantea como ausencia de inteligencia artificial disponible. Existen herramientas generativas de propósito general. La brecha identificada corresponde a la necesidad de transformar dichas capacidades en un proceso especializado de formulación.

### 3.2 Restricciones y supuestos de diseño

El desarrollo y funcionamiento del MVP considera las siguientes restricciones y supuestos:

| Categoría | Restricción o supuesto | Implicación |
|---|---|---|
| Tiempo | El proyecto se desarrolla dentro de un periodo académico limitado. | Las funcionalidades críticas tienen prioridad sobre las mejoras secundarias. |
| Equipo | El desarrollo es realizado por un equipo reducido. | Se evita introducir complejidad distribuida innecesaria. |
| Inteligencia artificial | El sistema depende de un proveedor externo de modelos generativos. | Los fallos, las cuotas o la latencia de OpenAI pueden afectar la generación o traducción. |
| Costos | El uso del modelo genera costos relacionados con solicitudes y tokens. | Deben controlarse las regeneraciones y el consumo innecesario. |
| Calidad de salida | Una salida generada puede contener errores, inferencias o información no verificada. | Se mantiene la revisión humana y el resultado se presenta como borrador. |
| Disponibilidad del proveedor | El sistema no controla la disponibilidad total de OpenAI. | Deben implementarse mecanismos de manejo de errores y, progresivamente, reintentos y desacoplamiento. |
| Reproducibilidad | Una misma entrada puede generar variaciones. | Las pruebas deben evaluar la estructura y coherencia, no la igualdad textual exacta. |
| Contexto | La calidad depende de la información proporcionada por el usuario. | Se incorporan preguntas complementarias cuando hacen falta datos. |
| Metodología y presupuesto | No deben generarse únicamente a partir de supuestos del modelo. | Se incorporó una fase previa de preguntas sobre la ejecución. |
| Usuarios | La validación actual se realiza con grupos reducidos. | Los resultados aún no representan una validación estadísticamente generalizable. |
| Arquitectura | La aplicación actual ejecuta la generación multiagente dentro del ciclo asociado al backend. | Puede producir problemas de saturación o tiempo de espera cuando aumente la concurrencia. |
| Conectividad | La aplicación requiere conexión a internet. | No se contempla la operación sin conexión. |
| Validación académica | Ágora no certifica que el proyecto sea viable o esté científicamente aprobado. | La revisión especializada continúa siendo necesaria. |
| Bibliografía | La generación de referencias requiere verificación humana. | El usuario debe comprobar la existencia, pertinencia y exactitud de las fuentes. |
| Escalabilidad | El sistema se encuentra en etapa de MVP o piloto. | La alta disponibilidad masiva aún no constituye una capacidad demostrada. |
| Usuarios de prueba | Su disponibilidad puede afectar el número y ritmo de las pruebas. | La evaluación continuará durante la etapa de estabilización. |

### 3.3 Alcance actualizado

El alcance inicial fue modificado conforme avanzó el desarrollo.

La versión actual de Ágora comprende un MVP funcional en fase de validación y estabilización.

**Componentes obligatorios del MVP**

El sistema genera los siguientes trece apartados:

- Marco teórico.
- Estado del arte.
- Planteamiento del problema.
- Antecedentes.
- Bibliografía.
- Actividades.
- Objetivos SMART.
- Cronograma.
- Metodología.
- Presupuesto.
- Beneficiarios.
- Riesgos.
- Impactos esperados.

La generación de estos trece apartados ya se evidencia en los documentos consolidados producidos por Ágora. El cronograma, por ejemplo, incluye objetivos, actividades, inicio, fin, duración, dependencias y entregables, demostrando que algunos componentes comprenden información estructurada adicional al texto narrativo.

El presupuesto constituye igualmente un componente independiente y se construye vinculando objetivos, actividades, rubros, descripciones, costos unitarios, cantidades y totales.

Funcionalidades obligatorias

El MVP deberá mantener como compromisos funcionales:

- Creación e inicio de un proyecto.
- Autenticación del usuario.
- Almacenamiento y recuperación del proyecto.
- Recopilación de información inicial.
- Generación de los trece apartados.
- Etapa complementaria de preguntas para la metodología y el presupuesto.
- Edición de componentes.
- Guardado de modificaciones.
- Aprobación de contenido.
- Control de regeneraciones.
- Persistencia del progreso.
- Ensamblaje documental.
- Traducción del español al inglés.
- Exportación del documento.
- Manejo de errores.
- Pruebas funcionales.
- Pruebas con usuarios.

**Formato de salida comprometido**

Con la evidencia actualmente disponible, el formato de exportación que puede declararse de forma verificable como compromiso del MVP es PDF, dado que el documento consolidado suministrado fue generado por Ágora en dicho formato.

Por rigor académico, DOCX no se declara en este informe como compromiso obligatorio mientras no se incorpore evidencia de su implementación efectiva.

**Traducción**

La traducción del documento consolidado del español al inglés forma actualmente parte del funcionamiento de la solución y se encuentra asociada con un agente traductor independiente.

**Exclusiones**

El proyecto no tiene como propósito:

- Sustituir a un formulador profesional.
- Certificar la viabilidad técnica, jurídica, financiera o científica.
- Garantizar la aprobación en convocatorias.
- Sustituir la revisión bibliográfica especializada.
- Eliminar completamente los errores o las alucinaciones de los modelos generativos.
- Operar actualmente como una plataforma institucional de alta disponibilidad.
- Soportar cargas masivas sin validación previa.
- Generar decisiones académicas definitivas sin revisión humana.

## 4. Objetivos

### 4.1 Objetivo general

Desarrollar, durante un periodo de cuatro meses, una prueba de concepto funcional con características de producto mínimo viable de un sistema multiagente basado en inteligencia artificial generativa, que permita recopilar y organizar la información básica de una idea de proyecto de Ciencia, Tecnología e Innovación —CTeI—, identificar datos faltantes, generar diez componentes estructurales, facilitar su revisión y edición por parte del usuario, y consolidarlos en un documento preliminar integrado y exportable.

### 4.2 Objetivos específicos

OB1 : Diseñar durante los dos primeros meses del proyecto, un mecanismo de interacción guiada que permita recopilar la información básica de una idea de proyecto CTeI, verificar la existencia de los datos mínimos requeridos e identificar vacíos para formular preguntas de aclaración al usuario.

OB2: Integrar entre el segundo y el tercer mes, un motor basado en inteligencia artificial generativa que procese la información consolidada y produzca de manera estructurada los diez componentes definidos para el borrador del proyecto CTeI, incorporando verificaciones básicas de completitud y coherencia.

OB3: Implementar durante el tercer mes, una interfaz que permita al usuario visualizar, modificar, guardar y aprobar individualmente los diez componentes generados, e integrar la última versión guardada de cada sección en un documento preliminar unificado y exportable.

OB4: Integrar y validar, durante el cuarto mes, el funcionamiento de la prueba de concepto mediante la ejecución de pruebas funcionales del recorrido completo y ejercicios de uso con un grupo reducido de usuarios, evaluando la usabilidad, la coherencia general del contenido, el tiempo de generación y la utilidad percibida del sistema.


## 5. Estado del arte / soluciones relacionadas

El ecosistema tecnológico relacionado con Ágora puede organizarse en tres categorías: asistentes generativos de propósito general, herramientas especializadas en investigación y plataformas/frameworks para construir sistemas multiagente.

Los asistentes de propósito general como ChatGPT y Gemini permiten generar, reorganizar, resumir y revisar contenido. Su principal ventaja es la flexibilidad.

Sin embargo, esta flexibilidad exige que el usuario conozca previamente qué preguntar, cómo estructurar cada instrucción y qué componentes necesita.

En formulación de proyectos, esta condición es especialmente relevante. Una persona sin experiencia puede obtener individualmente un objetivo, un problema o una metodología, pero esto no garantiza que dichos contenidos sean coherentes entre sí.

Las herramientas especializadas en investigación académica, como Elicit, ofrecen funcionalidades relacionadas con búsqueda, extracción y síntesis de literatura. Estas capacidades resultan valiosas para fundamentar propuestas, pero no están orientadas a recorrer de extremo a extremo la formulación de un proyecto CTeI.

La tercera categoría corresponde a sistemas multiagente basados en modelos de lenguaje.

Li et al. (2024) destacan elementos relacionados con coordinación, infraestructura, comunicación y control de agentes. Guo et al. (2024) analizan la evolución de modelos individuales hacia configuraciones multiagente capaces de distribuir tareas complejas entre unidades especializadas.

Ágora adopta este principio de separación de responsabilidades.

La propuesta no consiste en solicitar a un solo prompt la creación de un proyecto completo. El proceso se divide entre agentes especializados que utilizan los resultados anteriores como parte del contexto de las siguientes operaciones.

Este enfoque también facilita la mejora independiente de cada etapa. Por ejemplo, el prompt de presupuesto pudo ser reestructurado sin necesidad de rediseñar por completo el agente encargado del marco teórico.

La diferenciación principal de Ágora se encuentra en la integración de:

- Interacción guiada.
- Formulación especializada.
- Trece componentes definidos.
- Preguntas complementarias.
- Persistencia.
- Edición.
- Aprobación.
- Traducción.
- Ensamblaje documental.
- Exportación.

El sistema busca convertir la inteligencia artificial generativa en un proceso de formulación asistida, en lugar de presentarla únicamente como una herramienta abierta de redacción.

## 6. Solución propuesta

Ágora es una aplicación web orientada a apoyar la formulación de proyectos CTeI mediante una arquitectura multiagente y modelos de inteligencia artificial generativa.

La solución está dirigida inicialmente a estudiantes universitarios y otros usuarios que cuenten con una idea de proyecto, pero requieran acompañamiento para transformarla en una estructura formal.

El recorrido comienza con la creación del proyecto y la recopilación de contexto. La información posteriormente es procesada por un orquestador que coordina agentes especializados. Los agentes de formulación trabajan de forma secuencial y distribuyen la generación de los trece componentes. 

- El ResearchAgent se concentra en componentes relacionados con fundamentación e investigación.
- El IdeationAgent estructura actividades, objetivos SMART y cronograma.
- El MethodologyAgent utiliza las decisiones previas y las respuestas adicionales del usuario para producir una metodología relacionada con la ejecución real.
- El BudgetAgent procesa actividades, recursos y demás condiciones para producir el presupuesto. Su prompt fue modificado durante las pruebas con el propósito de mejorar su alineación con el proyecto.
- El ImpactAgent trabaja sobre beneficiarios, riesgos e impactos esperados.
- Finalmente, el TranslationAgent permite producir la versión traducida del documento.

La solución actual utiliza un frontend construido en React/Vite y un backend modular desarrollado con NestJS. MongoDB almacena la información y OpenAI proporciona las capacidades generativas.

El sistema conserva los resultados generados por cada agente y permite reanudar procesos previamente iniciados. La persistencia incremental reduce la pérdida completa del trabajo en caso de una interrupción.

**Flujo funcional actual**

El flujo puede resumirse de la siguiente manera:

Inicio/autenticación → creación del proyecto → recopilación de contexto → generación inicial → objetivos y actividades → preguntas complementarias de ejecución → metodología → presupuesto → componentes restantes → revisión → edición/aprobación → ensamblaje → traducción → exportación PDF.

**Participación humana**

La interfaz permite que el usuario revise el contenido producido antes de incorporarlo definitivamente al documento.
Las modificaciones introducidas por la persona constituyen parte del flujo funcional y no una actividad externa.
La plataforma mantiene de esta forma un enfoque human-in-the-loop.

**Persistencia y continuidad**

Uno de los hallazgos importantes durante las pruebas fue la necesidad de permitir que un usuario saliera del proceso sin perder el avance.
Esta funcionalidad ya fue incorporada: al abandonar temporalmente un proyecto, el progreso se conserva y el usuario puede continuar posteriormente.

**Control de regeneraciones**

Las pruebas también llevaron a establecer limitaciones sobre el número o condiciones de regeneración.
El objetivo es evitar ciclos indefinidos, controlar consumo del modelo y mejorar la previsibilidad del sistema.

**Delimitación de objetivos*8

Se establecieron controles sobre la cantidad de objetivos dentro de un proyecto con el propósito de mantener el alcance manejable y evitar que la generación produzca estructuras excesivamente amplias.

**Traducción**

La formulación principal se mantiene en español y la traducción ocurre posteriormente sobre el documento consolidado, evitando duplicar el flujo completo de formulación en cada idioma.

Esta decisión también fue valorada positivamente en la evaluación comparativa de interfaz.

## 7. Metodología de desarrollo

El desarrollo de Ágora ha seguido un enfoque **iterativo e incremental**, caracterizado por ciclos sucesivos de diseño, implementación, prueba, identificación de problemas, ajuste y nueva validación.

A diferencia del planteamiento inicial, en el estado actual la metodología puede describirse principalmente en pasado y presente, debido a que una parte significativa de la implementación ya fue ejecutada.

## 7.1 Enfoque metodológico

La primera etapa se concentró en definir la experiencia del usuario y construir el frontend.

Se utilizaron React, Vite y TypeScript para desarrollar las interfaces, rutas, formularios, estados y mecanismos de interacción.

Durante las primeras fases se utilizaron servicios simulados para validar el recorrido sin depender todavía del backend definitivo.

Esta decisión permitió comprobar la navegación, la estructura de las pantallas, el comportamiento de los componentes y la distribución de la información.

Posteriormente, se avanzó hacia una arquitectura real compuesta por frontend, backend modular, MongoDB e integración con OpenAI.

El backend actual utiliza NestJS y concentra los servicios relacionados con autenticación, usuarios, proyectos, integración con IA y *health checks*.

La lógica generativa se desarrolló de manera especializada y se organizó dentro del flujo multiagente.

Con el funcionamiento de los agentes, la metodología pasó de una etapa centrada en la implementación a una etapa orientada principalmente a la **estabilización y validación**.

## 7.2 Evolución del sistema multiagente

El proceso se organizó inicialmente alrededor de responsabilidades diferenciadas.

Posteriormente, se integraron los agentes reales con el proveedor de inteligencia artificial.

Actualmente funcionan los agentes asociados con:

- Investigación.
- Ideación.
- Metodología.
- Presupuesto.
- Impactos.
- Traducción.

El orquestador ejecuta los agentes de formulación en una secuencia previamente determinada. El análisis arquitectónico actual documenta que *Research*, *Ideation*, *Methodology*, *Budget* e *Impact* forman el recorrido principal.

## 7.3 Ajuste del flujo de metodología y presupuesto

Uno de los cambios metodológicos más relevantes ocurrió durante la integración de los agentes de metodología y presupuesto.

Las pruebas mostraron que utilizar únicamente el contexto general y los componentes previamente generados podía resultar insuficiente para representar las condiciones reales de ejecución.

Por esta razón, se incorporó un nuevo espacio de preguntas.

Actualmente, después de obtener información asociada con los objetivos y las actividades, y antes de continuar con la metodología y el presupuesto, el usuario responde información adicional relacionada con la ejecución.

La evaluación de la interfaz identifica nueve preguntas obligatorias dentro de esta etapa.

Este cambio busca proporcionar al sistema mayor información sobre recursos, condiciones, necesidades y características reales.

La incorporación de estas preguntas también condujo a una **reestructuración del prompt del agente de presupuesto**.

La mejora buscó aumentar la consistencia entre:

**Objetivos → actividades → metodología → recursos → costos.**

## 7.4 Construcción y validación de los trece componentes

El flujo actual produce trece componentes.

La existencia de estos componentes ya puede comprobarse mediante documentos generados por Ágora.

Por ejemplo, el documento utilizado como evidencia contiene un apartado de metodología compuesto por una ruta de ejecución articulada en fases.

También incorpora un presupuesto relacionado con los medios necesarios para ejecutar las actividades propuestas, incluyendo talento humano, infraestructura, equipos, logística, materiales, servicios y otros conceptos.

Los apartados finales incluyen beneficiarios, riesgos e impactos esperados como componentes independientes.

## 7.5 Estrategia de pruebas de usabilidad y funcionamiento

En la etapa actual se realizan pruebas de forma continua.

La validación contempla tanto aspectos técnicos como de experiencia de usuario.

Se han ejecutado pruebas con usuarios para identificar dificultades durante la navegación, creación, reanudación, generación y revisión de proyectos.

Como resultado de estas pruebas, se implementaron modificaciones tanto en el frontend como en el backend:

- Reorganización del flujo y del orden del inicio de sesión.
- Solución de la lentitud identificada durante el inicio de sesión.
- Ajuste del espacio entre botones.
- Incorporación de botones para regresar.
- Incorporación de un botón para volver al inicio durante el desarrollo del proyecto.
- Persistencia del progreso cuando el usuario sale temporalmente.
- Limitaciones sobre las regeneraciones.
- Delimitación del número de objetivos.
- Modificaciones asociadas con la navegación y la experiencia general.

Estas acciones representan la aplicación directa del enfoque iterativo: las decisiones no se mantienen únicamente por haber sido definidas durante el diseño inicial, sino que pueden modificarse cuando las pruebas muestran una alternativa más adecuada.

## 7.6 Evaluación comparativa de interfaces

Como parte del proceso, se realizó una evaluación comparativa entre:

- **Variante A:** prototipo inicial de Figma.
- **Variante B:** interfaz implementada.

Se analizaron actividades relacionadas con iniciar un proyecto, responder información, mantener la orientación, editar y aprobar componentes, retomar el trabajo y resolver dudas.

La variante implementada obtuvo una valoración ponderada de **84,3/100**, mientras que el prototipo alcanzó **66,4/100**. La interfaz implementada obtuvo resultados especialmente altos en revisión y edición, persistencia y control, ayuda, accesibilidad y ajuste al alcance.

No obstante, el análisis encontró que el prototipo original conservaba ventajas en la orientación durante el diagnóstico y en la reducción de la carga cognitiva mientras se respondían preguntas.

Este hallazgo llevó a conservar la interfaz implementada como base y continuar optimizando específicamente el proceso previo a la metodología y el presupuesto.

Debe señalarse que esta comparación corresponde a una **evaluación experta de dos interfaces**. El propio documento indica que no constituye un experimento estadístico con usuarios y que los puntajes sirven fundamentalmente para priorizar decisiones de diseño.

Las pruebas realizadas directamente con usuarios constituyen una línea de validación complementaria.

## 7.7 Estado actual de la metodología

El proyecto se encuentra actualmente dentro del siguiente ciclo:

**Prueba → observación → corrección → nueva prueba.**

La generación multiagente ya se encuentra operativa, por lo que el propósito principal de las iteraciones actuales no es demostrar si los agentes pueden generar componentes, sino mejorar la estabilidad, la facilidad de uso, la coherencia del flujo y el comportamiento integral del sistema.

Las pruebas continuarán hasta la entrega final.


## 8. Requerimientos

### 8.1 Funcionales

| ID | Requerimiento | Estado o criterio verificable |
|---|---|---|
| RF-01 | El sistema debe permitir la autenticación del usuario. | El usuario puede acceder mediante el flujo implementado. |
| RF-02 | El usuario debe poder crear un proyecto. | El proyecto queda registrado y asociado al usuario. |
| RF-03 | El sistema debe recopilar la información inicial del proyecto. | El contexto queda disponible para la formulación. |
| RF-04 | El sistema debe conservar el progreso. | El usuario puede salir y posteriormente retomar el proyecto. |
| RF-05 | El sistema debe ejecutar el flujo multiagente. | Los agentes procesan secuencialmente la información. |
| RF-06 | El sistema debe generar el marco teórico. | El apartado aparece en el documento. |
| RF-07 | El sistema debe generar el estado del arte. | El apartado aparece en el documento. |
| RF-08 | El sistema debe generar el planteamiento del problema. | El apartado aparece en el documento. |
| RF-09 | El sistema debe generar los antecedentes. | El apartado aparece en el documento. |
| RF-10 | El sistema debe generar la bibliografía. | El apartado aparece en el documento. |
| RF-11 | El sistema debe generar las actividades. | Las actividades se presentan de forma estructurada. |
| RF-12 | El sistema debe generar objetivos SMART. | Los objetivos aparecen diferenciados. |
| RF-13 | El sistema debe generar un cronograma. | El cronograma relaciona actividades, periodos y dependencias. |
| RF-14 | El sistema debe solicitar información adicional antes de generar la metodología y el presupuesto. | El usuario responde el bloque de preguntas correspondiente. |
| RF-15 | El sistema debe generar la metodología. | El apartado utiliza la información previa y complementaria. |
| RF-16 | El sistema debe generar el presupuesto. | El presupuesto se relaciona con las actividades y los recursos. |
| RF-17 | El sistema debe generar la identificación de beneficiarios. | El apartado aparece en el documento. |
| RF-18 | El sistema debe generar la identificación de riesgos. | Se identifican los riesgos y sus tratamientos. |
| RF-19 | El sistema debe generar los impactos esperados. | El apartado aparece en el documento. |
| RF-20 | El usuario debe poder revisar los componentes. | El espacio de trabajo permite consultar los trece apartados. |
| RF-21 | El usuario debe poder modificar el contenido. | Las modificaciones pueden guardarse. |
| RF-22 | El usuario debe poder aprobar los componentes. | Se conserva el estado correspondiente. |
| RF-23 | El sistema debe controlar las regeneraciones. | Se aplican las limitaciones definidas. |
| RF-24 | El sistema debe ensamblar los componentes. | Se genera un documento consolidado. |
| RF-25 | El sistema debe traducir el documento del español al inglés. | El `TranslationAgent` ejecuta la operación. |
| RF-26 | El sistema debe exportar el documento en formato PDF. | Se obtiene un archivo PDF válido. |
| RF-27 | El sistema debe manejar los fallos de las operaciones externas. | Se presentan estados o mensajes de error. |
| RF-28 | El sistema debe permitir regresar dentro del recorrido. | Existen controles de navegación hacia atrás. |
| RF-29 | El sistema debe permitir volver al inicio durante el desarrollo de un proyecto. | Existe una acción específica para regresar al inicio. |

### 8.2 No funcionales

## 8.2 Requerimientos no funcionales

### Usabilidad

**RNF-01.** El usuario deberá poder comprender el recorrido sin capacitación especializada.

**RNF-02.** Las acciones principales deberán mantenerse visualmente identificables.

**RNF-03.** Las pantallas deberán evitar una densidad innecesaria de información cuando esta aumente la carga cognitiva.

**RNF-04.** El sistema deberá mostrar el progreso y el estado del proyecto.

### Rendimiento

**RNF-05.** En la evolución arquitectónica, las operaciones interactivas deberán permanecer conceptualmente separadas de los procesos generativos de larga duración.

**RNF-06.** Las pruebas de rendimiento deberán considerar los percentiles p50, p95 y p99, y no limitarse a los valores promedio.

### Persistencia

**RNF-07.** El progreso de los proyectos no deberá perderse al cerrar voluntariamente la sesión o navegar fuera del proyecto.

**RNF-08.** Los resultados generados deberán conservarse para permitir la reanudación del proyecto.

### Seguridad

**RNF-09.** Las credenciales del proveedor de inteligencia artificial deberán permanecer en el backend.

**RNF-10.** Los proyectos deberán asociarse con sus respectivos usuarios propietarios.

**RNF-11.** La información personal no deberá utilizarse innecesariamente en métricas o telemetría.

### Confiabilidad

**RNF-12.** Un fallo parcial en la generación no deberá eliminar los resultados previamente almacenados.

**RNF-13.** Las operaciones que puedan reintentarse deberán diseñarse para evitar la duplicación de contenido o cobros.

### Mantenibilidad

**RNF-14.** La aplicación deberá mantener la separación entre las responsabilidades de autenticación, proyectos, inteligencia artificial, persistencia y generación documental.

**RNF-15.** El proveedor de inteligencia artificial deberá permanecer encapsulado para facilitar una posible sustitución.

### Accesibilidad

**RNF-16.** La interfaz deberá continuar con las validaciones de accesibilidad incorporadas durante las pruebas.

### Costos

**RNF-17.** Las regeneraciones deberán limitarse para evitar el consumo innecesario de recursos.

**RNF-18.** Las futuras pruebas de carga deberán registrar los tokens utilizados y el costo por trabajo (`job`) cuando sea técnicamente viable.

## 9. Evaluación de alternativas

## 9. Evaluación de alternativas arquitectónicas

Para definir cómo debe evolucionar la arquitectura de Ágora, se analizaron diferentes opciones teniendo en cuenta cuatro aspectos principales: **desempeño bajo carga, nivel de acoplamiento, disponibilidad y tolerancia a fallos, y complejidad de implementación y operación**.

La arquitectura actual funciona correctamente para el MVP, pero puede presentar limitaciones cuando varios usuarios ejecutan procesos de inteligencia artificial al mismo tiempo, debido a que la generación todavía depende directamente del procesamiento realizado por el backend.

Actualmente, Ágora utiliza **React y Vite en el frontend, NestJS en el backend, MongoDB para la persistencia de la información y OpenAI como proveedor de inteligencia artificial**. El principal aspecto que se busca mejorar no corresponde a estas tecnologías, sino a la manera en que se procesan los trabajos de generación de larga duración.

### 9.1 Alternativas consideradas

Se analizaron cuatro alternativas posibles.

#### Alternativa A. Mantener la arquitectura actual

Esta alternativa consiste en conservar la estructura existente:

**React → NestJS → MongoDB → OpenAI**

La generación de los componentes continuaría realizándose directamente dentro del flujo iniciado por el usuario.

Su principal ventaja es que requiere pocos cambios y permite continuar utilizando una arquitectura que ya funciona. Sin embargo, cuando varios usuarios generen proyectos simultáneamente, los procesos de inteligencia artificial podrían ocupar recursos del backend durante periodos prolongados y afectar otras operaciones, como iniciar sesión, abrir un proyecto, editar información o consultar su estado.

#### Alternativa B. Monolito modular reforzado con cola y workers

Esta alternativa mantiene la arquitectura modular existente, pero cambia la forma en que se ejecutan los procesos de inteligencia artificial de larga duración.

Cuando el usuario solicita una generación, el backend registra la tarea y la coloca en una **cola de trabajos**. Posteriormente, uno o varios **workers**, es decir, procesos especializados en ejecutar tareas de inteligencia artificial, toman estos trabajos y los procesan.

El flujo sería aproximadamente:

**Usuario → API → registro del trabajo → cola → worker → agentes de IA → resultado**

Además, esta alternativa incorpora mecanismos como:

- Reintentos cuando ocurre un fallo temporal.
- Control para evitar la ejecución duplicada de un mismo trabajo.
- Registro de trabajos fallidos.
- Monitoreo del estado de las tareas.
- Recuperación frente a errores.
- Control de la cantidad de trabajos que pueden ejecutarse simultáneamente.

La principal ventaja es que el backend no necesita esperar a que todos los agentes terminen para continuar atendiendo a otros usuarios.

#### Alternativa C. Microservicios orientados a eventos

Esta opción consiste en separar Ágora en diferentes servicios independientes.

Por ejemplo, podrían existir servicios separados para:

- Autenticación.
- Proyectos.
- Orquestación.
- Agentes de inteligencia artificial.
- Generación de documentos.
- Exportación.

Esto permitiría escalar cada componente de forma independiente y aislar mejor determinados fallos.

Sin embargo, para el estado actual del proyecto implicaría una complejidad considerablemente mayor, porque sería necesario administrar diferentes servicios, contratos de comunicación, despliegues, eventos y mecanismos de trazabilidad.

#### Alternativa D. Serverless y workflows administrados

La cuarta opción consiste en utilizar servicios administrados en la nube, como funciones, colas y flujos de trabajo.

En este modelo, la infraestructura puede crecer o disminuir automáticamente según la demanda.

Su principal ventaja es la elasticidad. Sin embargo, puede generar una mayor dependencia del proveedor de servicios en la nube y presentar problemas relacionados con los tiempos de arranque, límites de duración de las funciones, cuotas y costos de ejecución.

### 9.2 ¿Cuál alternativa ofrece mejor desempeño bajo la carga esperada?

Para analizar el comportamiento futuro de Ágora, se plantearon tres escenarios de prueba:

| Escenario | Sesiones activas | Trabajos de IA simultáneos |
|---|---:|---:|
| Uso nominal | 25 | 3 |
| Pico esperado | 100 | 10 |
| Estrés | Más de 250 | Más de 20 |

Estos valores se utilizan como **escenarios de prueba** y no representan actualmente tráfico real de producción.

Bajo estas condiciones, la **alternativa B** presenta el mejor equilibrio para Ágora.

La razón principal es que separa las operaciones rápidas de las operaciones de inteligencia artificial.

Por ejemplo, las siguientes acciones pueden continuar siendo atendidas normalmente mientras los workers generan los contenidos en segundo plano:

- Iniciar sesión.
- Consultar proyectos.
- Modificar información.
- Guardar cambios.
- Revisar componentes.

En la arquitectura actual, el backend puede quedar ocupado esperando a que termine un proceso completo de generación. Con una cola, el backend únicamente registra la solicitud y el procesamiento continúa de manera independiente.

#### Latencia

Cuando existen pocos usuarios, la arquitectura actual puede responder correctamente.

Sin embargo, si varias generaciones ocurren simultáneamente, los tiempos pueden aumentar.

Con la alternativa B se diferencian dos tiempos:

- **Tiempo de aceptación:** tiempo que tarda el sistema en recibir y registrar el trabajo.
- **Tiempo de generación:** tiempo que tardan posteriormente los agentes en producir el resultado.

De esta manera, una generación de larga duración no necesariamente afecta el resto de la plataforma.

#### Capacidad de procesamiento

La capacidad del sistema no debe analizarse solamente mediante las solicitudes procesadas por segundo.

En Ágora resulta más importante medir:

- Proyectos generados por hora.
- Componentes generados por hora.
- Trabajos simultáneos.
- Tiempo de ejecución de cada agente.

La alternativa B permite aumentar la cantidad de workers cuando sea necesario, sin modificar completamente la arquitectura.

#### Concurrencia

Cuando aumente el número de usuarios, los trabajos pueden acumularse temporalmente en la cola.

Esto es preferible a que toda la aplicación se vuelva lenta o deje de responder.

Por esta razón, la alternativa seleccionada permite una degradación más controlada: las generaciones pueden tardar más cuando exista una alta demanda, pero las demás funciones de Ágora pueden continuar disponibles.

### 9.3 ¿Qué grado de acoplamiento introduce cada alternativa?

Ágora depende principalmente de dos elementos externos:

- Un proveedor de inteligencia artificial.
- Una base de datos.

Actualmente, si OpenAI presenta problemas mientras se ejecuta una generación, la solicitud puede verse directamente afectada.

La alternativa B disminuye esta dependencia directa porque introduce una cola entre el backend y los procesos de generación.

Esto significa que el trabajo puede permanecer registrado aunque OpenAI presente errores temporalmente.

También facilita que diferentes componentes puedan sustituirse posteriormente.

Por ejemplo:

- OpenAI podría reemplazarse por otro proveedor.
- El sistema de cola podría cambiarse.
- La base de datos podría abstraerse mediante repositorios.
- Los workers podrían convertirse posteriormente en servicios independientes.

Por esta razón, la alternativa B mantiene un **acoplamiento controlado**. Agrega una nueva dependencia —la cola—, pero reduce la dependencia directa entre la API y el proveedor de inteligencia artificial.

### 9.4 ¿Qué nivel de disponibilidad y tolerancia a fallos ofrece cada alternativa?

Uno de los principales riesgos de la arquitectura actual ocurre cuando el backend se reinicia durante una generación.

En ese caso, el proceso activo podría interrumpirse.

Con la alternativa B, el trabajo permanece almacenado en la cola y puede continuar posteriormente.

Por ejemplo:

- **Si falla un worker:** otro worker puede continuar el trabajo.
- **Si OpenAI no responde:** se pueden ejecutar reintentos.
- **Si el backend se reinicia:** los trabajos previamente registrados no deberían desaparecer.
- **Si falla la exportación:** puede intentarse nuevamente sin tener que generar todo el proyecto otra vez.

Esto permite aislar mejor los errores.

Para conseguirlo, se consideran mecanismos como:

- **Idempotencia:** evita que un mismo trabajo genere resultados duplicados.
- **Reintentos:** permiten repetir operaciones que fallaron temporalmente.
- **Heartbeat:** permite saber si un worker continúa activo.
- **Visibility timeout:** permite que otro worker retome una tarea si el anterior falla.
- **Dead-letter queue:** almacena trabajos que no pudieron completarse.
- **Backups:** permiten recuperar la información ante un fallo.
- **Pruebas de restauración:** permiten comprobar que las copias de seguridad realmente funcionan.

Aunque los microservicios ofrecen un aislamiento todavía mayor, esta ventaja no justifica actualmente la complejidad adicional que introducirían para el tamaño y estado actual de Ágora.

### 9.5 Comparación general de las alternativas

Para comparar las opciones, se definieron los siguientes pesos:

- Desempeño: **35 %**.
- Acoplamiento y facilidad de sustitución: **25 %**.
- Disponibilidad y tolerancia a fallos: **25 %**.
- Facilidad y costo de operación: **15 %**.

Los resultados obtenidos fueron:

| Alternativa | Desempeño | Acoplamiento | Disponibilidad | Operabilidad | Resultado |
|---|---:|---:|---:|---:|---:|
| A. Arquitectura actual | 3,0 | 3,0 | 2,0 | 5,0 | **3,05** |
| B. Monolito modular reforzado | 4,5 | 4,0 | 4,0 | 4,0 | **4,18** |
| C. Microservicios | 4,5 | 4,5 | 4,5 | 2,0 | **4,13** |
| D. Serverless | 4,0 | 3,0 | 4,5 | 3,5 | **3,80** |

La alternativa con mayor resultado es la **alternativa B**, con **4,18 sobre 5**. La opción de microservicios se encuentra muy cerca, con 4,13, pero introduce una complejidad operativa que actualmente no resulta necesaria para Ágora.

Por esta razón, se selecciona el **monolito modular reforzado con cola y workers**.

La decisión se fundamenta principalmente en que esta arquitectura:

- Soluciona el principal problema de los procesos de larga duración.
- Aprovecha la arquitectura que ya funciona.
- Requiere menos cambios que una migración hacia microservicios.
- Permite controlar la cantidad de procesos de inteligencia artificial simultáneos.
- Permite gestionar mejor los costos.
- Mejora la recuperación frente a errores.
- Mantiene abierta la posibilidad de migrar hacia microservicios en el futuro.

### 9.6 Arquitectura propuesta

La arquitectura conserva los principales componentes actuales:

**React → API NestJS → MongoDB**

Además, agrega una capa para procesar los trabajos de inteligencia artificial:

**API → cola de trabajos → workers → OpenAI**

De manera simplificada, el recorrido sería:

1. **Usuario.**
2. **Frontend desarrollado con React.**
3. **API desarrollada con NestJS.**
4. **MongoDB y cola de trabajos.**
5. **Workers de inteligencia artificial.**
6. **OpenAI.**

La API continuará encargándose principalmente de:

- Autenticación.
- Autorización.
- Creación y consulta de proyectos.
- Edición.
- Validaciones.
- Registro de nuevos trabajos.

Los workers se encargarán de:

- Ejecutar los agentes.
- Comunicarse con OpenAI.
- Controlar los reintentos.
- Guardar los avances.
- Gestionar los procesos de larga duración.

Con esto se evita que la API tenga que ejecutar directamente todas las generaciones.

### 9.7 Metas técnicas para la arquitectura

Para evaluar posteriormente si la arquitectura funciona correctamente, se plantean los siguientes objetivos técnicos:

| Indicador | Meta |
|---|---:|
| Disponibilidad de la API | ≥ 99,5 % mensual |
| Tiempo p95 para operaciones CRUD | ≤ 750 ms |
| Tiempo p95 para aceptar un trabajo | ≤ 1 segundo |
| Tiempo p95 para consultar el estado | ≤ 500 ms |
| Trabajos aceptados perdidos | 0 |
| Generaciones exitosas después de los reintentos | ≥ 97 % |
| RPO | ≤ 15 minutos |
| RTO | ≤ 60 minutos |

Estos valores son **metas de diseño**. Todavía deben validarse mediante pruebas y no representan el desempeño actual de Ágora.

### 9.8 Pruebas que se deben realizar

La elección de la arquitectura debe comprobarse posteriormente mediante pruebas controladas.

Se plantea evaluar escenarios como:

1. **25 usuarios simultáneos** utilizando funciones como el inicio de sesión, la apertura y el guardado de proyectos.
2. **100 sesiones con 10 generaciones simultáneas**.
3. Incremento progresivo de los trabajos hasta encontrar el límite del sistema.
4. Apagado deliberado de un worker durante una generación.
5. Simulación de errores del proveedor de inteligencia artificial.
6. Reinicio de la API mientras existen trabajos activos.
7. Restauración de una copia de seguridad y comprobación de la recuperación.

Durante estas pruebas se medirán principalmente:

- Tiempo de respuesta.
- Errores.
- Número de trabajos en espera.
- Tiempo de ejecución de cada agente.
- Cantidad de reintentos.
- Proyectos generados por unidad de tiempo.
- Consumo de tokens.
- Costo por generación.
- Uso de CPU y memoria.
- Disponibilidad del sistema.
- Porcentaje de trabajos completados.

De esta manera, la arquitectura seleccionada podrá validarse con datos reales antes de utilizar Ágora en escenarios con una mayor cantidad de usuarios.

## 10. Diseño y arquitectura

Explica cómo se estructura la solución a nivel conceptual y técnico.

### 10.1 Descripción general de la arquitectura

**Objetivo:** que el lector entienda cómo está pensado el sistema antes de ver cualquier representación visual.

Debe incluir:

- Tipo de arquitectura (cliente-servidor, basada en Backend as a Service, etc.).
- Enfoque general de la solución.
- Relación con la alternativa seleccionada previamente.

### 10.2 Componentes del sistema

Deben identificarse y explicarse:

- **Componentes principales** del sistema (frontend, backend, base de datos, servicios externos).
- **Responsabilidad** de cada uno.
- **Relación con los requerimientos** del sistema.

Esta parte debe terminar con el **diagrama de arquitectura del sistema**.

### 10.3 Interacción entre módulos

Debe explicarse:

- Cómo se comunican los componentes.
- Flujos de datos.
- Dependencias.
- Nivel de acoplamiento.

Esta parte debe terminar con el **diagrama de interacción entre módulos**.

### 10.4 Comportamiento

Debe explicarse cómo se comportan los componentes, describiendo las principales secuencias de la arquitectura y respondiendo preguntas como:

- ¿El flujo es eficiente? (latencia, pasos innecesarios).
- ¿Existen cuellos de botella?
- ¿La interacción refleja buen desacoplamiento?

En esta parte se utilizan **diagramas de secuencia**.

## 11. Implementación y avance actual

Documenta el estado real de construcción del sistema y el grado de avance alcanzado.

### 11.1 Stack tecnológico

Lista y justifica las tecnologías, frameworks, librerías y herramientas utilizadas.

### 11.2 Componentes implementados

Describe qué módulos o componentes ya fueron construidos, qué funcionalidades cubren y cuál es su estado actual.

### 11.3 Integraciones realizadas

Explica las integraciones ya desarrolladas con servicios externos, bases de datos, autenticación u otros componentes.

### 11.4 Pendientes para la entrega final

Indica qué elementos faltan por implementar, integrar, corregir o validar antes del cierre del proyecto.

## 12. Despliegue y operación preliminar

Describe cómo se ejecuta actualmente la solución, en qué entorno funciona, qué dependencias requiere y cuál es su estado de despliegue o configuración.

## 13. Validación preliminar

Presenta las pruebas o validaciones realizadas hasta el momento para verificar el comportamiento del sistema y su grado de cumplimiento frente a los requerimientos.

### 13.1 Pruebas por componentes

### 13.2 Pruebas de integración

### 13.3 Pruebas de usabilidad

## 14. Resultados parciales y discusión

Presenta los principales hallazgos obtenidos hasta el momento, interpreta su significado y analiza el nivel de avance del proyecto frente a los objetivos planteados.

## 15. Plan de cierre hacia la entrega final

Describe las actividades restantes, prioridades, riesgos y estrategia de cierre para completar el proyecto en las semanas finales.

## 16. Referencias

Incluye las fuentes consultadas y citadas en el documento.
