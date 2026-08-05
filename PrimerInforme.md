# Guía para el primer informe del proyecto

## Resumen / Abstract

## Resumen

Los estudiantes universitarios enfrentan dificultades para transformar ideas iniciales en borradores estructurados y coherentes de proyectos de Ciencia, Tecnología e Innovación —CTeI—. Esta situación puede generar propuestas incompletas, inconsistencias entre sus componentes y una menor participación en oportunidades académicas, investigativas y de innovación. Para atender esta problemática, se propone desarrollar una prueba de concepto funcional de un sistema multiagente basado en inteligencia artificial generativa, capaz de recopilar información básica de una idea, identificar datos faltantes mediante preguntas de aclaración, generar diez componentes estructurales del proyecto y permitir su revisión, edición, guardado y aprobación por parte del usuario.

El proyecto tendrá un alcance de producto mínimo viable y será desarrollado durante cuatro meses por un equipo de cuatro desarrolladores. La solución se implementará mediante una arquitectura monolítica modular organizada en capas, con orquestación multiagente, integración con un modelo de lenguaje, persistencia de datos y exportación del documento final. El plan de trabajo comprenderá la definición de requisitos y arquitectura, el desarrollo del mecanismo de diagnóstico, la construcción del motor de generación, la implementación de la revisión y el ensamblaje, y finalmente la integración, las pruebas funcionales y la validación con un grupo reducido de usuarios. Como resultado, se espera demostrar la viabilidad técnica y funcional del uso de sistemas multiagente e inteligencia artificial generativa como apoyo para la formulación básica de proyectos CTeI, sin sustituir la revisión y validación de expertos.


## 1. Introducción

La formulación de proyectos de Ciencia, Tecnología e Innovación —CTeI— constituye una actividad fundamental en los entornos universitarios, debido a que permite transformar ideas académicas, investigativas y emprendedoras en propuestas estructuradas que puedan ser evaluadas, fortalecidas y eventualmente implementadas. En este contexto, el avance de la inteligencia artificial generativa, los modelos de lenguaje de gran tamaño y los sistemas multiagente ha abierto nuevas posibilidades para apoyar tareas de análisis, organización de información y producción de contenidos técnicos. Estas tecnologías permiten distribuir un proceso complejo entre módulos especializados que colaboran entre sí, mientras que los sistemas de información facilitan la captura de datos, la interacción con los usuarios, la conservación de los avances y la integración de los resultados en documentos estructurados.

A pesar de la disponibilidad creciente de asistentes de inteligencia artificial y herramientas de apoyo académico, persisten limitaciones para acompañar de manera específica la formulación básica de proyectos CTeI. Muchas soluciones actuales generan textos a partir de instrucciones generales, pero no necesariamente guían al usuario en la identificación de la información requerida, la detección de vacíos o la construcción articulada de los diferentes componentes de una propuesta. Asimismo, algunas herramientas se concentran en la búsqueda de literatura, la corrección de textos o la generación aislada de contenidos, sin ofrecer un flujo completo que conecte el diagnóstico de la idea, la formulación, la revisión humana y el ensamblaje documental. Esta situación afecta especialmente a estudiantes universitarios con experiencia limitada en estructuración de proyectos, quienes pueden presentar dificultades para superar la barrera de la hoja en blanco, mantener la coherencia entre el problema, los objetivos y la metodología, y aprovechar oportunidades académicas, investigativas y de innovación.

Frente a esta situación, se identifica la necesidad técnica de diseñar una solución que no se limite a producir texto, sino que organice el proceso de formulación mediante una interacción guiada y una arquitectura modular. La oportunidad de diseño consiste en integrar una interfaz web, un mecanismo de diagnóstico, un motor de generación de contenidos, validaciones básicas de completitud y coherencia, funciones de revisión y edición, y un componente de ensamblaje documental dentro de un único flujo. La incorporación de una arquitectura monolítica modular organizada en capas y coordinada por un orquestador multiagente permite distribuir responsabilidades, reducir la complejidad del desarrollo y mantener la participación activa del usuario. De esta manera, la inteligencia artificial actúa como apoyo para construir un primer borrador, mientras que la revisión humana conserva un papel central en la modificación, aprobación y validación del contenido.

