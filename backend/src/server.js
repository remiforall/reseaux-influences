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
import organisationsRoutes from './routes/organisations.js'
import exportRoutes from './routes/export.js'
import enrichissementRoutes from './routes/enrichissement.js'
import entitesRoutes from './routes/entites.js'

dotenv.config()

// ---------------------------------------------------------------------------
// M-01 — Vérification JWT_SECRET au démarrage
// En production : refus de démarrer si absent, par défaut, ou trop court.
// En dev/test : génération d'un secret aléatoire en RAM + avertissement.
// ---------------------------------------------------------------------------

const JWT_SECRET_DEFAUT = 'changez-moi-avec-une-vraie-cle-secrete-de-32-caracteres'

if (process.env.NODE_ENV === 'production') {
  if (
    !process.env.JWT_SECRET ||
    process.env.JWT_SECRET === JWT_SECRET_DEFAUT ||
    process.env.JWT_SECRET.length < 32
  ) {
    console.error(
      '[FATAL] JWT_SECRET absent, par défaut, ou trop court (< 32 chars) en prod. Refus de démarrage.',
    )
    process.exit(1)
  }
} else if (!process.env.JWT_SECRET || process.env.JWT_SECRET === JWT_SECRET_DEFAUT) {
  // En dev/test : secret aléatoire en RAM, ne pas bloquer les tests Jest
  const { randomBytes } = await import('node:crypto')
  process.env.JWT_SECRET = randomBytes(32).toString('hex')
  console.warn('[WARN] JWT_SECRET absent ou par défaut — secret aléatoire généré en RAM (dev uniquement).')
}

// ---------------------------------------------------------------------------
// SEC-I-02 — Avertissement si l'email dans ENRICHISSEMENT_USER_AGENT est perso
// ---------------------------------------------------------------------------

const USER_AGENT_PERSO_REGEX = /\b[a-zA-Z0-9._%+-]+@(?:gmail|outlook|yahoo|hotmail|icloud|live)\./i
if (process.env.ENRICHISSEMENT_USER_AGENT && USER_AGENT_PERSO_REGEX.test(process.env.ENRICHISSEMENT_USER_AGENT)) {
  console.warn(
    '[WARN] ENRICHISSEMENT_USER_AGENT contient ce qui ressemble à un email personnel. ' +
    'Utiliser une adresse fonctionnelle générique (ex: contact@reseauxinfluences.fr) — ' +
    "cet email apparaît dans les logs de toutes les APIs publiques tierces (Wikidata, RDAP, IGN).",
  )
}

// M-06 — trustProxy : fiabilise request.ip derrière Phusion Passenger en prod
const fastify = Fastify({
  logger: true,
  trustProxy: process.env.NODE_ENV === 'production',
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

  // Documentation API — M-05 : Swagger UI désactivé en production sauf opt-in explicite
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: "Réseaux d'Influence API",
        description: "API de cartographie des réseaux d'influence avec gamification communautaire",
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

  if (process.env.NODE_ENV !== 'production' || process.env.SWAGGER_PUBLIC === 'true') {
    await fastify.register(swaggerUi, {
      routePrefix: '/docs',
    })
  }

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
  await fastify.register(organisationsRoutes, { prefix: '/api/organisations' })
  await fastify.register(grapheRoutes, { prefix: '/api/graphe' })
  await fastify.register(exportRoutes, { prefix: '/api/export' })
  await fastify.register(enrichissementRoutes, { prefix: '/api/enrichissement' })
  await fastify.register(entitesRoutes, { prefix: '/api/entites' })

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
      return { status: 'ok', name: "Réseaux d'Influence API", version: '1.0.0' }
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
