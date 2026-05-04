import { SupabaseClient } from '@supabase/supabase-js';
import { Competition, CompetitionStore } from '../../interfaces/CompetitionStore';

export class SupabaseCompetitionStore implements CompetitionStore {
  constructor(private supabase: SupabaseClient) {}

  async getActiveCompetition(): Promise<Competition | null> {
    const { data, error } = await this.supabase
      .from('competitions')
      .select('*')
      .eq('status', 'active')
      .order('start_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch active competition: ${error.message}`);
    }

    return data;
  }

  async getById(id: string): Promise<Competition | null> {
    const { data, error } = await this.supabase
      .from('competitions')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch competition ${id}: ${error.message}`);
    }

    return data;
  }
}
