import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootEnvPath = path.resolve(__dirname, '../../../../.env')
const rootEnvLocalPath = path.resolve(__dirname, '../../../../.env.local')

const parseBoolean = (value) => {
  if (typeof value !== 'string') {
    return undefined
  }

  return value.toLowerCase() === 'true'
}

const parseNumber = (value) => {
  const parsedValue = Number(value)

  return Number.isNaN(parsedValue) ? undefined : parsedValue
}

dotenv.config({
  path: rootEnvPath,
})

dotenv.config({
  path: rootEnvLocalPath,
  override: true,
})

const env = {
  PORT: parseNumber(process.env.PORT),
  MONGO_URI: process.env.MONGO_URI,
  MINIO_ENDPOINT: process.env.MINIO_ENDPOINT,
  MINIO_PORT: parseNumber(process.env.MINIO_PORT),
  MINIO_USE_SSL: parseBoolean(process.env.MINIO_USE_SSL),
  MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY,
  MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY,
  MINIO_BUCKET: process.env.MINIO_BUCKET,
  MINIO_PUBLIC_BASE_URL: process.env.MINIO_PUBLIC_BASE_URL,
  RABBITMQ_URL: process.env.RABBITMQ_URL,
  RABBITMQ_ASSET_QUEUE: process.env.RABBITMQ_ASSET_QUEUE,
  MAX_FILE_SIZE_BYTES: parseNumber(process.env.MAX_FILE_SIZE_BYTES),
  UPLOAD_TMP_DIR: process.env.UPLOAD_TMP_DIR,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE,
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN,
}

export const {
  PORT,
  MONGO_URI,
  MINIO_ENDPOINT,
  MINIO_PORT,
  MINIO_USE_SSL,
  MINIO_ACCESS_KEY,
  MINIO_SECRET_KEY,
  MINIO_BUCKET,
  MINIO_PUBLIC_BASE_URL,
  RABBITMQ_URL,
  RABBITMQ_ASSET_QUEUE,
  MAX_FILE_SIZE_BYTES,
  UPLOAD_TMP_DIR,
  JWT_SECRET,
  JWT_EXPIRE,
  FRONTEND_ORIGIN,
} = env

export default env
