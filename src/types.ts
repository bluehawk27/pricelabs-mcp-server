export interface Listing {
  id: string;
  pms: string;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  city_name: string;
  state: string;
  no_of_bedrooms: number;
  channel_listing_details: Record<string, unknown>;
  min: { value: number } | number;
  base: number;
  max: { value: number } | number;
  group: string;
  subgroup: string;
  tags: string[];
  notes: string;
  isHidden: boolean;
  push_enabled: boolean;
  occupancy_next_7: number;
  occupancy_next_30: number;
  occupancy_next_60: number;
  occupancy_next_90: number;
  market_occupancy_next_7: number;
  market_occupancy_next_30: number;
  market_occupancy_next_60: number;
  market_occupancy_next_90: number;
  revenue_past_7: number;
  stly_revenue_past_7: number;
  recommended_base_price: number;
  last_date_pushed: string;
  last_refreshed_at: string;
}

export interface ListingUpdate {
  id: string;
  pms: string;
  min?: number;
  base?: number;
  max?: number;
  tags?: string[];
}

export interface Override {
  date: string;
  price?: string | number;
  price_type?: "fixed" | "percent";
  currency?: string;
  min_stay?: number;
  min_price?: number;
  min_price_type?: "fixed" | "percent_base" | "percent_min";
  max_price?: number;
  max_price_type?: "fixed" | "percent_base" | "percent_max";
  base_price?: number;
  check_in_check_out_enabled?: "0" | "1";
  check_in?: string;
  check_out?: string;
  reason?: string;
}

export interface PriceData {
  date: string;
  price: number;
  user_price: number;
  uncustomized_price: number;
  min_stay: number;
  booking_status: string;
  ADR: string | number;
  unbookable: "0" | "1";
  weekly_discount: number;
  monthly_discount: number;
  extra_person_fee: number;
  extra_person_fee_trigger: number;
  check_in: boolean;
  check_out: boolean;
  demand_color: string;
  demand_desc: string;
  reason?: Record<string, unknown>;
}

export interface ListingPriceResponse {
  id: string;
  pms: string;
  group: string;
  currency: string;
  last_refreshed_at: string;
  los_pricing: Record<string, { los_adjustment: string }>;
  data: PriceData[];
  status?: string;
}

export interface Reservation {
  listing_id: string;
  listing_name: string;
  reservation_id: string;
  check_in: string;
  check_out: string;
  booking_status: "booked" | "cancelled";
  booked_date: string;
  rental_revenue: string;
  total_cost: string;
  no_of_days: number;
  currency: string;
  cancelled_on: string;
  cleaning_fees: number;
  booking_channel: string;
  channelConfirmationCode: string;
}

export interface ReservationResponse {
  pms_name: string;
  next_page: boolean;
  data: Reservation[];
}

export interface NeighborhoodData {
  currency: string;
  lat: number;
  lng: number;
  source: string;
  "Neighborhood Data Source": string;
  "Listings Used": number;
  future_percentile_prices: Record<string, unknown>;
  summary_table_base_price: Record<string, unknown>;
  future_occ_new_canc: Record<string, unknown>;
  market_kpi: Record<string, unknown>;
}

export interface RatePlan {
  id: string;
  pms: string;
  name: string;
  rateplans: Record<string, {
    name: string;
    type: string;
    default: string;
    plan_type: string;
    adjustment: number;
    update_type: string;
  }>;
}
