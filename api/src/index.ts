import Fastify from 'fastify'
import cors from '@fastify/cors'
import sensible from '@fastify/sensible'
import jwt from '@fastify/jwt'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'

dotenv.config()

const prisma = new PrismaClient()
const fastify = Fastify({
  logger: true,
})

// Register plugins
fastify.register(cors, {
  origin: '*',
})

fastify.register(sensible)

fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long',
})

// Health check endpoint
fastify.get('/api/v1/health', async (request, reply) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    
    return {
      status: 'ok',
      db: 'ok',
      time: new Date().toISOString(),
    }
  } catch (error) {
    return reply.code(500).send({
      status: 'error',
      db: 'error',
      time: new Date().toISOString(),
    })
  }
})

// Graceful shutdown
const closeGracefully = async (signal: string) => {
  fastify.log.info(`Received ${signal}, closing gracefully`)
  await prisma.$disconnect()
  await fastify.close()
  process.exit(0)
}

process.on('SIGTERM', () => closeGracefully('SIGTERM'))
process.on('SIGINT', () => closeGracefully('SIGINT'))

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3000', 10)
    await fastify.listen({ port, host: '0.0.0.0' })
    fastify.log.info(`Server listening on port ${port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
