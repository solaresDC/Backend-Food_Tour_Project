import 'dotenv/config';
import Fastify from 'fastify';
import supabasePlugin from './plugins/supabase';
import corsPlugin from './plugins/cors';
import helmetPlugin from './plugins/helmet';
import competitionRoutes from './routes/competitions';
import restaurantRoutes from './routes/restaurants';
import visitRoutes from './routes/visits';
import reviewRoutes from './routes/reviews';
import leaderboardRoutes from './routes/leaderboard';
import loyaltyRoutes from './routes/loyalty';

const buildServer = async () => {
  const fastify = Fastify({
    logger:
      process.env.NODE_ENV === 'production'
        ? true
        : {
            transport: {
              target: 'pino-pretty',
              options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
              },
            },
          },
  });

  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  await fastify.register(supabasePlugin);
  await fastify.register(helmetPlugin);
  await fastify.register(corsPlugin);

  await fastify.register(competitionRoutes);
  await fastify.register(restaurantRoutes);
  await fastify.register(visitRoutes);
  await fastify.register(reviewRoutes);
  await fastify.register(leaderboardRoutes);
  await fastify.register(loyaltyRoutes);

  return fastify;
};

const start = async () => {
  try {
    const fastify = await buildServer();

    const port = parseInt(process.env.PORT || '3001', 10);
    const host = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port, host });

    fastify.log.info(`Server running at http://${host}:${port}`);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();
