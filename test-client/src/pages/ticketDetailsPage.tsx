import { useEffect, useState } from "react";
import {
  Link,
  useParams,
} from "react-router-dom";

import { getTicketById } from "../services/ticketService";
import { getEventById } from "../services/eventService";

import type { Ticket } from "../types/ticket";
import type { Event } from "../types/event";

function formatLabel(value: string) {
  return value
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(" ");
}

function formatMoney(price: number) {
  return `${price.toFixed(2)} EGP`;
}

function TicketDetailsPage() {
  const { id } = useParams();

  const ticketId = Number(id);

  const [ticket, setTicket] =
    useState<Ticket | null>(null);

  const [event, setEvent] =
    useState<Event | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadTicket() {
      if (
        !Number.isInteger(ticketId) ||
        ticketId <= 0
      ) {
        setError("Invalid ticket id");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const ticketData =
          await getTicketById(ticketId);

        const eventData =
          await getEventById(
            ticketData.event_id,
          );

        setTicket(ticketData);
        setEvent(eventData);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load ticket",
        );
      } finally {
        setLoading(false);
      }
    }

    loadTicket();
  }, [ticketId]);

  if (loading) {
    return (
      <section className="page">
        <div className="state-message">
          Loading ticket...
        </div>
      </section>
    );
  }

  if (error || !ticket || !event) {
    return (
      <section className="page">
        <div className="state-message error-message">
          {error || "Ticket not found"}
        </div>

        <Link
          to="/tickets"
          className="back-link"
        >
          ← My tickets
        </Link>
      </section>
    );
  }

  return (
    <section className="page">
      <Link
        to="/tickets"
        className="back-link"
      >
        ← My tickets
      </Link>

      <div className="ticket-details-card">
        <div className="ticket-details-header">
          <span className="event-category">
            {formatLabel(ticket.type)}
          </span>

          <span>
            Ticket #{ticket.id}
          </span>
        </div>

        <h2>{event.title}</h2>

        <p className="card-muted">
          {event.date} ·{" "}
          {event.start_time} -{" "}
          {event.end_time}
        </p>

        <div className="ticket-details-grid">
          <div>
            <span>Ticket type</span>
            <strong>
              {formatLabel(ticket.type)}
            </strong>
          </div>

          <div>
            <span>Seat</span>
            <strong>
              {ticket.seat_id}
            </strong>
          </div>

          <div>
            <span>Reservation</span>
            <strong>
              #{ticket.reservation_id}
            </strong>
          </div>

          <div>
            <span>Price</span>
            <strong>
              {formatMoney(
                Number(ticket.price),
              )}
            </strong>
          </div>
        </div>

        <div className="ticket-details-footer">
          <Link
            to={`/reservations/${ticket.reservation_id}`}
            className="secondary-button"
          >
            View Reservation
          </Link>
        </div>
      </div>
    </section>
  );
}

export default TicketDetailsPage;