Como respuesta a esta necesidad se propone el desarrollo de **Ágora**, una prueba de concepto funcional con características de producto mínimo viable para apoyar la formulación básica de proyectos CTeI. El sistema permitirá registrar la información inicial de una idea, identificar datos faltantes mediante preguntas de aclaración, generar diez componentes estructurales, visualizar y editar cada sección, guardar los cambios, aprobar individualmente los contenidos y consolidar la última versión en un documento integrado y exportable. Su desarrollo se realizará durante cuatro meses por un equipo de cuatro desarrolladores y se concentrará en demostrar la viabilidad técnica y funcional del recorrido completo. Con ello se espera reducir la dificultad inicial de formulación, mejorar la organización preliminar de las propuestas y facilitar que los estudiantes presenten sus ideas a procesos de revisión académica, sin sustituir el acompañamiento ni la evaluación de docentes, investigadores o expertos.


## 2. Planteamiento del problema

### 2.1. Descripción del problema

Los estudiantes universitarios que desean formular iniciativas de Ciencia, Tecnología e Innovación —CTeI— enfrentan dificultades para transformar una idea inicial en una propuesta estructurada, clara y coherente. Aunque pueden reconocer una necesidad, plantear una solución preliminar o identificar una oportunidad de investigación e innovación, con frecuencia no cuentan con la experiencia suficiente para organizar dicha información en los componentes técnicos que integran un proyecto.

Esta dificultad se manifiesta especialmente al momento de definir con precisión el problema que se pretende atender, establecer objetivos congruentes, caracterizar la población beneficiaria, formular una metodología, sustentar conceptualmente la propuesta y plantear sus resultados e impactos esperados. La formulación exige que estos elementos mantengan una relación lógica entre sí, por lo que las debilidades en uno de ellos pueden afectar la consistencia general del documento.

Entre las posibles causas de esta situación se encuentran la experiencia limitada de los estudiantes en procesos de formulación, el desconocimiento de la estructura básica de los proyectos CTeI, la dificultad para identificar la información necesaria y la necesidad de acompañamiento para organizar y redactar técnicamente sus ideas. A esto se suma la denominada barrera de la “hoja en blanco”, que puede dificultar el inicio del proceso y aumentar el tiempo requerido para construir un primer borrador.

Como consecuencia, algunas ideas con potencial académico, científico, tecnológico o innovador pueden permanecer en una etapa preliminar, presentarse de forma incompleta o no alcanzar el nivel básico de estructuración requerido para ser revisadas por docentes, semilleros de investigación, programas universitarios o convocatorias relacionadas con CTeI. Esto puede generar pérdida de oportunidades de participación, retroalimentación, financiación, vinculación a procesos de investigación y desarrollo de iniciativas académicas.

En este contexto, el problema central se define de la siguiente manera:

**Los estudiantes universitarios presentan dificultades para transformar sus ideas iniciales en borradores estructurados y coherentes de proyectos de Ciencia, Tecnología e Innovación, lo que limita su capacidad para presentar sus iniciativas y aprovechar oportunidades académicas y de participación en escenarios CTeI.**

El problema no corresponde a la inexistencia de una herramienta tecnológica específica, sino a una brecha en la capacidad inicial de estructuración y formulación de propuestas. Por tanto, el proyecto busca atender esta situación mediante un mecanismo de acompañamiento guiado que facilite la organización de la información, la identificación de datos faltantes y la generación de un primer borrador sujeto a revisión humana.


## 3. Alcance del proyecto

El proyecto comprende el diseño, desarrollo, integración y validación de una **prueba de concepto funcional con características de producto mínimo viable —MVP—** de un sistema multiagente basado en inteligencia artificial generativa, orientado a apoyar la formulación básica de proyectos de Ciencia, Tecnología e Innovación —CTeI—.

