import { apiFetch } from "../api/api";
import type { Seat } from "../types/seat";

type SeatsResponse = {
  message: string;
  data: Seat[];
};

type SeatResponse = {
  message: string;
  data: Seat;
};

export async function getSeatsByVenue(venueId: number) {
  const response = await apiFetch(`/api/seats/venue/${venueId}`);

  return (response as SeatsResponse).data;
}

export async function createSeat(data: {
  row: string;
  section: string;
  seat_number: number;
  venue_id: number;
}) {
  const response = await apiFetch("/api/seats", {
    method: "POST",
    body: JSON.stringify(data),
  });

  return (response as SeatResponse).data;
}

export async function updateSeat(
  seatId: number,
  data: {
    row: string;
    section: string;
    seat_number: number;
  },
) {
  const response = await apiFetch(`/api/seats/${seatId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  return (response as SeatResponse).data;
}

export async function deleteSeat(seatId: number) {
  const response = await apiFetch(`/api/seats/${seatId}`, {
    method: "DELETE",
  });

  return (response as SeatResponse).data;
}
