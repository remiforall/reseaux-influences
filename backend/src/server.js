import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import fastifyStatic from '@fastify/static'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

import { prisma } from './utils/prisma.js'
import authRoutes from './routes/auth.js'
import personnesRoutes from './routes/personnes.js'
import liensRoutes from './routes/liens.js'
import sourcesRoutes from './routes/sources.js'
import validationsRoutes from './routes/validations.js'
import utilisateursRoutes from './routes/utilisateurs.js'
import grapheRoutes from './routes/graphe.js'
import exportRoutes from './routes/export.js'

dotenv.config()

const fastify = Fastify({
  logger: true,
})

async function build() {
  // Sécurité
  await fastify.register(helmet)
  await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  })
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  })

  // Documentation API
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'Réseaux d\'Influence API',
        description: 'API de cartographie des réseaux d\'influence avec gamification communautaire',
        version: '1.0.0',
      },
      servers: [
        { url: `http://localhost:${process.env.PORT || 3000}` },
        { url: 'https://api.reseauxinfluences.fr' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  })
  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
  })

  // Décorateur Prisma
  fastify.decorate('prisma', prisma)

  // Fermeture propre
  fastify.addHook('onClose', async () => {
    await prisma.$disconnect()
  })

  // Routes
  await fastify.register(authRoutes, { prefix: '/api/auth' })
  await fastify.register(personnesRoutes, { prefix: '/api/personnes' })
  await fastify.register(liensRoutes, { prefix: '/api/liens' })
  await fastify.register(sourcesRoutes, { prefix: '/api/sources' })
  await fastify.register(validationsRoutes, { prefix: '/api/validations' })
  await fastify.register(utilisateursRoutes, { prefix: '/api/utilisateurs' })
  await fastify.register(grapheRoutes, { prefix: '/api/graphe' })
  await fastify.register(exportRoutes, { prefix: '/api/export' })

  // Health check
  fastify.get('/api/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  })

  // En production : servir le frontend buildé
  if (process.env.NODE_ENV === 'production') {
    const frontendPath = join(__dirname, '../../frontend/dist')
    await fastify.register(fastifyStatic, {
      root: frontendPath,
      prefix: '/',
    })

    // SPA fallback : toute route non-API renvoie index.html
    fastify.setNotFoundHandler((request, reply) => {
      if (request.url.startsWith('/api')) {
        reply.code(404).send({ error: 'Route not found' })
      } else {
        reply.sendFile('index.html')
      }
    })
  } else {
    // Route racine dev
    fastify.get('/', async () => {
      return { status: 'ok', name: 'Réseaux d\'Influence API', version: '1.0.0' }
    })
  }

  return fastify
}

build()
  .then((app) => {
    const port = parseInt(process.env.PORT || '3000', 10)
    const host = process.env.HOST || '0.0.0.0'
    app.listen({ port, host })
  })
  .catch((err) => {
    fastify.log.error(err)
    process.exit(1)
  })

export { build }
