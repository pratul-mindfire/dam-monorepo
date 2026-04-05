import fs from 'fs'
import path from 'path'
import { pipeline } from 'stream/promises'
import ffmpeg from 'fluent-ffmpeg'
import sharp from 'sharp'
import { ASSET_MESSAGES } from '@/constants'
import { MINIO_BUCKET } from '@/config/env'
import { minioClient } from '@/config/minio'
import AppError from '@/utils/app-error'

const buildObjectName = (originalName) =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${originalName}`

const isImage = (mimeType = '') => mimeType.startsWith('image/')

const isVideo = (mimeType = '') => mimeType.startsWith('video/')

const uploadBufferToMinio = async ({ objectName, buffer, contentType }) => {
  await minioClient.putObject(MINIO_BUCKET, objectName, buffer, buffer.length, {
    'Content-Type': contentType,
  })

  return {
    bucket: MINIO_BUCKET,
    objectName,
    contentType,
    size: buffer.length,
  }
}

const uploadFileToMinio = async ({ objectName, filePath, contentType }) => {
  const stats = await fs.promises.stat(filePath)
  const stream = fs.createReadStream(filePath)

  await minioClient.putObject(MINIO_BUCKET, objectName, stream, stats.size, {
    'Content-Type': contentType,
  })

  return {
    bucket: MINIO_BUCKET,
    objectName,
    contentType,
    size: stats.size,
  }
}

const downloadObjectToFile = async ({ objectName, destinationPath }) => {
  const objectStream = await minioClient.getObject(MINIO_BUCKET, objectName)
  const fileStream = fs.createWriteStream(destinationPath)
  await pipeline(objectStream, fileStream)
}

const ffprobeAsync = (filePath) =>
  new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (error, metadata) => {
      if (error) {
        reject(error)
        return
      }

      resolve(metadata)
    })
  })

const transcodeVideo = ({ inputPath, outputPath, height, includeAudio }) =>
  new Promise((resolve, reject) => {
    const command = ffmpeg(inputPath)
      .outputOptions(['-movflags +faststart', '-preset veryfast', '-crf 23'])
      .videoCodec('libx264')
      .format('mp4')
      .size(`?x${height}`)
      .on('end', resolve)
      .on('error', reject)

    if (includeAudio) {
      command.audioCodec('aac')
    } else {
      command.noAudio()
    }

    command.save(outputPath)
  })

const captureVideoThumbnail = ({ inputPath, outputPath, timestamp }) =>
  new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions(['-frames:v 1'])
      .on('end', resolve)
      .on('error', reject)
      .screenshots({
        timestamps: [timestamp],
        filename: path.basename(outputPath),
        folder: path.dirname(outputPath),
      })
  })

const generateImageDerivatives = async ({ asset, objectName }) => {
  const sourceBuffer = await minioClient
    .getObject(MINIO_BUCKET, objectName)
    .then(async (stream) => {
      const chunks = []

      for await (const chunk of stream) {
        chunks.push(chunk)
      }

      return Buffer.concat(chunks)
    })

  const thumbnailSizes = [320, 640]
  const thumbnails = []

  for (const width of thumbnailSizes) {
    const buffer = await sharp(sourceBuffer)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer()

    const thumbnailObjectName = buildObjectName(
      `${path.parse(asset.originalName || asset.filename).name}-thumb-${width}.jpg`
    )

    thumbnails.push(
      await uploadBufferToMinio({
        objectName: thumbnailObjectName,
        buffer,
        contentType: 'image/jpeg',
      })
    )
  }

  return { thumbnails }
}

const generateVideoDerivatives = async ({ asset, objectName, tempDir }) => {
  const sourceExtension = path.extname(asset.originalName || asset.filename || '') || '.bin'
  const inputPath = path.join(tempDir, `source${sourceExtension}`)
  await downloadObjectToFile({ objectName, destinationPath: inputPath })

  const metadata = await ffprobeAsync(inputPath)
  const videoStream = metadata.streams?.find((stream) => stream.codec_type === 'video')

  if (!videoStream) {
    throw AppError.badRequest(`${ASSET_MESSAGES.videoStreamMissingPrefix} ${asset._id}`)
  }

  const sourceHeight = Number(videoStream.height) || 0
  const duration = Number(metadata.format?.duration) || 0
  const includeAudio = metadata.streams?.some((stream) => stream.codec_type === 'audio')
  const targetHeights = [1080, 720, 480, 360, 240, 144].filter(
    (height) => sourceHeight === 0 || height <= sourceHeight
  )
  const variants = []
  const thumbnails = []

  for (const width of [320, 640]) {
    const thumbnailPath = path.join(tempDir, `video-thumb-${width}.jpg`)
    const thumbnailTimestamp = duration > 0 ? Math.min(duration * 0.25, 3) : 0

    await captureVideoThumbnail({
      inputPath,
      outputPath: thumbnailPath,
      timestamp: thumbnailTimestamp,
    })

    const resizedThumbnailBuffer = await sharp(thumbnailPath)
      .resize({ width, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer()

    const thumbnailObjectName = buildObjectName(
      `${path.parse(asset.originalName || asset.filename).name}-thumb-${width}.jpg`
    )

    thumbnails.push(
      await uploadBufferToMinio({
        objectName: thumbnailObjectName,
        buffer: resizedThumbnailBuffer,
        contentType: 'image/jpeg',
      })
    )
  }

  for (const height of targetHeights) {
    const outputPath = path.join(tempDir, `${height}p.mp4`)
    await transcodeVideo({ inputPath, outputPath, height, includeAudio })

    const transcodedObjectName = buildObjectName(
      `${path.parse(asset.originalName || asset.filename).name}-${height}p.mp4`
    )

    const uploadedVariant = await uploadFileToMinio({
      objectName: transcodedObjectName,
      filePath: outputPath,
      contentType: 'video/mp4',
    })

    variants.push({
      ...uploadedVariant,
      resolution: `${height}p`,
    })
  }

  return {
    thumbnails,
    variants,
    source: {
      width: Number(videoStream.width) || undefined,
      height: sourceHeight || undefined,
      duration: duration || undefined,
    },
  }
}

const removeObjectIfExists = async (objectName) => {
  if (!objectName) {
    return
  }

  try {
    await minioClient.removeObject(MINIO_BUCKET, objectName)
  } catch (error) {
    if (error.code !== 'NoSuchKey' && error.code !== 'NotFound') {
      throw error
    }
  }
}

const uploadFileToStorage = async ({ file, userId, status }) => {
  const objectName = buildObjectName(file.originalname)
  const metaData = {
    'Content-Type': file.mimetype,
  }

  try {
    const stream = fs.createReadStream(file.path)
    await minioClient.putObject(MINIO_BUCKET, objectName, stream, file.size, metaData)

    return {
      document: {
        userId,
        originalName: file.originalname,
        filename: objectName,
        bucket: MINIO_BUCKET,
        type: file.mimetype,
        size: file.size,
        tags: [file.mimetype.split('/')[0]],
        metadata: {
          fieldName: file.fieldname,
        },
        status,
      },
      message: {
        userId: userId.toString(),
        bucket: MINIO_BUCKET,
        objectName,
        mimeType: file.mimetype,
        originalName: file.originalname,
        size: file.size,
      },
    }
  } finally {
    if (file.path) {
      fs.promises.unlink(file.path).catch(() => {})
    }
  }
}

export {
  buildObjectName,
  captureVideoThumbnail,
  downloadObjectToFile,
  ffprobeAsync,
  generateImageDerivatives,
  generateVideoDerivatives,
  isImage,
  isVideo,
  removeObjectIfExists,
  transcodeVideo,
  uploadBufferToMinio,
  uploadFileToMinio,
  uploadFileToStorage,
}
