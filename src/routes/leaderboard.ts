import { FastifyInstance } from 'fastify';
import { SupabaseLeaderboardStore } from '../providers/supabase/SupabaseLeaderboardStore';
import { SupabaseCompetitionStore } from '../providers/supabase/SupabaseCompetitionStore';

export default async function leaderboardRoutes(fastify: FastifyInstance) {
  const leaderboardStore = new SupabaseLeaderboardStore(fastify.supabase);
  const competitionStore = new SupabaseCompetitionStore(fastify.supabase);

  fastify.get('/api/leaderboard', async (request, reply) => {
    try {
      const competition = await competitionStore.getActiveCompetition();

      if (!competition) {
        return reply.status(404).send({
          error: 'No active competition',
          message: 'There is no competition running right now.',
        });
      }

      const rankings = await leaderboardStore.getRankings(competition.id);
      return reply.send({
        competition_id: competition.id,
        competition_name: competition.name,
        rankings,
      });
    } catch (err: any) {
      fastify.log.error(err, 'Failed to fetch leaderboard');
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Something went wrong fetching the leaderboard. Please try again.',
      });
    }
  });
}