La solución será desarrollada durante un periodo de **cuatro meses**, mediante un equipo conformado por **cuatro desarrolladores**, y tendrá como propósito demostrar la viabilidad técnica y funcional de un flujo completo de formulación asistida, desde el registro inicial de una idea hasta la generación y exportación de un documento preliminar estructurado.

El alcance estará limitado a la implementación de las funcionalidades esenciales necesarias para comprobar que una arquitectura multiagente puede recopilar información básica, identificar vacíos, generar contenido, validar aspectos mínimos de coherencia, permitir la intervención del usuario y consolidar los resultados en un único documento.

### 3.1. Alcance funcional

El producto mínimo viable permitirá ejecutar el siguiente flujo:

1. **Ingreso de la idea de proyecto**

   El usuario podrá registrar la información básica de una iniciativa CTeI mediante una interfaz web guiada.

   Como mínimo, el sistema solicitará:

   * Nombre provisional del proyecto.
   * Sector o área de conocimiento.
   * Descripción de la problemática.
   * Localización o contexto territorial.
   * Población beneficiaria.
   * Solución propuesta.
   * Resultados esperados.
   * Alcance inicial de la iniciativa.

2. **Diagnóstico de la información**

   El sistema analizará la información ingresada para determinar si existen datos ausentes, incompletos, ambiguos o insuficientes para generar el borrador.

   El Agente de Contexto y Diagnóstico formulará preguntas complementarias al usuario para aclarar la idea y completar los datos mínimos requeridos.

   Este diagnóstico no corresponderá a una evaluación técnica, financiera, jurídica o científica del proyecto, sino a una validación básica de suficiencia de la información.

3. **Generación de los componentes del proyecto**

   Una vez completada la información mínima, el Agente Formulador generará automáticamente los siguientes diez componentes:

   1. Resumen ejecutivo.
   2. Objetivo general.
   3. Objetivos específicos.
   4. Planteamiento del problema.
   5. Marco teórico.
   6. Estado del arte.
   7. Impactos esperados.
   8. Población beneficiaria.
   9. Estrategia de sostenibilidad.
   10. Metodología de ejecución.

   La generación se realizará mediante plantillas, instrucciones estructuradas y reglas de redacción asociadas a cada componente.

4. **Validación básica de coherencia**

   El sistema realizará verificaciones automáticas mínimas orientadas a identificar:

   * Existencia de los diez componentes requeridos.
   * Correspondencia general entre el problema y el objetivo general.
   * Relación básica entre el objetivo general y los objetivos específicos.
   * Presencia de la población beneficiaria.
   * Inclusión de actividades o fases en la metodología.
   * Consistencia básica entre la solución propuesta y los impactos esperados.
   * Campos vacíos o secciones incompletas.
   * Repeticiones evidentes o contradicciones simples entre componentes.

   Esta validación no reemplazará la revisión de un experto y no garantizará la viabilidad técnica, financiera, metodológica o institucional de la propuesta.

