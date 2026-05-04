import { SupabaseClient } from '@supabase/supabase-js';
import { Review, CreateReviewInput, ReviewStore } from '../../interfaces/ReviewStore';

export class SupabaseReviewStore implements ReviewStore {
  constructor(private supabase: SupabaseClient) {}

  async create(input: CreateReviewInput): Promise<Review> {
    const overall_rating = parseFloat(
      (
        (input.taste_rating + input.value_rating + input.vibe_rating + input.wow_rating) /
        4
      ).toFixed(2)
    );

    const alreadyReviewed = await this.existsForVisit(input.visit_id);
    if (alreadyReviewed) {
      throw new Error(
        'DUPLICATE_REVIEW: A review already exists for this visit. ' +
        'You can only submit one review per restaurant visit.'
      );
    }

    const { data, error } = await this.supabase
      .from('reviews')
      .insert({
        visit_id: input.visit_id,
        user_id: input.user_id,
        restaurant_id: input.restaurant_id,
        taste_rating: input.taste_rating,
        value_rating: input.value_rating,
        vibe_rating: input.vibe_rating,
        wow_rating: input.wow_rating,
        overall_rating,
        comment: input.comment || null,
        would_return: input.would_return,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error(
          'DUPLICATE_REVIEW: A review already exists for this visit.'
        );
      }
      throw new Error(`Failed to submit review: ${error.message}`);
    }

    return data;
  }

  async getByRestaurant(restaurantId: string, competitionId: string): Promise<Review[]> {
    const { data, error } = await this.supabase
      .from('reviews')
      .select('*, visits!inner(competition_id)')
      .eq('restaurant_id', restaurantId)
      .eq('visits.competition_id', competitionId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch reviews for restaurant ${restaurantId}: ${error.message}`);
    }

    return (data || []).map((review: any) => {
      const { visits, ...rest } = review;
      return rest;
    });
  }

  async existsForVisit(visitId: string): Promise<boolean> {
    const { count, error } = await this.supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('visit_id', visitId);

    if (error) {
      throw new Error(`Failed to check for existing review: ${error.message}`);
    }

    return (count ?? 0) > 0;
  }
}
