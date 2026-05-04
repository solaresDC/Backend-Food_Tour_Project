import { SupabaseClient } from '@supabase/supabase-js';
import { Visit, CreateVisitInput, VisitStore } from '../../interfaces/VisitStore';

export class SupabaseVisitStore implements VisitStore {
  constructor(private supabase: SupabaseClient) {}

  async create(input: CreateVisitInput): Promise<Visit> {
    const alreadyVisited = await this.existsForUserAndRestaurant(
      input.user_id,
      input.restaurant_id,
      input.competition_id
    );

    if (alreadyVisited) {
      throw new Error(
        'DUPLICATE_VISIT: You have already checked in at this restaurant for this competition. ' +
        'Each restaurant can only be visited once per competition.'
      );
    }

    const { data, error } = await this.supabase
      .from('visits')
      .insert({
        user_id: input.user_id,
        restaurant_id: input.restaurant_id,
        competition_id: input.competition_id,
        scan_timestamp: new Date().toISOString(),
        geo_lat: input.geo_lat,
        geo_lng: input.geo_lng,
        validation_status: 'valid',
        referral_code_used: input.referral_code_used || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error(
          'DUPLICATE_VISIT: You have already checked in at this restaurant for this competition.'
        );
      }
      throw new Error(`Failed to record visit: ${error.message}`);
    }

    return data;
  }

  async existsForUserAndRestaurant(
    userId: string,
    restaurantId: string,
    competitionId: string
  ): Promise<boolean> {
    const { count, error } = await this.supabase
      .from('visits')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('restaurant_id', restaurantId)
      .eq('competition_id', competitionId);

    if (error) {
      throw new Error(`Failed to check for existing visit: ${error.message}`);
    }

    return (count ?? 0) > 0;
  }

  async getByUserId(userId: string, competitionId: string): Promise<Visit[]> {
    const { data, error } = await this.supabase
      .from('visits')
      .select('*')
      .eq('user_id', userId)
      .eq('competition_id', competitionId)
      .order('scan_timestamp', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch visits for user ${userId}: ${error.message}`);
    }

    return data || [];
  }

  async countByRestaurant(restaurantId: string, competitionId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('visits')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurantId)
      .eq('competition_id', competitionId);

    if (error) {
      throw new Error(`Failed to count visits for restaurant ${restaurantId}: ${error.message}`);
    }

    return count ?? 0;
  }
}
