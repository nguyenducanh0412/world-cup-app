import fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import jwt from '@fastify/jwt';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const server = fastify({ logger: true });

const PORT = parseInt(process.env.PORT || '3000', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long';

/**
 * Main application setup and server initialization
 */
async function main() {
  // Register CORS
  await server.register(cors, {
    origin: '*',
  });

  // Register sensible for httpErrors
  await server.register(sensible);

  // Register JWT
  await server.register(jwt, {
    secret: JWT_SECRET,
  });

  // Health check endpoint
  server.get('/api/v1/health', async (_request, _reply) => {
    let dbStatus = 'ok';
    
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'error';
    }

    return {
      status: 'ok',
      db: dbStatus,
      time: new Date().toISOString(),
    };
  });

  // Graceful shutdown
  const closeGracefully = async (signal: string) => {
    server.log.info(`Received signal ${signal}, closing gracefully...`);
    await server.close();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGTERM', () => closeGracefully('SIGTERM'));
  process.on('SIGINT', () => closeGracefully('SIGINT'));

  // Start server
  try {
    await server.listen({ port: PORT, host: '0.0.0.0' });
    server.log.info(`Server listening on port ${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

main();