5. **Revisión e intervención del usuario**

   Una vez generados los diez componentes del proyecto, el sistema los presentará individualmente en una interfaz de revisión. El usuario podrá consultar cada sección, realizar modificaciones manuales sobre el contenido generado, guardar los cambios y aprobar cada componente antes de la integración del documento final.
   
   Para cada componente, el sistema permitirá como mínimo:
   
   * Visualizar el contenido generado por la inteligencia artificial.
   * Modificar manualmente el contenido mediante un campo de texto editable.
   * Guardar las modificaciones realizadas.
   * Marcar el componente como revisado o aprobado.
   * Identificar cuáles componentes se encuentran pendientes de revisión.
   * Navegar entre los diez componentes.
   * Consultar el avance general del proceso de revisión.
   
   El sistema deberá conservar la última versión guardada por el usuario y utilizarla durante el ensamblaje del documento final. Una vez que el usuario modifique manualmente una sección, esta versión tendrá prioridad sobre el contenido originalmente generado por la inteligencia artificial.
   
   La edición se limitará al contenido textual de cada componente. El producto mínimo viable no incluirá herramientas avanzadas de edición como control de cambios, comentarios, historial completo de versiones, comparación entre versiones, edición colaborativa en tiempo real o funciones de diseño equivalentes a un procesador de texto.
   
   Como funcionalidad complementaria y condicionada al tiempo disponible, el sistema podrá incluir la opción de regenerar completamente uno de los componentes mediante inteligencia artificial. Esta regeneración no será un requisito indispensable para considerar funcional el producto mínimo viable.
   
   En caso de implementarse, la regeneración deberá:
   
   * Aplicarse únicamente al componente seleccionado.
   * Solicitar confirmación antes de reemplazar el contenido existente.
   * No modificar automáticamente los demás componentes.
   * Permitir que el usuario revise el nuevo resultado antes de aprobarlo.
   * Advertir que la regeneración reemplazará la versión actual de la sección.
   
   El ensamblaje final podrá realizarse cuando los diez componentes se encuentren generados y disponibles. El sistema mostrará cuáles han sido aprobados y solicitará confirmación al usuario cuando existan componentes pendientes de revisión.
   

6. **Integración del documento**

   El Agente Ensamblador organizará los componentes en un único documento, siguiendo un orden predeterminado y una estructura visual homogénea.

   El documento integrado incluirá como mínimo:

   * Título provisional del proyecto.

   * Información general de la iniciativa.

   * Los diez componentes generados.

   * Fecha de generación.

   * Indicación de que el contenido requiere revisión y validación de expertos.

7. **Traducción al inglés**

   El MVP podrá incluir una función de traducción del documento consolidado del español al inglés.

   La traducción deberá conservar:

   * La estructura del documento.
   * Los títulos y subtítulos.
   * El orden de los componentes.
   * El sentido general del contenido.
   * La terminología básica relacionada con CTeI.

   La traducción tendrá carácter asistido y preliminar, por lo que no sustituirá una traducción académica o especializada realizada por un profesional.

8. **Exportación del resultado**

   El usuario podrá obtener el documento integrado en al menos un formato descargable.

   Para el MVP se priorizará la exportación en:

   * PDF; o
   * Documento editable en formato DOCX.

   En caso de restricciones técnicas o de tiempo, se garantizará al menos uno de los dos formatos.

### 3.2. Arquitectura funcional mínima

El sistema estará compuesto por cuatro agentes lógicos:

#### Agente 1. Contexto y Diagnóstico

Responsable de recopilar la información inicial, verificar su completitud e identificar datos faltantes.

#### Agente 2. Formulador

Responsable de generar los diez componentes del proyecto mediante instrucciones, plantillas y reglas de redacción previamente definidas.

#### Agente 3. Ensamblador y Verificador

Responsable de comprobar la existencia de las secciones, ejecutar validaciones básicas de coherencia y consolidar el documento final.

#### Agente 4. Traductor

Responsable de traducir al inglés el documento consolidado, preservando su estructura y sentido técnico general.

La denominación de “agentes” corresponderá a módulos especializados dentro de una arquitectura coordinada. El alcance no exige que cada agente opere como un sistema completamente autónomo, sino que exista una separación clara de responsabilidades, instrucciones, entradas y salidas.

### 3.3. Alcance técnico mínimo

El MVP deberá incluir:

* Aplicación web funcional.
* Interfaz para el ingreso guiado de información.
* Mecanismo de preguntas de aclaración.
* Integración con al menos un modelo de lenguaje de gran tamaño.
* Orquestación básica de los cuatro agentes.
* Generación de los diez componentes.
* Persistencia temporal o básica de la información del proyecto.
* Pantalla de revisión.
* Ensamblaje del documento.
* Traducción español-inglés.
* Exportación del documento.
* Registro básico de errores y eventos relevantes.
* Pruebas funcionales del flujo principal.

