import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getMyTickets } from "../services/ticketService";
import { getEventById } from "../services/eventService";

import type { Ticket } from "../types/ticket";
import type { Event } from "../types/event";

function formatLabel(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatMoney(price: number) {
  return `${price.toFixed(2)} EGP`;
}

function MyTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const [events, setEvents] = useState<Record<number, Event>>({});

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTickets() {
      try {
        setLoading(true);
        setError("");

        const ticketData = await getMyTickets();

        setTickets(ticketData);

        const eventIds = [
          ...new Set(ticketData.map((ticket) => ticket.event_id)),
        ];

        const eventResults = await Promise.all(
          eventIds.map((eventId) => getEventById(eventId)),
        );

        const eventMap: Record<number, Event> = {};

        for (const event of eventResults) {
          eventMap[event.id] = event;
        }

        setEvents(eventMap);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to load tickets",
        );
      } finally {
        setLoading(false);
      }
    }

    loadTickets();
  }, []);

  if (loading) {
    return (
      <section className="page">
        <div className="state-message">Loading tickets...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page">
        <div className="state-message error-message">{error}</div>
      </section>
    );
  }

  return (
    <section className="page">
      <div className="page-header">
        <p className="eyebrow">Account</p>

        <h2>My Tickets</h2>

        <p className="page-description">Your purchased event tickets.</p>
      </div>

      {tickets.length === 0 ? (
        <div className="state-message">
          You don't have any tickets yet.
          <br />
          <Link to="/events" className="inline-link">
            Browse events
          </Link>
        </div>
      ) : (
        <div className="ticket-list">
          {tickets.map((ticket) => {
            const event = events[ticket.event_id];

            return (
              <article key={ticket.id} className="ticket-list-card">
                <div>
                  <span className="event-category">
                    {formatLabel(ticket.type)}
                  </span>

                  <h3>{event?.title || `Event #${ticket.event_id}`}</h3>

                  <p className="card-muted">Ticket #{ticket.id}</p>
                </div>

                <div className="ticket-info">
                  <span>Seat</span>
                  <strong>{ticket.seat_id}</strong>
                </div>

                <div className="ticket-info">
                  <span>Price</span>
                  <strong>{formatMoney(Number(ticket.price))}</strong>
                </div>

                <Link to={`/tickets/${ticket.id}`} className="secondary-button">
                  View Ticket
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default MyTicketsPage;
