export type Concert = {
  id: string;
  user_id: string;
  concert_name: string;
  artist: string;
  venue: string;
  city: string;
  state: string;
  concert_date: string;
  distance_from_home: number;
  hours_at_event: number;
  ticket_cost: number;
  ticket_fees: number;
  parking_cost: number;
  food_drink_cost: number;
  merchandise_cost: number;
  lodging_cost: number;
  travel_cost: number;
  other_cost: number;
  fun_rating: number;
  notes: string | null;
  created_at: string;
};

export type ConcertFormData = Omit<
  Concert,
  "id" | "user_id" | "created_at"
>;

export type DealAlert = {
  id: string;
  user_id: string;
  concert_name: string;
  artist: string;
  venue: string | null;
  event_date: string | null;
  platform: string;
  target_price: number;
  face_value: number;
  notify_price_drop: boolean;
  notify_resale_below_face: boolean;
  notify_nearby_seats: boolean;
  notify_last_minute: boolean;
  is_active: boolean;
  created_at: string;
};

export type PriceSnapshot = {
  id: string;
  user_id: string;
  alert_id: string | null;
  platform: string;
  price: number;
  is_resale: boolean;
  seat_section: string | null;
  listing_url: string | null;
  seller_rating: number | null;
  recorded_at: string;
};

export type DealNotification = {
  id: string;
  user_id: string;
  alert_id: string | null;
  notification_type:
    | "price_drop"
    | "resale_deal"
    | "nearby_seats"
    | "last_minute"
    | "scam_warning"
    | "best_time_to_buy";
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export type ConcertMemory = {
  id: string;
  user_id: string;
  concert_id: string;
  photo_urls: string[];
  video_urls: string[];
  setlist: string | null;
  favorite_songs: string[];
  friends_attended: string[];
  merch_bought: string | null;
  memory_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ConcertWithMemory = Concert & {
  memory: ConcertMemory | null;
};
