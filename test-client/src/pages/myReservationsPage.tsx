import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getMyReservations } from "../services/reservationService";
import { getEventById } from "../services/eventService";

import type { Reservation } from "../types/reservation";
import type { Event } from "../types/event";

function formatLabel(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function MyReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const [events, setEvents] = useState<Record<number, Event>>({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadReservations() {
      try {
        setLoading(true);
        setError("");

        const reservationData = await getMyReservations();

        setReservations(reservationData);

        const eventIds = [
          ...new Set(
            reservationData.map((reservation) => reservation.event_id),
          ),
        ];

        const eventResults = await Promise.all(
          eventIds.map(async (eventId) => {
            const event = await getEventById(eventId);

            return event;
          }),
        );

        const eventMap: Record<number, Event> = {};

        for (const event of eventResults) {
          eventMap[event.id] = event;
        }

        setEvents(eventMap);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load reservations",
        );
      } finally {
        setLoading(false);
      }
    }

    loadReservations();
  }, []);

  if (loading) {
    return (
      <section className="page">
        <div className="state-message">Loading reservations...</div>
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

        <h2>My Reservations</h2>

        <p className="page-description">
          View and manage your event reservations.
        </p>
      </div>

      {reservations.length === 0 ? (
        <div className="state-message">
          You don't have any reservations yet.
          <br />
          <Link to="/events" className="inline-link">
            Browse events
          </Link>
        </div>
      ) : (
        <div className="reservation-list">
          {reservations.map((reservation) => {
            const event = events[reservation.event_id];

            return (
              <article key={reservation.id} className="reservation-card">
                <div>
                  <span className="eyebrow">Reservation #{reservation.id}</span>

                  <h3>{event?.title || `Event #${reservation.event_id}`}</h3>

                  {event && (
                    <p className="card-muted">
                      {event.date} · {event.start_time} - {event.end_time}
                    </p>
                  )}

                  <p className="card-muted">
                    Created: {new Date(reservation.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="reservation-card-side">
                  <span className={`status-badge status-${reservation.status}`}>
                    {formatLabel(reservation.status)}
                  </span>

                  <Link
                    to={`/reservations/${reservation.id}`}
                    className="secondary-button"
                  >
                    View Reservation
                  </Link>

                  {reservation.status === "pending" && (
                    <Link
                      to={`/reservations/${reservation.id}/payment`}
                      className="primary-button"
                    >
                      Continue Payment
                    </Link>
                  )}

                  {reservation.status === "confirmed" && (
                    <Link
                      to={`/reservations/${reservation.id}/success`}
                      className="primary-button"
                    >
                      View Booking
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default MyReservationsPage;
