export interface Restaurant {
  id: string;
  competition_id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  description: string;
  photos: string[];
  tags: string[];
  is_active: boolean;
  require_gps: boolean;
  created_at: string;
}

export interface RestaurantStore {
  getAll(competitionId: string): Promise<Restaurant[]>;
  getById(id: string): Promise<Restaurant | null>;
}
