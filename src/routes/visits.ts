import { FastifyInstance } from 'fastify';
import { SupabaseVisitStore } from '../providers/supabase/SupabaseVisitStore';
import { SupabaseRestaurantStore } from '../providers/supabase/SupabaseRestaurantStore';
import { SupabaseCompetitionStore } from '../providers/supabase/SupabaseCompetitionStore';
import { createVisitSchema, formatZodError } from '../utils/validation';

export default async function visitRoutes(fastify: FastifyInstance) {
  const visitStore = new SupabaseVisitStore(fastify.supabase);
  const restaurantStore = new SupabaseRestaurantStore(fastify.supabase);
  const competitionStore = new SupabaseCompetitionStore(fastify.supabase);

  fastify.post('/api/visits', async (request, reply) => {
    try {
      const parseResult = createVisitSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send(formatZodError(parseResult.error));
      }

      const input = parseResult.data;

      const competition = await competitionStore.getById(input.competition_id);
      if (!competition) {
        return reply.status(404).send({
          error: 'Competition not found',
          message: 'The specified competition does not exist.',
        });
      }

      if (competition.status !== 'active') {
        return reply.status(400).send({
          error: 'Competition not active',
          message: `This competition is currently "${competition.status}". Check-ins are only allowed during an active competition.`,
        });
      }

      const now = new Date();
      const startDate = new Date(competition.start_date);
      const endDate = new Date(competition.end_date);

      if (now < startDate) {
        return reply.status(400).send({
          error: 'Competition not started',
          message: `This competition starts on ${startDate.toLocaleDateString()}. Check back then!`,
        });
      }

      if (now > endDate) {
        return reply.status(400).send({
          error: 'Competition ended',
          message: `This competition ended on ${endDate.toLocaleDateString()}. Stay tuned for the next edition!`,
        });
      }

      const restaurant = await restaurantStore.getById(input.restaurant_id);
      if (!restaurant) {
        return reply.status(404).send({
          error: 'Restaurant not found',
          message: 'This restaurant is not in our system. The QR code may be invalid.',
        });
      }

      if (!restaurant.is_active) {
        return reply.status(400).send({
          error: 'Restaurant inactive',
          message: 'This restaurant is no longer participating in the competition.',
        });
      }

      if (restaurant.competition_id !== input.competition_id) {
        return reply.status(400).send({
          error: 'Restaurant not in competition',
          message: 'This restaurant is not part of the specified competition.',
        });
      }

      const alreadyVisited = await visitStore.existsForUserAndRestaurant(
        input.user_id,
        input.restaurant_id,
        input.competition_id
      );

      if (alreadyVisited) {
        return reply.status(409).send({
          error: 'Already visited',
          message: 'You have already checked in at this restaurant for this competition. Each restaurant can only be visited once.',
        });
      }

      const visit = await visitStore.create(input);

      fastify.log.info(
        { visitId: visit.id, userId: input.user_id, restaurantId: input.restaurant_id },
        'Visit recorded successfully'
      );

      return reply.status(201).send(visit);
    } catch (err: any) {
      if (err.message?.startsWith('DUPLICATE_VISIT')) {
        return reply.status(409).send({
          error: 'Already visited',
          message: err.message.replace('DUPLICATE_VISIT: ', ''),
        });
      }

      fastify.log.error(err, 'Failed to record visit');
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Something went wrong recording your visit. Please try again.',
      });
    }
  });
}