La aplicación deberá ser accesible desde navegadores web modernos y contar con una interfaz adaptable a computadores portátiles y de escritorio. La adaptación completa a dispositivos móviles no será un requisito prioritario del MVP.

### 3.4. Usuarios y validación

El prototipo estará dirigido inicialmente a un grupo reducido de:

* Estudiantes.
* Docentes.
* Investigadores.
* Emprendedores vinculados con la Universidad del Norte.

La validación se realizará con un número limitado de usuarios y se concentrará en:

* Facilidad de uso.
* Comprensión de las preguntas.
* Capacidad para completar el flujo.
* Tiempo requerido para generar el documento.
* Coherencia general del contenido.
* Utilidad percibida.
* Facilidad de revisión y edición.
* Correcto ensamblaje y exportación.

No se contempla una validación estadísticamente representativa ni una evaluación institucional, científica o comercial a gran escala.

### 3.5. Productos entregables

Al finalizar los cuatro meses se deberán entregar, como mínimo:

1. Prototipo web funcional.
2. Flujo de ingreso y diagnóstico de la idea.
3. Motor de generación de los diez componentes.
4. Módulo de revisión  por componente.
5. Validación básica de completitud y coherencia.
6. Módulo de ensamblaje documental.
7. Función de traducción.
8. Exportación del documento integrado.
9. Repositorio del código fuente.
10. Documento técnico de arquitectura.
11. Manual básico de instalación o despliegue.
12. Manual breve de usuario.
13. Registro de pruebas funcionales.
14. Informe de validación con usuarios.
15. Documento de limitaciones, riesgos y recomendaciones para una siguiente versión.

### 3.6. Exclusiones del alcance

No forman parte del alcance de esta prueba de concepto:

* Formulación completa de proyectos bajo metodologías como MGA, marco lógico u otras metodologías institucionales.
* Elaboración automática de presupuestos.
* Construcción de cronogramas financieros detallados.
* Evaluación de viabilidad técnica, financiera, jurídica, ambiental o comercial.
* Búsqueda exhaustiva y verificada de literatura científica.
* Generación automática de referencias bibliográficas verificadas.
* Consulta directa de bases de datos académicas de pago.
* Presentación automática a convocatorias.
* Evaluación del cumplimiento de términos de referencia.
* Firma electrónica o aprobación institucional.
* Gestión contractual o documental del proyecto.
* Seguimiento de la ejecución de proyectos.
* Integración con sistemas institucionales de la Universidad.
* Aplicación móvil nativa.
* Funcionamiento sin conexión a internet.
* Entrenamiento de un modelo de lenguaje propio.
* Soporte simultáneo para múltiples idiomas, además de español e inglés.
* Alta disponibilidad, escalabilidad masiva o arquitectura de producción.
* Panel administrativo avanzado.
* Analítica avanzada de uso.
* Garantía de ausencia de errores, sesgos o alucinaciones.
* Sustitución del juicio de formuladores, investigadores, docentes o expertos.

### 3.7. Priorización para los cuatro meses

Debido al tiempo disponible, se aplicará una priorización estricta.

#### Prioridad obligatoria

* Ingreso de información.
* Diagnóstico de datos faltantes.
* Preguntas de aclaración.
* Generación de los diez componentes.
* Revisión y edición manual mediante campos de texto.
* Validación básica.
* Ensamblaje.
* Exportación.
* Pruebas del flujo completo.

#### Prioridad secundaria

* Traducción al inglés.
* Historial básico de proyectos.
* Regeneración parcial con instrucciones.
* Métricas simples de uso.
* Registro de consumo del modelo de IA.

#### Funcionalidades condicionadas al tiempo

