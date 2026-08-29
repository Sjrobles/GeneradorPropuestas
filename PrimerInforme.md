# Primer informe del proyecto

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

Se propone construir **Ágora**, una prueba de concepto funcional de un sistema multiagente basado en inteligencia artificial generativa, orientado a apoyar la formulación básica de proyectos de Ciencia, Tecnología e Innovación —CTeI—. La solución estará dirigida principalmente a estudiantes universitarios que cuentan con una idea académica, investigativa o de innovación, pero presentan dificultades para organizarla y convertirla en un borrador estructurado. El sistema no sustituirá la revisión de docentes, investigadores o expertos, sino que funcionará como un asistente para facilitar la etapa inicial de formulación.

De manera general, Ágora permitirá que el usuario ingrese la información básica de su idea mediante una interfaz guiada. A partir de estos datos, el sistema identificará vacíos de información y formulará preguntas de aclaración antes de iniciar la generación del contenido. Posteriormente, los agentes especializados procesarán el contexto consolidado y producirán diez componentes del proyecto: resumen ejecutivo, objetivo general, objetivos específicos, planteamiento del problema, marco teórico, estado del arte, impactos esperados, población beneficiaria, estrategia de sostenibilidad y metodología de ejecución.

Una vez generado el borrador, el usuario podrá visualizar cada componente por separado, editar manualmente su contenido, guardar los cambios y aprobar las secciones antes de su integración. El sistema utilizará la última versión guardada para ensamblar un único documento preliminar y permitir su exportación en al menos un formato. Como funcionalidad complementaria, sujeta al tiempo disponible, podrá incorporarse la regeneración completa de componentes específicos y la traducción del documento al inglés.

La solución se implementará mediante una arquitectura en capas que separará la interfaz de usuario, la lógica de negocio, la orquestación multiagente, los servicios especializados y la persistencia de datos. Este enfoque resulta adecuado para el alcance de cuatro meses y un equipo de cuatro desarrolladores, ya que permite concentrar los esfuerzos en demostrar el funcionamiento completo del flujo principal, desde el registro de la idea hasta la generación del documento integrado. De esta manera, Ágora responde a la necesidad identificada mediante una herramienta viable, modular y centrada en el usuario, capaz de reducir la barrera inicial de formulación y mejorar la organización preliminar de las propuestas CTeI.

## 6. Estado del arte / soluciones relacionadas

El uso de inteligencia artificial generativa en actividades académicas y de investigación ha crecido considerablemente durante los últimos años. Los modelos de lenguaje permiten generar, resumir, organizar y transformar información a partir de instrucciones proporcionadas por el usuario, lo que los convierte en herramientas con potencial para apoyar diferentes etapas de la construcción de documentos académicos y proyectos. Sin embargo, gran parte de estas herramientas funcionan como asistentes de propósito general y dejan en manos del usuario la responsabilidad de definir qué información proporcionar, qué preguntas realizar y cómo organizar posteriormente los resultados.

Dentro de este grupo se encuentran herramientas como ChatGPT, Gemini y otros asistentes basados en modelos de lenguaje. Su principal ventaja es la capacidad para trabajar con diferentes tipos de solicitudes y adaptarse a las necesidades del usuario. En el contexto académico, pueden utilizarse para generar ideas, estructurar textos, proponer objetivos, explicar conceptos o realizar revisiones preliminares. No obstante, estas herramientas no están diseñadas específicamente para acompañar paso a paso la formulación de un proyecto de Ciencia, Tecnología e Innovación. El usuario debe conocer previamente qué información necesita proporcionar y cómo solicitar cada componente, por lo que una persona con poca experiencia en formulación de proyectos puede obtener resultados incompletos o poco relacionados entre sí.

También existen soluciones especializadas en investigación académica. Un ejemplo es Elicit, una herramienta que utiliza inteligencia artificial para apoyar procesos como la búsqueda de literatura científica, la extracción de información de artículos y la elaboración de síntesis. Este tipo de herramientas resulta especialmente útil cuando el investigador necesita explorar antecedentes o encontrar información relacionada con un problema de investigación. Sin embargo, su propósito principal está relacionado con la investigación y revisión de literatura, y no con la construcción completa de un proyecto a partir de una idea inicial. El usuario todavía debe encargarse de organizar los resultados y convertirlos en una propuesta estructurada.

