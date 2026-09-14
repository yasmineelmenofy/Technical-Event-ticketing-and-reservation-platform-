export type TicketType = "regular" | "vip" | "student" | "early_bird";

export type TicketPrice = {
  id: number;
  event_id: number;
  type: TicketType;
  price: number;
};

export type Ticket = {
  id: number;
  type: TicketType;
  price: string | number;
  seat_id: number;
  reservation_id: number;
  event_id: number;
};
