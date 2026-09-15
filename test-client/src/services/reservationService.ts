import { apiFetch } from "../api/api";
import type { Reservation } from "../types/reservation";

type ReservationResponse = {
  message: string;
  data: Reservation;
};

type ReservationsResponse = {
  message: string;
  data: Reservation[];
};

export async function createReservation(eventId: number) {
  const response = await apiFetch("/api/reservations", {
    method: "POST",
    body: JSON.stringify({
      event_id: eventId,
    }),
  });

  return (response as ReservationResponse).data;
}

export async function getReservationById(reservationId: number) {
  const response = await apiFetch(`/api/reservations/${reservationId}`);

  return (response as ReservationResponse).data;
}

export async function getMyReservations() {
  const response = await apiFetch(
    "/api/reservations?sort=created_at&order=desc&limit=100",
  );

  return (response as ReservationsResponse).data;
}