Otra línea de trabajo relevante corresponde a los sistemas multiagente basados en modelos de lenguaje. En este enfoque, una tarea compleja puede dividirse entre diferentes agentes especializados que tienen responsabilidades específicas y que trabajan de manera coordinada. En lugar de solicitar a un único modelo que realice todo el proceso, es posible asignar diferentes funciones a distintos agentes. Por ejemplo, uno puede encargarse de analizar el contexto, otro de generar contenido y otro de revisar los resultados. Las investigaciones recientes sobre sistemas multiagente muestran que esta organización puede ser útil para resolver tareas que requieren diferentes capacidades y etapas de procesamiento.

Una de las principales referencias en este campo corresponde al trabajo de Li et al. (2024), quienes realizan una revisión de los sistemas multiagente basados en modelos de lenguaje y analizan aspectos relacionados con el flujo de trabajo, la infraestructura y los principales desafíos de este tipo de sistemas. Entre los aspectos señalados se encuentran la coordinación entre agentes, la comunicación, la administración del flujo de trabajo y la confiabilidad de los resultados. Estos elementos son importantes para el proyecto debido a que una arquitectura multiagente no consiste simplemente en utilizar varios modelos de inteligencia artificial, sino en definir claramente las responsabilidades de cada componente y la forma en que intercambian información.

De manera similar, Guo et al. (2024) analizan la evolución de los modelos de lenguaje hacia sistemas compuestos por múltiples agentes. Este trabajo muestra que la división de una tarea compleja en diferentes responsabilidades puede facilitar la construcción de sistemas capaces de abordar procesos que serían más difíciles de manejar mediante un único agente. Al mismo tiempo, se reconocen desafíos relacionados con la coordinación, la comunicación y el control de los resultados generados.

Para implementar este tipo de arquitecturas también existen herramientas de desarrollo como AutoGen y Microsoft Agent Framework, que proporcionan mecanismos para construir aplicaciones en las que diferentes agentes pueden colaborar entre sí y con los usuarios. Estas tecnologías son relevantes como referencia técnica para el proyecto, pero no constituyen por sí mismas una solución para la formulación de proyectos CTeI. Su función es proporcionar infraestructura y mecanismos de coordinación sobre los cuales los desarrolladores deben construir la lógica específica de la aplicación.

A partir de las soluciones revisadas se puede observar que actualmente existen herramientas capaces de generar contenido, apoyar la investigación académica y facilitar la construcción de sistemas multiagente, pero estas capacidades se encuentran generalmente separadas. Las herramientas de inteligencia artificial de propósito general permiten generar textos, pero no necesariamente guían al usuario en la construcción de un proyecto completo. Las herramientas de investigación facilitan la búsqueda y análisis de información académica, pero no abarcan todo el proceso de formulación. Por su parte, los frameworks multiagente proporcionan las bases técnicas para coordinar agentes, pero requieren que el desarrollador defina el problema y construya el flujo específico.

En este sentido, se identifica una oportunidad para desarrollar una solución que conecte estas capacidades dentro de un flujo diseñado específicamente para la formulación inicial de proyectos CTeI. La propuesta de Ágora busca que el proceso no comience directamente con la generación de texto, sino con la recopilación de información y el diagnóstico de lo que el usuario ha proporcionado. A partir de este diagnóstico, el sistema podrá formular preguntas de aclaración, consolidar el contexto y utilizarlo posteriormente para generar los diferentes componentes del proyecto.

Otro aspecto diferenciador de la propuesta es la participación del usuario durante todo el proceso. El contenido generado por la inteligencia artificial no será considerado como una versión definitiva. El usuario podrá revisar cada componente, realizar modificaciones, guardar los cambios y aprobar las secciones antes de construir el documento final. De esta manera, la herramienta se plantea como un mecanismo de apoyo para la formulación y no como un sistema que sustituya el criterio de docentes, investigadores o expertos.

Este enfoque también resulta importante debido a las limitaciones propias de la inteligencia artificial generativa. Los modelos de lenguaje pueden producir información incorrecta, incompleta o poco adecuada para un contexto determinado. UNESCO (2023) señala la importancia de utilizar estas tecnologías de manera responsable en educación e investigación, manteniendo un enfoque centrado en las personas y considerando aspectos como la validación de la información, la privacidad y la supervisión humana.

### Revisar

