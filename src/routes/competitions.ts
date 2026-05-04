import { FastifyInstance } from 'fastify';
import { SupabaseCompetitionStore } from '../providers/supabase/SupabaseCompetitionStore';

export default async function competitionRoutes(fastify: FastifyInstance) {
  const store = new SupabaseCompetitionStore(fastify.supabase);

  fastify.get('/api/competitions/active', async (request, reply) => {
    try {
      const competition = await store.getActiveCompetition();

      if (!competition) {
        return reply.status(404).send({
          error: 'No active competition found',
          message: 'There is no competition running right now. Check back soon!',
        });
      }

      return reply.send(competition);
    } catch (err: any) {
      fastify.log.error(err, 'Failed to fetch active competition');
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Something went wrong fetching the competition. Please try again.',
      });
    }
  });
}
