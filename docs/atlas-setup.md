# Configuración sencilla de MongoDB Atlas

MongoDB Atlas será la base de datos principal de desarrollo para Ágora. Docker
no es necesario.

## Antes de empezar

Necesitas una cuenta de MongoDB Atlas y acceso al correo utilizado para
registrarte. No compartas con otras personas la contraseña del usuario de base
de datos ni el contenido del archivo `backend/.env`.

## Paso 1 — Crear la cuenta y el proyecto

1. Abre <https://www.mongodb.com/atlas>.
2. Selecciona **Try Free** o **Sign Up** e inicia sesión.
3. Cuando Atlas solicite una organización o proyecto, crea un proyecto llamado
   `Agora`.
4. Dentro del proyecto, elige **Create**, **Build a Database** o la acción
   equivalente para crear el primer despliegue.

Los nombres exactos de algunos botones pueden variar, pero Atlas mantiene el
flujo de proyecto → despliegue → seguridad → conexión.

## Paso 2 — Crear el despliegue

1. Selecciona la alternativa sin costo que Atlas muestre para aprendizaje o
   desarrollo. Actualmente puede aparecer como un clúster `M0` o una opción de
   inicio equivalente.
2. Mantén un proveedor y región cercanos o deja la selección recomendada.
3. Usa `AgoraCluster` como nombre si Atlas permite definirlo.
4. Confirma la creación y espera a que el despliegue esté disponible.

No cargues datos de ejemplo: Ágora creará sus propias colecciones.

## Paso 3 — Crear el usuario de base de datos

El usuario de Atlas para entrar al sitio y el usuario de la base de datos son
credenciales diferentes.

1. Abre **Security → Database Access** o usa el asistente **Quickstart**.
2. Crea un usuario con autenticación por nombre y contraseña.
3. Nombre sugerido: `agora_app`.
4. Genera una contraseña larga y guárdala temporalmente en un gestor seguro.
5. Para desarrollo, concede lectura y escritura sobre las bases del proyecto.

Para evitar errores al comenzar, utiliza una contraseña alfanumérica larga. Si
contiene caracteres especiales, deberán codificarse para poder usarlos dentro
de una URL.

## Paso 4 — Autorizar este computador

1. Abre **Security → Network Access** o continúa en **Quickstart**.
2. Selecciona **Add My Current IP Address**.
3. Añade una descripción como `Mac desarrollo Agora`.
4. Guarda la entrada.

Atlas sólo acepta conexiones provenientes de direcciones incluidas en esta
lista. Si cambia tu dirección de internet, tendrás que actualizarla. Para esta
etapa no recomendamos habilitar acceso desde cualquier lugar (`0.0.0.0/0`).

## Paso 5 — Copiar la conexión de la aplicación

1. Regresa al despliegue y selecciona **Connect**.
2. Elige **Drivers** o **Connect your application**.
3. Selecciona **Node.js** como driver.
4. Copia la cadena que comienza por `mongodb+srv://`.
5. Sustituye `<password>` por la contraseña del usuario `agora_app`.
6. Añade `/agora` antes de los parámetros para que la aplicación utilice esa
   base de datos.

La forma final será parecida a esta, pero con valores distintos:

```text
mongodb+srv://agora_app:CONTRASEÑA@cluster.example.mongodb.net/agora?retryWrites=true&w=majority
```

No publiques esa cadena en GitHub ni la envíes por el chat.

## Paso 6 — Configurar el backend

Desde la carpeta del backend:

```bash
cd backend
cp .env.example .env
```

Abre `.env` y reemplaza únicamente `MONGODB_URI`. También cambia
`JWT_SECRET` por una frase aleatoria de al menos 32 caracteres.

Después comprueba la conexión:

```bash
pnpm db:ping
```

El resultado esperado es:

```text
Conexión correcta con MongoDB Atlas.
Base de datos: agora
```

## Paso 7 — Levantar la API

```bash
pnpm start:dev
```

Comprueba en el navegador:

- <http://127.0.0.1:3000/api/v1/health/live>
- <http://127.0.0.1:3000/api/v1/health/ready>
- <http://127.0.0.1:3000/api/docs>

## Errores frecuentes

### `bad auth`

El usuario, la contraseña o la codificación de caracteres especiales no
coinciden.

### `IP ... is not allowed`

La IP actual del computador no está incluida en **Network Access**.

### `querySrv ENOTFOUND`

El host del clúster fue copiado incorrectamente o existe un problema de DNS.

### La aplicación tarda y termina con `server selection timeout`

Revisa que el despliegue esté activo, la IP esté autorizada y la red permita
conexiones salientes a Atlas.