Las soluciones analizadas pueden agruparse en tres grandes categorías. La primera corresponde a los asistentes de inteligencia artificial generativa de propósito general, que permiten producir y transformar contenido a partir de instrucciones. La segunda está formada por herramientas especializadas en investigación académica, como Elicit, que se concentran principalmente en la búsqueda y análisis de literatura científica. La tercera corresponde a frameworks y arquitecturas para sistemas multiagente, como AutoGen, además de las investigaciones académicas que estudian la coordinación de agentes basados en modelos de lenguaje.

Estas tres categorías proporcionan elementos que pueden ser aprovechados en Ágora. De los asistentes generativos se toma la capacidad de producir contenido a partir del contexto proporcionado. De las herramientas de investigación se reconoce la importancia de organizar y sustentar adecuadamente la información. De los sistemas multiagente se toma el principio de dividir el proceso en responsabilidades especializadas que puedan coordinarse entre sí.

### Comparar

En términos de funcionalidad, las herramientas generativas de propósito general ofrecen una gran variedad de posibilidades, pero no cuentan necesariamente con un flujo especializado para formular proyectos CTeI. Las herramientas académicas presentan una mayor especialización en investigación y literatura, aunque su alcance es diferente al de la propuesta planteada. Los frameworks multiagente, por otro lado, ofrecen capacidades para construir sistemas especializados, pero requieren un desarrollo adicional para convertirse en una solución orientada a usuarios finales.

En cuanto a escalabilidad, una arquitectura basada en agentes especializados permite ampliar progresivamente el sistema mediante la incorporación de nuevas funciones. Por ejemplo, una futura versión podría incorporar agentes destinados a revisar referencias, presupuestos, cronogramas o requisitos específicos de una convocatoria. Sin embargo, aumentar el número de agentes también puede incrementar la complejidad del sistema y el consumo de recursos, por lo que el proyecto inicial mantendrá un conjunto limitado de responsabilidades.

Respecto a los costos, las soluciones comerciales suelen depender del modelo de suscripción o del consumo asociado al uso de los servicios de inteligencia artificial. En el caso de una solución propia también existen costos relacionados con el modelo de lenguaje, almacenamiento, infraestructura y despliegue. Debido a que Ágora corresponde inicialmente a una prueba de concepto, la prioridad será demostrar el funcionamiento del sistema y no alcanzar desde esta primera versión una operación masiva o altamente optimizada.

En términos de usabilidad, las herramientas generales ofrecen mayor libertad, pero requieren que el usuario sepa cómo interactuar con ellas para obtener resultados adecuados. Ágora plantea reducir esta dificultad mediante una experiencia guiada en la que el sistema indique progresivamente qué información necesita y qué acciones debe realizar el usuario.

Finalmente, las soluciones existentes presentan limitaciones relacionadas con la confiabilidad del contenido generado, la dependencia de proveedores externos, la privacidad de la información y la necesidad de supervisión humana. Estas limitaciones serán consideradas dentro del proyecto y constituyen una de las razones por las cuales el resultado generado por Ágora será presentado como un borrador preliminar y no como un proyecto automáticamente validado.

### Resultados esperados

El análisis realizado permite identificar como principal oportunidad la integración de diferentes capacidades que actualmente suelen encontrarse separadas. Existe una amplia disponibilidad de herramientas capaces de generar texto y apoyar la investigación, así como tecnologías para desarrollar sistemas multiagente, pero existe espacio para una solución que integre estas capacidades dentro de un proceso guiado específicamente orientado a estudiantes que necesitan transformar una idea inicial en un borrador estructurado.

Ágora busca aprovechar esta oportunidad mediante un flujo que comienza con la captura de información, continúa con un diagnóstico y preguntas de aclaración, genera los componentes del proyecto y posteriormente permite su revisión, edición, aprobación y ensamblaje. La arquitectura multiagente permitirá separar estas responsabilidades y facilitar su evolución durante futuras etapas del proyecto.

La principal justificación técnica de la propuesta se encuentra, por tanto, en la integración de estas capacidades dentro de una solución específica para la formulación inicial de proyectos CTeI. El objetivo no es desarrollar un nuevo modelo de inteligencia artificial, sino utilizar tecnologías existentes para construir una experiencia especializada que facilite el proceso de formulación y mantenga al usuario como responsable de la revisión y aprobación del resultado.

## 7. Metodología de desarrollo y plan de trabajo

