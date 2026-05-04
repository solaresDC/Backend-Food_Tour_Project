export interface Visit {
  id: string;
  user_id: string;
  restaurant_id: string;
  competition_id: string;
  scan_timestamp: string;
  geo_lat: number;
  geo_lng: number;
  validation_status: 'valid' | 'suspect' | 'rejected';
  referral_code_used: string | null;
}

export interface CreateVisitInput {
  user_id: string;
  restaurant_id: string;
  competition_id: string;
  geo_lat: number;
  geo_lng: number;
  referral_code_used?: string | null;
}

export interface VisitStore {
  create(input: CreateVisitInput): Promise<Visit>;
  existsForUserAndRestaurant(
    userId: string,
    restaurantId: string,
    competitionId: string
  ): Promise<boolean>;
  getByUserId(userId: string, competitionId: string): Promise<Visit[]>;
  countByRestaurant(restaurantId: string, competitionId: string): Promise<number>;
}
