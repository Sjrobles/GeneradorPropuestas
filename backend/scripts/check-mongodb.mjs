import mongoose from 'mongoose'

const uri = process.env.MONGODB_URI

if (!uri) {
  throw new Error('MONGODB_URI no está configurada en backend/.env')
}

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 })
  await mongoose.connection.db.admin().ping()
  console.log('Conexión correcta con MongoDB Atlas.')
  console.log(`Base de datos: ${mongoose.connection.name}`)
} catch (error) {
  console.error('No fue posible conectar con MongoDB Atlas.')
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
} finally {
  await mongoose.disconnect()
}