El desarrollo de Ágora se realizará mediante un enfoque de prototipado iterativo e incremental. La decisión de utilizar este enfoque responde a las características del proyecto, ya que la solución integra una interfaz web, servicios de backend, persistencia de información, inteligencia artificial generativa y diferentes componentes especializados que posteriormente deberán comunicarse entre sí.

En lugar de desarrollar todos estos componentes simultáneamente, el proyecto se organizará en fases sucesivas. Primero se construirá y validará la experiencia completa del usuario en el frontend utilizando datos simulados. Una vez que este recorrido se encuentre definido y probado, se procederá a desarrollar los servicios reales que permitirán reemplazar progresivamente la información simulada.

Esta estrategia permite reducir la complejidad durante las primeras etapas y detectar de manera temprana problemas relacionados con navegación, interacción, diseño y experiencia de usuario. También permite que el desarrollo del backend y de los agentes se realice sobre un flujo de usuario previamente definido, evitando que ambas partes tengan que desarrollarse completamente al mismo tiempo.

El proceso seguirá ciclos de diseño, implementación, prueba y ajuste. Cada fase tendrá objetivos concretos y producirá un resultado funcional que servirá como base para la siguiente. De esta manera, el sistema se irá construyendo progresivamente hasta llegar a una integración completa.

### 7.1 Enfoque metodológico

El proyecto utilizará un enfoque de desarrollo iterativo debido a que algunos aspectos de la solución, especialmente los relacionados con la interacción con los agentes de inteligencia artificial, pueden requerir ajustes a medida que se realicen las pruebas. La metodología permitirá evaluar cada parte del sistema antes de integrarla con las demás.

La primera parte del desarrollo estará enfocada en el frontend. Se utilizará React con Vite y TypeScript, acompañado de las herramientas necesarias para la construcción de la interfaz, validación de formularios, manejo de rutas, pruebas y organización visual. Durante esta etapa se utilizarán datos simulados mediante MockAPI para representar las respuestas que posteriormente serán proporcionadas por el backend y los agentes.

Una vez construido el flujo principal del frontend, se comenzará la integración de los servicios reales. En esta segunda parte se desarrollarán el backend, la base de datos, la autenticación y las API necesarias. Posteriormente se incorporará el orquestador y los agentes encargados de las diferentes etapas de procesamiento.

Este enfoque permite separar dos problemas que, aunque están relacionados, pueden validarse de manera independiente. Primero se comprobará que el usuario pueda completar correctamente el proceso de formulación. Después se comprobará que los servicios internos puedan proporcionar la información necesaria para que ese proceso funcione con datos reales.

### 7.2 Iteraciones o fases de desarrollo

La primera fase estará dedicada al Bootstrap del frontend. En esta etapa se creará el proyecto utilizando React, Vite y TypeScript y se configurarán las herramientas principales que acompañarán el desarrollo. También se establecerá la estructura inicial del proyecto, las rutas, los proveedores, los elementos visuales reutilizables y la organización general de la aplicación. El objetivo será disponer de una base estable que permita desarrollar las siguientes funcionalidades.

La segunda fase estará orientada a la Landing y selección inicial. Se construirá la pantalla de entrada de Ágora y el flujo mediante el cual el usuario podrá iniciar un proyecto, seleccionar la habilidad o tipo de proceso que desea utilizar y seleccionar el idioma. El diseño se realizará tomando como referencia los prototipos elaborados en Figma y se tendrá en cuenta desde esta etapa el comportamiento de la aplicación en diferentes tamaños de pantalla.

La tercera fase corresponderá al Chat y diagnóstico. En ella se construirá la interacción conversacional que permitirá recopilar información de la idea. El sistema mostrará mensajes, permitirá ingresar respuestas y manejará estados como carga y procesamiento. También se implementará el diagnóstico, las preguntas de aclaración y el resumen del contexto recopilado. Antes de continuar, el usuario podrá revisar el contexto y confirmar o editar la información. Durante esta fase las respuestas serán simuladas, lo que permitirá validar el flujo sin depender todavía de la implementación del backend o de los agentes reales.

La cuarta fase estará dedicada al Workspace. Se desarrollará el espacio de trabajo donde se presentarán los diez componentes del proyecto. En esta etapa se implementarán los estados de cada componente, el progreso general, el editor y las acciones de guardar y aprobar. También se incorporarán advertencias para señalar información pendiente o componentes que requieran atención. Al igual que en la fase anterior, los datos serán simulados para concentrar inicialmente el esfuerzo en la experiencia de usuario.

