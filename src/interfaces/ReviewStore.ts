export interface Review {
  id: string;
  visit_id: string;
  user_id: string;
  restaurant_id: string;
  taste_rating: number;
  value_rating: number;
  vibe_rating: number;
  wow_rating: number;
  overall_rating: number;
  comment: string | null;
  would_return: boolean;
  created_at: string;
}

export interface CreateReviewInput {
  visit_id: string;
  user_id: string;
  restaurant_id: string;
  taste_rating: number;
  value_rating: number;
  vibe_rating: number;
  wow_rating: number;
  comment?: string | null;
  would_return: boolean;
}

export interface ReviewStore {
  create(input: CreateReviewInput): Promise<Review>;
  getByRestaurant(restaurantId: string, competitionId: string): Promise<Review[]>;
  existsForVisit(visitId: string): Promise<boolean>;
}