* Autenticación avanzada.
* Panel administrativo.
* Tableros de telemetría.
* Comparación entre versiones.
* Selección entre diferentes proveedores de modelos.
* Gestión avanzada de roles y permisos.
* Diseño móvil completamente optimizado.
* Regeneración completa de un componente mediante inteligencia artificial.
* Ajuste automático de las demás secciones después de una modificación.
* Control de cambios.
* Comentarios entre usuarios.
* Edición simultánea o colaborativa.
* Editor avanzado con formato similar a Word.

Las funcionalidades secundarias o condicionadas no deberán comprometer la entrega del recorrido principal de extremo a extremo.

### 3.8. Distribución general del trabajo

El desarrollo se organizará en cuatro etapas mensuales:

#### Mes 1. Diseño y preparación

* Levantamiento y validación de requisitos.
* Definición de la arquitectura.
* Diseño de los agentes.
* Definición de entradas y salidas.
* Diseño de las plantillas de los diez componentes.
* Prototipo de interfaz.
* Configuración del repositorio y ambientes.

#### Mes 2. Desarrollo del núcleo funcional

* Construcción del ingreso de información.
* Desarrollo del Agente de Contexto y Diagnóstico.
* Integración con el modelo de lenguaje.
* Desarrollo inicial del Agente Formulador.
* Generación de los primeros componentes.
* Persistencia básica de sesiones.

#### Mes 3. Integración del flujo

* Generación completa de los diez componentes.
* Interfaz de revisión y edición.
* Regeneración de secciones.
* Desarrollo del Agente Ensamblador.
* Reglas de validación básica.
* Integración de la traducción.
* Generación del documento.

#### Mes 4. Estabilización y validación

* Integración completa.
* Pruebas funcionales.
* Corrección de errores.
* Pruebas con usuarios.
* Ajustes de usabilidad.
* Optimización de instrucciones y respuestas.
* Documentación técnica.
* Preparación de la demostración final.

### 3.9. Distribución sugerida del equipo

Los cuatro desarrolladores podrán asumir los siguientes frentes principales:

* **Desarrollador 1:** interfaz web y experiencia de usuario.
* **Desarrollador 2:** backend, persistencia e integración documental.
* **Desarrollador 3:** arquitectura multiagente, integración con el modelo de IA e ingeniería de prompts.
* **Desarrollador 4:** validación, traducción, pruebas, integración y despliegue.

Aunque existan responsabilidades principales, el equipo trabajará de manera colaborativa y realizará revisiones cruzadas para evitar dependencias exclusivas de una sola persona.

### 3.10. Criterios de aceptación del MVP

La prueba de concepto se considerará funcional cuando:

1. Un usuario pueda ingresar una idea básica.
2. El sistema identifique información faltante.
3. El usuario pueda responder preguntas de aclaración.
4. Se generen los diez componentes establecidos.
5. Cada componente pueda visualizarse y editarse.
6. El sistema detecte secciones vacías o faltantes.
7. Los componentes se integren en un único documento.
8. El documento pueda exportarse en al menos un formato.
9. El flujo completo pueda ejecutarse sin intervención directa del equipo desarrollador.
10. El sistema sea probado por un grupo reducido de usuarios.
11. Se documenten los errores, limitaciones y oportunidades de mejora.
12. El resultado se presente expresamente como un borrador sujeto a revisión humana.

### 3.11. Resultado esperado

Al finalizar el periodo de cuatro meses se contará con una **prueba de concepto funcional y demostrable**, con características mínimas de producto viable, capaz de transformar información básica de una idea de proyecto CTeI en un documento preliminar compuesto por diez secciones estructuradas.

El resultado permitirá comprobar:

* La viabilidad de la arquitectura multiagente.
* La utilidad de la interacción guiada.
* La capacidad de la IA generativa para apoyar la redacción inicial.
* La importancia de la revisión humana.
* La posibilidad de integrar, traducir y exportar el contenido.
* Las necesidades técnicas y funcionales de una futura versión institucional.

El MVP no será considerado un producto terminado ni una plataforma lista para operación institucional a gran escala. Constituirá una base experimental para futuras etapas de desarrollo, validación, fortalecimiento metodológico e integración con procesos académicos.


