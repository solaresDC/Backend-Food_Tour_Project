import { FastifyInstance } from 'fastify';
import { SupabaseRestaurantStore } from '../providers/supabase/SupabaseRestaurantStore';
import { SupabaseCompetitionStore } from '../providers/supabase/SupabaseCompetitionStore';
import { uuidSchema } from '../utils/validation';

export default async function restaurantRoutes(fastify: FastifyInstance) {
  const restaurantStore = new SupabaseRestaurantStore(fastify.supabase);
  const competitionStore = new SupabaseCompetitionStore(fastify.supabase);

  fastify.get('/api/restaurants', async (request, reply) => {
    try {
      const competition = await competitionStore.getActiveCompetition();

      if (!competition) {
        return reply.status(404).send({
          error: 'No active competition',
          message: 'There is no competition running right now.',
        });
      }

      const restaurants = await restaurantStore.getAll(competition.id);
      return reply.send(restaurants);
    } catch (err: any) {
      fastify.log.error(err, 'Failed to fetch restaurants');
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Something went wrong fetching restaurants. Please try again.',
      });
    }
  });

  fastify.get('/api/restaurants/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const parseResult = uuidSchema.safeParse(id);
      if (!parseResult.success) {
        return reply.status(400).send({
          error: 'Invalid restaurant ID',
          message: 'The restaurant ID must be a valid UUID format.',
        });
      }

      const restaurant = await restaurantStore.getById(id);

      if (!restaurant) {
        return reply.status(404).send({
          error: 'Restaurant not found',
          message: `No restaurant found with ID ${id}. It may have been removed from the competition.`,
        });
      }

      return reply.send(restaurant);
    } catch (err: any) {
      fastify.log.error(err, 'Failed to fetch restaurant');
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Something went wrong fetching this restaurant. Please try again.',
      });
    }
  });
}
