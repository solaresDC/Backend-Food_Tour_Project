import { FastifyInstance } from 'fastify';
import { SupabaseReviewStore } from '../providers/supabase/SupabaseReviewStore';
import { SupabaseVisitStore } from '../providers/supabase/SupabaseVisitStore';
import { createReviewSchema, formatZodError, uuidSchema } from '../utils/validation';

export default async function reviewRoutes(fastify: FastifyInstance) {
  const reviewStore = new SupabaseReviewStore(fastify.supabase);
  const visitStore = new SupabaseVisitStore(fastify.supabase);

  fastify.post('/api/reviews', async (request, reply) => {
    try {
      const parseResult = createReviewSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send(formatZodError(parseResult.error));
      }

      const input = parseResult.data;

      const visits = await visitStore.getByUserId(input.user_id, '');

      const { data: visit, error: visitError } = await fastify.supabase
        .from('visits')
        .select('*')
        .eq('id', input.visit_id)
        .eq('user_id', input.user_id)
        .maybeSingle();

      if (visitError) {
        fastify.log.error(visitError, 'Failed to verify visit for review');
        return reply.status(500).send({
          error: 'Internal server error',
          message: 'Could not verify your visit. Please try again.',
        });
      }

      if (!visit) {
        return reply.status(404).send({
          error: 'Visit not found',
          message: 'No matching visit found. You must visit a restaurant before reviewing it.',
        });
      }

      if (visit.restaurant_id !== input.restaurant_id) {
        return reply.status(400).send({
          error: 'Restaurant mismatch',
          message: 'The restaurant ID does not match the visit record.',
        });
      }

      const alreadyReviewed = await reviewStore.existsForVisit(input.visit_id);
      if (alreadyReviewed) {
        return reply.status(409).send({
          error: 'Already reviewed',
          message: 'You have already submitted a review for this visit.',
        });
      }

      const review = await reviewStore.create(input);

      fastify.log.info(
        { reviewId: review.id, userId: input.user_id, restaurantId: input.restaurant_id },
        'Review submitted successfully'
      );

      return reply.status(201).send(review);
    } catch (err: any) {
      if (err.message?.startsWith('DUPLICATE_REVIEW')) {
        return reply.status(409).send({
          error: 'Already reviewed',
          message: err.message.replace('DUPLICATE_REVIEW: ', ''),
        });
      }

      fastify.log.error(err, 'Failed to submit review');
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Something went wrong submitting your review. Please try again.',
      });
    }
  });

  fastify.get('/api/reviews/:restaurantId', async (request, reply) => {
    try {
      const { restaurantId } = request.params as { restaurantId: string };

      const parseResult = uuidSchema.safeParse(restaurantId);
      if (!parseResult.success) {
        return reply.status(400).send({
          error: 'Invalid restaurant ID',
          message: 'The restaurant ID must be a valid UUID format.',
        });
      }

      const { data: competition } = await fastify.supabase
        .from('competitions')
        .select('id')
        .eq('status', 'active')
        .limit(1)
        .maybeSingle();

      if (!competition) {
        return reply.status(404).send({
          error: 'No active competition',
          message: 'There is no competition running right now.',
        });
      }

      const reviews = await reviewStore.getByRestaurant(restaurantId, competition.id);
      return reply.send(reviews);
    } catch (err: any) {
      fastify.log.error(err, 'Failed to fetch reviews');
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Something went wrong fetching reviews. Please try again.',
      });
    }
  });
}
