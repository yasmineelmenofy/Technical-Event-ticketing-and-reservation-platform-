export type SeatType = "regular" | "vip" | "student" | "early_bird";

export type Seat = {
  id: number;
  row: string;
  section: string;
  seat_number: number;
  venue_id: number;
  type: SeatType;
};
