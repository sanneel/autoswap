export type Profile = {
  id: string;
  display_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at?: string;
};

export type VehiclePhoto = {
  id?: string;
  vehicle_id?: string;
  url: string;
  position: number;
};

export type DesiredVehicle = {
  id?: string;
  vehicle_id?: string;
  desired_make: string | null;
  desired_model: string | null;
  desired_category: string | null;
};

export type Vehicle = {
  id: string;
  owner_id: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  fuel_type: string | null;
  transmission: string | null;
  location: string | null;
  description: string | null;
  listing_type: "swap" | "sell" | "sell_or_swap" | string;
  cash_adjustment: number | null;
  status: "active" | "paused" | "completed" | "deleted" | string;
  created_at?: string;
  updated_at?: string;
  vehicle_photos?: VehiclePhoto[];
  desired_vehicles?: DesiredVehicle[];
  profiles?: Profile | null;
};

export type Offer = {
  id: string;
  target_vehicle_id: string;
  offered_vehicle_id: string;
  from_user_id: string;
  to_user_id: string;
  cash_adjustment: number | null;
  message: string | null;
  status: "pending" | "accepted" | "rejected" | "cancelled" | "expired" | string;
  created_at?: string;
  updated_at?: string;
  target_vehicle?: Vehicle | null;
  offered_vehicle?: Vehicle | null;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
};

export type Conversation = {
  id: string;
  offer_id: string;
  user_a: string;
  user_b: string;
  created_at: string;
  offers?: Offer | null;
  messages?: Message[];
};
