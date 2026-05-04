import fp from 'fastify-plugin';
import cors from '@fastify/cors';
import { FastifyInstance } from 'fastify';

async function corsPlugin(fastify: FastifyInstance) {
  const allowedOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

  await fastify.register(cors, {
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const allowedOrigins = allowedOrigin.split(',').map(o => o.trim());

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        fastify.log.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error(`Origin ${origin} not allowed by CORS`), false);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
}

export default fp(corsPlugin, {
  name: 'cors',
});