La quinta fase estará enfocada en el documento final. Se desarrollará la interfaz necesaria para ensamblar los componentes, visualizar una previsualización del resultado, acceder a las opciones de exportación y manejar la traducción. El objetivo será completar el recorrido del usuario hasta el resultado final utilizando todavía datos simulados.

La sexta fase estará dedicada a la calidad del frontend. Antes de comenzar la integración con los servicios reales se revisará el comportamiento responsive, la accesibilidad, el manejo de errores, los estados de carga, las pruebas automatizadas, el proceso de construcción de la aplicación y el rendimiento básico. También se realizará una limpieza general del código para garantizar que la base desarrollada pueda continuar creciendo sin introducir problemas innecesarios.

Al finalizar estas fases se tendrá un frontend funcional que permitirá recorrer el proceso completo de Ágora utilizando datos simulados. Este resultado servirá como base para iniciar la siguiente etapa del proyecto, en la que se reemplazarán progresivamente los elementos simulados por los servicios reales.

Las fases posteriores estarán orientadas al desarrollo del backend y la integración del sistema. Primero se implementará la persistencia mediante MongoDB, la autenticación y las API necesarias para comunicar el frontend con los servicios internos. Posteriormente se desarrollará el orquestador encargado de coordinar las diferentes etapas del proceso.

Una vez establecido el mecanismo de coordinación se implementará el agente encargado del contexto y diagnóstico, cuya función será analizar la información proporcionada por el usuario, identificar datos faltantes y generar preguntas de aclaración. Después se desarrollará el agente encargado de la formulación junto con los subagentes que sean necesarios para generar los diferentes componentes del proyecto.

Con los mecanismos de generación implementados se incorporará la validación orientada a detectar problemas básicos de completitud y coherencia. Esta etapa permitirá comprobar que los componentes requeridos existan y que mantengan relaciones básicas entre ellos, sin pretender realizar una evaluación científica o institucional completa.

Posteriormente se implementará el ensamblaje del documento utilizando las versiones de los componentes que hayan sido guardadas y aprobadas por el usuario. Sobre este flujo se incorporarán las funciones de traducción y exportación.

Finalmente se realizará la integración completa, las pruebas del sistema y el despliegue de la solución. Durante esta etapa se comprobará el recorrido completo desde el ingreso de la idea hasta la obtención del documento final y se corregirán los problemas encontrados durante las pruebas.

### 7.3 Estrategia de validación

La validación será un proceso continuo durante el desarrollo. Cada fase será sometida a pruebas antes de utilizarla como base para la siguiente etapa. De esta manera, los errores podrán detectarse cuando el componente todavía se encuentra aislado y su corrección sea menos costosa.

En las primeras fases se realizarán pruebas sobre la estructura y comportamiento del frontend. Se comprobará que las rutas, formularios, componentes y estados funcionen correctamente y que la aplicación pueda ejecutarse, construirse y validarse mediante las herramientas configuradas para el proyecto.

En el flujo de diagnóstico se verificará que el usuario pueda proporcionar la información solicitada, responder preguntas de aclaración, consultar el resumen de su contexto y modificarlo antes de continuar. En el Workspace se comprobará que los diez componentes puedan visualizarse, editarse, guardarse y aprobarse de manera independiente.

También se verificará que las modificaciones realizadas por el usuario se mantengan durante el proceso. Una sección modificada manualmente deberá conservar la última versión guardada y esta será la que se utilice posteriormente durante el ensamblaje del documento.

Una vez incorporado el backend se realizarán pruebas de integración para comprobar la comunicación entre la interfaz, las API, la base de datos y los servicios de inteligencia artificial. Se verificará que la información proporcionada durante el diagnóstico llegue correctamente al proceso de generación y que los resultados puedan regresar al frontend sin pérdida de información.

Los agentes también serán evaluados de manera individual y posteriormente dentro del flujo completo. El diagnóstico será evaluado según su capacidad para identificar información insuficiente y formular preguntas relacionadas con los vacíos encontrados. La generación será evaluada considerando si los componentes producidos corresponden al contexto proporcionado y si respetan la estructura definida para el proyecto.

La validación no se limitará a comprobar que el sistema funcione técnicamente. También se realizarán ejercicios de uso con un grupo reducido de usuarios, principalmente estudiantes y personas relacionadas con actividades académicas o de investigación. Durante estas pruebas se observará si las instrucciones son comprensibles, si las preguntas permiten completar adecuadamente la información, si el proceso resulta fácil de seguir y si la revisión y edición de los componentes se realiza de manera clara.

