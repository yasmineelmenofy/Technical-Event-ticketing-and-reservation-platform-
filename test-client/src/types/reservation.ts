export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "cancelled";

export type Reservation = {
  id: number;
  user_id: number;
  event_id: number;
  created_at: string;
  status: ReservationStatus;
};