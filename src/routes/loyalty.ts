import { FastifyInstance } from 'fastify';
import { SupabaseLoyaltyStore } from '../providers/supabase/SupabaseLoyaltyStore';
import { SupabaseCompetitionStore } from '../providers/supabase/SupabaseCompetitionStore';
import { uuidSchema } from '../utils/validation';

export default async function loyaltyRoutes(fastify: FastifyInstance) {
  const loyaltyStore = new SupabaseLoyaltyStore(fastify.supabase);
  const competitionStore = new SupabaseCompetitionStore(fastify.supabase);

  fastify.get('/api/users/:id/loyalty', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const parseResult = uuidSchema.safeParse(id);
      if (!parseResult.success) {
        return reply.status(400).send({
          error: 'Invalid user ID',
          message: 'The user ID must be a valid UUID format.',
        });
      }

      const competition = await competitionStore.getActiveCompetition();
      if (!competition) {
        return reply.status(404).send({
          error: 'No active competition',
          message: 'There is no competition running right now.',
        });
      }

      const loyaltyCard = await loyaltyStore.getByUser(id, competition.id);

      if (!loyaltyCard) {
        return reply.send({
          user_id: id,
          competition_id: competition.id,
          stamps_earned: 0,
          total_restaurants: competition.reward_config.total_restaurants,
          tier_reached: 0,
          tiers: competition.reward_config.tiers.map((t: any) => ({
            ...t,
            unlocked: false,
          })),
          visited_restaurant_ids: [],
        });
      }

      return reply.send(loyaltyCard);
    } catch (err: any) {
      fastify.log.error(err, 'Failed to fetch loyalty card');
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Something went wrong fetching your loyalty card. Please try again.',
      });
    }
  });
}
