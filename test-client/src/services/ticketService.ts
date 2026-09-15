import { apiFetch } from "../api/api";
import type { Ticket } from "../types/ticket";

type TicketsResponse = {
  message: string;
  data: Ticket[];
};

type TicketResponse = {
  message: string;
  data: Ticket;
};

export async function getMyTickets() {
  const response = await apiFetch("/api/tickets/my");

  return (response as TicketsResponse).data;
}

export async function getTicketsByReservation(reservationId: number) {
  const response = await apiFetch(`/api/tickets/reservation/${reservationId}`);

  return (response as TicketsResponse).data;
}

export async function getTicketById(ticketId: number) {
  const response = await apiFetch(`/api/tickets/${ticketId}`);

  return (response as TicketResponse).data;
}
