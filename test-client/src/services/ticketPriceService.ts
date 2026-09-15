import { apiFetch } from "../api/api";
import type {
  TicketPrice,
  TicketType,
} from "../types/ticket";

type TicketPricesResponse = {
  message: string;
  data: TicketPrice[];
};

type TicketPriceResponse = {
  message: string;
  data: TicketPrice;
};

export async function getTicketPricesByEvent(
  eventId: number,
) {
  const response = await apiFetch(
    `/api/events/${eventId}/ticket-prices`,
  );

  return (response as TicketPricesResponse).data;
}

export async function createTicketPrice(
  eventId: number,
  type: TicketType,
  price: number,
) {
  const response = await apiFetch(
    `/api/events/${eventId}/ticket-prices`,
    {
      method: "POST",
      body: JSON.stringify({
        type,
        price,
      }),
    },
  );

  return (response as TicketPriceResponse).data;
}

export async function updateTicketPrice(
  eventId: number,
  type: TicketType,
  price: number,
) {
  const response = await apiFetch(
    `/api/events/${eventId}/ticket-prices/${type}`,
    {
      method: "PUT",
      body: JSON.stringify({ price }),
    },
  );

  return (response as TicketPriceResponse).data;
}

export async function deleteTicketPrice(
  eventId: number,
  type: TicketType,
) {
  const response = await apiFetch(
    `/api/events/${eventId}/ticket-prices/${type}`,
    {
      method: "DELETE",
    },
  );

  return (response as TicketPriceResponse).data;
}