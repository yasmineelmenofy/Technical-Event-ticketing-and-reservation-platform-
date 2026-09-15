import { apiFetch } from "../api/api";
import type { TicketType } from "../types/ticket";

export type SeatHold = {
  id: number;
  seat_id: number;
  event_id: number;
  reservation_id: number;
  type: TicketType;
  expires_at: string;
};

type SeatHoldResponse = {
  message: string;
  data: SeatHold;
};

type SeatHoldsResponse = {
  message: string;
  data: SeatHold[];
};

export async function createSeatHold(
  seatId: number,
  eventId: number,
  reservationId: number,
  type: TicketType,
) {
  const response = await apiFetch("/api/seat-holds", {
    method: "POST",
    body: JSON.stringify({
      seat_id: seatId,
      event_id: eventId,
      reservation_id: reservationId,
      type,
    }),
  });

  return (response as SeatHoldResponse).data;
}

export async function getSeatHoldsByReservation(reservationId: number) {
  const response = await apiFetch(
    `/api/seat-holds/reservation/${reservationId}`,
  );

  return (response as SeatHoldsResponse).data;
}