### Incluye

- **Funcionalidades principales del sistema**.
- **Tipo de usuarios involucrados**.
- **Nivel de madurez de la solución** (prototipo, MVP, diseño detallado).
- **Entornos cubiertos** (web, móvil, backend, integración).

### No incluye

- Funcionalidades futuras o deseables.
- Implementaciones a escala productiva.
- Integraciones externas no críticas.
- Soporte operativo post-proyecto.

## 4. Objetivos

Establece el objetivo general del proyecto y los objetivos específicos que guiarán su desarrollo.

Los objetivos refieren a la situación o logros que se pretenden alcanzar con el desarrollo del proyecto. Todos los demás elementos y su estructura se derivan de estos: metodología, marco teórico, resultados, etc. Por ello debe prestarse **mayor atención** en su proceso de formulación.

Deben ser **claros, viables, susceptibles de alcanzarse y congruentes entre sí**. Son la base de la evaluación del proyecto.

Se recomienda que sean **SMART**:

- **S**pecific (específicos): definidos con precisión.
- **M**easurable (medibles): verificables mediante indicadores.
- **A**chievable (alcanzables): realistas según los recursos y el tiempo.
- **R**elevant (relevantes): alineados con el problema y la solución.
- **T**ime-bound (con plazo): acotados en el tiempo del proyecto.

Los objetivos deben redactarse con **verbos en infinitivo** que indiquen acciones concretas y verificables. Verbos recomendados: *desarrollar, diseñar, implementar, evaluar, analizar, determinar, establecer, validar, modelar, construir, integrar, optimizar, documentar, automatizar, configurar, definir, identificar, clasificar, comparar, proponer*. Evitar verbos ambiguos como *conocer, entender, estudiar, saber*.

### 4.1 Objetivo general

Desarrollar, durante un periodo de cuatro meses, una prueba de concepto funcional con características de producto mínimo viable de un sistema multiagente basado en inteligencia artificial generativa, que permita recopilar y organizar la información básica de una idea de proyecto de Ciencia, Tecnología e Innovación —CTeI—, identificar datos faltantes, generar diez componentes estructurales, facilitar su revisión y edición por parte del usuario, y consolidarlos en un documento preliminar integrado y exportable.

### 4.2 Objetivos específicos

OB1 : Diseñar durante los dos primeros meses del proyecto, un mecanismo de interacción guiada que permita recopilar la información básica de una idea de proyecto CTeI, verificar la existencia de los datos mínimos requeridos e identificar vacíos para formular preguntas de aclaración al usuario.

OB2: Integrar entre el segundo y el tercer mes, un motor basado en inteligencia artificial generativa que procese la información consolidada y produzca de manera estructurada los diez componentes definidos para el borrador del proyecto CTeI, incorporando verificaciones básicas de completitud y coherencia.

OB3: Implementar durante el tercer mes, una interfaz que permita al usuario visualizar, modificar, guardar y aprobar individualmente los diez componentes generados, e integrar la última versión guardada de cada sección en un documento preliminar unificado y exportable.

OB4: Integrar y validar, durante el cuarto mes, el funcionamiento de la prueba de concepto mediante la ejecución de pruebas funcionales del recorrido completo y ejercicios de uso con un grupo reducido de usuarios, evaluando la usabilidad, la coherencia general del contenido, el tiempo de generación y la utilidad percibida del sistema.


## 5. Solución propuesta

## 5. Solución propuesta

Se propone construir **Ágora**, una prueba de concepto funcional de un sistema multiagente basado en inteligencia artificial generativa, orientado a apoyar la formulación básica de proyectos de Ciencia, Tecnología e Innovación —CTeI—. La solución estará dirigida principalmente a estudiantes universitarios que cuentan con una idea académica, investigativa o de innovación, pero presentan dificultades para organizarla y convertirla en un borrador estructurado. El sistema no sustituirá la revisión de docentes, investigadores o expertos, sino que funcionará como un asistente para facilitar la etapa inicial de formulación.

