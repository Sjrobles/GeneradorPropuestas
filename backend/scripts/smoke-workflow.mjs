import { randomBytes, randomUUID } from 'node:crypto'

const baseUrl = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:3000/api/v1'
const fullWorkflow = process.env.SMOKE_FULL === '1'

async function request(path, options = {}, token) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body && !(options.body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    signal: AbortSignal.timeout(20 * 60_000),
  })
  if (!response.ok) {
    const body = await response.text()
    throw new Error(
      `${options.method ?? 'GET'} ${path}: ${response.status} ${body}`,
    )
  }
  const contentType = response.headers.get('content-type') ?? ''
  return contentType.includes('application/json')
    ? response.json()
    : response.arrayBuffer()
}

async function waitForProject(projectId, token, expectedStates, maxMinutes) {
  const deadline = Date.now() + maxMinutes * 60_000
  let lastState = ''
  while (Date.now() < deadline) {
    const project = await request(`/projects/${projectId}`, {}, token)
    if (project.state !== lastState) {
      console.log(`Estado del proyecto: ${project.state}`)
      lastState = project.state
    }
    if (expectedStates.includes(project.state)) return project
    if (project.state === 'error') {
      throw new Error(
        `La generación terminó en estado error (${project.generationJob?.errorCode ?? 'sin código'}): ${project.generationJob?.errorMessage ?? 'sin detalle'}`,
      )
    }
    await new Promise((resolve) => setTimeout(resolve, 2_000))
  }
  throw new Error(`El proyecto no alcanzó ${expectedStates.join(' o ')}`)
}

const suffix = `${Date.now()}-${randomUUID().slice(0, 8)}`
const credentials = {
  email: `codex-smoke-${suffix}@example.com`,
  name: 'Prueba automática Ágora',
  password: `Qa-${randomBytes(16).toString('hex')}`,
}

console.log(`Comprobando ${baseUrl}`)
const live = await request('/health/live')
const ready = await request('/health/ready')
if (live.status !== 'ok' || ready.status !== 'ready') {
  throw new Error('Los health checks no están disponibles')
}
console.log(`Health correcto; MongoDB respondió en ${ready.responseTimeMs} ms`)

const session = await request('/auth/register', {
  body: JSON.stringify(credentials),
  method: 'POST',
})
const token = session.accessToken
await request('/auth/me', {}, token)
console.log('Registro, JWT y consulta de perfil correctos')

const project = await request(
  '/projects',
  {
    body: JSON.stringify({
      selectedSkillId: 'international-calls',
      title: `Prueba de resiliencia Ágora ${suffix}`,
    }),
    method: 'POST',
  },
  token,
)

const answers = [
  'Baja capacidad de organizaciones rurales para formular y hacer seguimiento a proyectos de innovación productiva.',
  'Treinta asociaciones de pequeños productores rurales y sus equipos técnicos.',
  'Municipios rurales del departamento de Bolívar, Colombia.',
  'Implementar un programa de diagnóstico, formación, asistencia técnica y una herramienta digital de seguimiento.',
  'Treinta organizaciones caracterizadas, sesenta personas capacitadas y una herramienta digital validada.',
  '2',
  'Incluye diagnóstico, formación, acompañamiento y piloto; excluye obras civiles y compra de predios.',
  '8 meses, con cierre técnico durante el octavo mes.',
]
for (const content of answers) {
  await request(
    `/projects/${project.id}/messages`,
    { body: JSON.stringify({ content }), method: 'POST' },
    token,
  )
}
await request(`/projects/${project.id}/diagnosis`, { method: 'POST' }, token)
await request(
  `/projects/${project.id}/context/confirm`,
  { method: 'POST' },
  token,
)
console.log('Contexto persistido y confirmado')

if (!fullWorkflow) {
  console.log('Smoke básico completado correctamente')
  process.exit(0)
}

const firstJob = await request(
  `/projects/${project.id}/components/generate`,
  { method: 'POST' },
  token,
)
if (!firstJob.generationId) throw new Error('La generación no devolvió id')
console.log('Primera generación aceptada en segundo plano')
await waitForProject(project.id, token, ['waiting_execution_details'], 20)

const partialComponents = await request(
  `/projects/${project.id}/components`,
  {},
  token,
)
if (
  partialComponents.filter(({ status }) => status === 'generated').length < 8
) {
  throw new Error('Investigación e Ideación no quedaron persistidas')
}
console.log('Investigación e Ideación persistidas antes de Metodología')

await request(
  `/projects/${project.id}/execution-details`,
  {
    body: JSON.stringify({
      activityDevelopment:
        'Cada actividad inicia con planeación, continúa con ejecución participativa, validación y cierre documentado.',
      expectedDeliverables:
        'Diagnóstico, cuatro talleres, planes de mejora, prototipo funcional, informe de validación e informe final.',
      knownEconomicInformation:
        'Presupuesto máximo estimado de 180.000.000 COP. La organización aporta espacios y equipos de cómputo.',
      locationsAndParticipants:
        'Municipios rurales de Bolívar con treinta organizaciones y aproximadamente sesenta participantes seleccionados mediante convocatoria.',
      participants:
        'Coordinación, profesional agrónomo, facilitador, desarrollador, diseñador, apoyo logístico y líderes de las asociaciones.',
      requiredResources:
        'Transporte, alimentación, materiales pedagógicos, licencias, alojamiento web, equipos audiovisuales y producción de informes.',
      specialConditions:
        'Protección de datos, accesibilidad, enfoque diferencial, consentimiento informado y ejecución total en ocho meses.',
      timelineAndDependencies:
        'Ocho meses. El diagnóstico precede la formación; la formación precede el acompañamiento y el prototipo se valida al final.',
      verificationMethods:
        'Listas de asistencia, actas, fotografías autorizadas, pruebas del prototipo, encuestas, indicadores e informes aprobados.',
    }),
    method: 'PATCH',
  },
  token,
)
await request(
  `/projects/${project.id}/execution-details/confirm`,
  { method: 'POST' },
  token,
)
const secondJob = await request(
  `/projects/${project.id}/components/generate`,
  { method: 'POST' },
  token,
)
if (!secondJob.generationId) throw new Error('La reanudación no devolvió id')
console.log('Reanudación aceptada desde Metodología')
await waitForProject(project.id, token, ['waiting_review'], 25)

const components = await request(
  `/projects/${project.id}/components`,
  {},
  token,
)
if (
  components.length !== 13 ||
  components.some(({ status }) => status !== 'generated')
) {
  throw new Error('Los trece componentes no terminaron correctamente')
}
for (const component of components) {
  await request(
    `/projects/${project.id}/components/${component.id}/approve`,
    { method: 'POST' },
    token,
  )
}
console.log('Trece componentes aprobados')

const document = await request(
  `/projects/${project.id}/document/assemble`,
  { method: 'POST' },
  token,
)
if (!document.content || document.sections.length !== 13) {
  throw new Error('El documento consolidado está incompleto')
}
const workbook = await request(
  `/projects/${project.id}/components/budget/workbook`,
  {
    headers: {
      Accept:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
  },
  token,
)
if (workbook.byteLength === 0) throw new Error('El Excel está vacío')
await request(`/projects/${project.id}/complete`, { method: 'POST' }, token)
const projects = await request('/projects', {}, token)
if (!projects.some(({ id }) => id === project.id)) {
  throw new Error('El proyecto no reapareció en el perfil')
}

console.log('Flujo completo, persistencia y Excel verificados correctamente')