También se tendrá en cuenta el tiempo necesario para completar el flujo, la utilidad percibida de la herramienta y la percepción de coherencia del documento generado. Los resultados obtenidos servirán para realizar ajustes tanto en la interfaz como en las instrucciones utilizadas por los agentes.

La validación del contenido generado tendrá un alcance preliminar. El sistema no certificará que un proyecto sea científica, financiera, técnica o institucionalmente viable. El propósito será comprobar que la herramienta pueda ayudar al usuario a construir un primer borrador organizado y que este pueda ser posteriormente revisado por una persona con los conocimientos necesarios.

### 7.4 Plan de trabajo, cronograma o hitos

El trabajo se desarrollará de manera progresiva durante los cuatro meses establecidos para el proyecto. La primera parte estará concentrada en construir el frontend y validar la experiencia completa antes de comenzar con la integración de los servicios reales.

Durante las primeras etapas se desarrollará la estructura base del frontend y posteriormente las interfaces correspondientes a la Landing, la selección inicial, el chat, el diagnóstico y el espacio de trabajo. A continuación se implementará el módulo de documento y se realizarán las actividades de calidad necesarias para dejar estable el recorrido completo.

Una vez finalizada esta primera etapa se contará con una versión funcional del recorrido del usuario utilizando datos simulados. Este punto permitirá comenzar la implementación del backend sobre una interfaz que ya ha sido probada y cuyo comportamiento esperado se encuentra definido.

En la segunda parte del desarrollo se implementarán progresivamente MongoDB, autenticación y las API. Después se incorporará el orquestador y se desarrollarán los componentes de inteligencia artificial responsables del diagnóstico, la formulación y las diferentes tareas especializadas.

Posteriormente se integrarán los mecanismos de validación, ensamblaje, traducción y exportación. Estas funciones serán conectadas con el frontend para reemplazar las respuestas simuladas utilizadas durante las primeras fases.

La última etapa estará dedicada a la integración, pruebas y despliegue. Se ejecutarán pruebas del flujo completo, se corregirán errores y se realizarán pruebas con usuarios para obtener retroalimentación sobre la utilidad y facilidad de uso de la solución.

La distribución temporal se plantea de manera flexible debido a que algunas actividades pueden desarrollarse en paralelo. El equipo de cuatro desarrolladores podrá trabajar sobre diferentes componentes de manera simultánea, manteniendo puntos de integración periódicos para garantizar que las partes desarrolladas continúen siendo compatibles.

El criterio principal para priorizar las actividades será mantener funcional el recorrido central del sistema. Por esta razón, las funcionalidades esenciales tendrán prioridad sobre características complementarias. El objetivo será garantizar que el usuario pueda ingresar una idea, completar el diagnóstico, obtener los componentes, revisarlos, modificarlos, aprobarlos y finalmente consolidarlos en un documento antes de dedicar esfuerzos significativos a funcionalidades adicionales.

## 8. Referencias

Elicit. (s. f.). *Elicit: The AI Research Assistant*. https://elicit.com/

Guo, T., Chen, X., Wang, Y., Chang, R., Pei, S., Chawla, N. V., Wiest, O., & Zhang, X. (2024). *Large Language Model based Multi-Agents: A Survey of Progress and Challenges*. Proceedings of the Thirty-Third International Joint Conference on Artificial Intelligence, 8048–8057. https://doi.org/10.24963/ijcai.2024/890

Li, X., Wang, S., Zeng, S., Wu, Y., & Yang, Y. (2024). *A Survey on LLM-based Multi-Agent Systems: Workflow, Infrastructure, and Challenges*. Vicinagearth, 1, 9. https://doi.org/10.1007/s44336-024-00009-2

Microsoft. (s. f.). *AutoGen*. GitHub. https://github.com/microsoft/autogen

Microsoft. (s. f.). *Microsoft Agent Framework*. GitHub. https://github.com/microsoft/agent-framework

UNESCO. (2023). *Guidance for Generative AI in Education and Research*. UNESCO. https://unesdoc.unesco.org/ark:/48223/pf0000386693

OpenAI. (s. f.). *ChatGPT*. https://chatgpt.com/

Google. (s. f.). *Gemini*. https://gemini.google.com/