De manera general, Ágora permitirá que el usuario ingrese la información básica de su idea mediante una interfaz guiada. A partir de estos datos, el sistema identificará vacíos de información y formulará preguntas de aclaración antes de iniciar la generación del contenido. Posteriormente, los agentes especializados procesarán el contexto consolidado y producirán diez componentes del proyecto: resumen ejecutivo, objetivo general, objetivos específicos, planteamiento del problema, marco teórico, estado del arte, impactos esperados, población beneficiaria, estrategia de sostenibilidad y metodología de ejecución.

Una vez generado el borrador, el usuario podrá visualizar cada componente por separado, editar manualmente su contenido, guardar los cambios y aprobar las secciones antes de su integración. El sistema utilizará la última versión guardada para ensamblar un único documento preliminar y permitir su exportación en al menos un formato. Como funcionalidad complementaria, sujeta al tiempo disponible, podrá incorporarse la regeneración completa de componentes específicos y la traducción del documento al inglés.

La solución se implementará mediante una arquitectura en capas que separará la interfaz de usuario, la lógica de negocio, la orquestación multiagente, los servicios especializados y la persistencia de datos. Este enfoque resulta adecuado para el alcance de cuatro meses y un equipo de cuatro desarrolladores, ya que permite concentrar los esfuerzos en demostrar el funcionamiento completo del flujo principal, desde el registro de la idea hasta la generación del documento integrado. De esta manera, Ágora responde a la necesidad identificada mediante una herramienta viable, modular y centrada en el usuario, capaz de reducir la barrera inicial de formulación y mejorar la organización preliminar de las propuestas CTeI.

## 6. Estado del arte / soluciones relacionadas

Presenta antecedentes o soluciones existentes relevantes, con el fin de contextualizar la propuesta y mostrar oportunidades de diferenciación, mejora o aporte.

Responde a las preguntas: ¿qué soluciones existen hoy?, ¿cómo abordan el problema?, ¿qué limitaciones presentan?

### Revisar

- Productos comerciales.
- Soluciones open-source.
- Arquitecturas o enfoques técnicos relevantes.

### Comparar

- Funcionalidad.
- Escalabilidad.
- Costos.
- Usabilidad.
- Limitaciones técnicas.

### Resultados esperados

- Identificación de **vacíos, oportunidades o problemas no resueltos**.
- **Justificación técnica** de por qué se requiere una nueva solución.

## 7. Metodología de desarrollo y plan de trabajo

Describe el enfoque metodológico que orientará el desarrollo del proyecto y la forma en que este se traducirá en actividades, iteraciones y entregables concretos. Debe explicar cómo se construirá, validará y refinará la solución a lo largo del proceso.

### 7.1 Enfoque metodológico

Explica la metodología adoptada para el desarrollo del proyecto, justificando su elección. En particular, debe describirse el uso de un enfoque de prototipado iterativo, indicando cómo se plantea avanzar mediante ciclos sucesivos de diseño, construcción, prueba y ajuste de la solución.

### 7.2 Iteraciones o fases de desarrollo

Describe las principales fases o iteraciones previstas para el proyecto, indicando el propósito de cada una, las actividades principales a realizar y la manera en que cada ciclo contribuirá al refinamiento progresivo de la solución.

### 7.3 Estrategia de validación

Explica cómo se evaluarán los avances en cada iteración, por ejemplo mediante retroalimentación de usuarios, pruebas funcionales, revisión de requerimientos o validaciones técnicas y de usabilidad.

### 7.4 Plan de trabajo, cronograma o hitos

Presenta la planificación general del proyecto en forma de cronograma, tabla o listado de hitos, indicando las actividades principales, los entregables esperados y, cuando aplique, la temporalidad estimada de cada fase.

## 8. Referencias

Incluye las fuentes consultadas y citadas en el documento, en el formato de citación definido para el curso o proyecto.
