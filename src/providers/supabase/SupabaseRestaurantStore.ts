import { SupabaseClient } from '@supabase/supabase-js';
import { Restaurant, RestaurantStore } from '../../interfaces/RestaurantStore';

export class SupabaseRestaurantStore implements RestaurantStore {
  constructor(private supabase: SupabaseClient) {}

  async getAll(competitionId: string): Promise<Restaurant[]> {
    const { data, error } = await this.supabase
      .from('restaurants')
      .select('*')
      .eq('competition_id', competitionId)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch restaurants: ${error.message}`);
    }

    return data || [];
  }

  async getById(id: string): Promise<Restaurant | null> {
    const { data, error } = await this.supabase
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch restaurant ${id}: ${error.message}`);
    }

    return data;
  }
}
