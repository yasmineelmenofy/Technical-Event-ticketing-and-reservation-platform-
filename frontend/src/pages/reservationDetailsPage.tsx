import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getReservationById } from "../services/reservationService";

import { getSeatHoldsByReservation } from "../services/seatHoldService";

import { getEventById } from "../services/eventService";

import type { Reservation } from "../types/reservation";
import type { SeatHold } from "../services/seatHoldService";
import type { Event } from "../types/event";

function formatLabel(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function ReservationDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const reservationId = Number(id);

  const [reservation, setReservation] = useState<Reservation | null>(null);

  const [holds, setHolds] = useState<SeatHold[]>([]);

  const [event, setEvent] = useState<Event | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadReservation() {
      if (!Number.isInteger(reservationId) || reservationId <= 0) {
        setError("Invalid reservation id");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const reservationData = await getReservationById(reservationId);

        const [holdsData, eventData] = await Promise.all([
          getSeatHoldsByReservation(reservationId),
          getEventById(reservationData.event_id),
        ]);

        setReservation(reservationData);

        setHolds(holdsData);
        setEvent(eventData);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to load reservation",
        );
      } finally {
        setLoading(false);
      }
    }

    loadReservation();
  }, [reservationId]);

  if (loading) {
    return (
      <section className="page">
        <div className="state-message">Loading reservation...</div>
      </section>
    );
  }

  if (error || !reservation || !event) {
    return (
      <section className="page">
        <div className="state-message error-message">
          {error || "Reservation not found"}
        </div>

        <Link to="/reservations" className="back-link">
          ← My reservations
        </Link>
      </section>
    );
  }

  return (
    <section className="page">
      <Link to="/reservations" className="back-link">
        ← My reservations
      </Link>

      <div className="page-header">
        <p className="eyebrow">Reservation #{reservation.id}</p>

        <h2>{event.title}</h2>

        <p className="page-description">
          {event.date} · {event.start_time} - {event.end_time}
        </p>
      </div>

      <div className="reservation-layout">
        <div className="reservation-main">
          <section className="booking-section">
            <div className="section-title">
              <h3>Status</h3>

              <span className={`status-badge status-${reservation.status}`}>
                {formatLabel(reservation.status)}
              </span>
            </div>

            {reservation.status === "pending" && (
              <p>Your reservation is waiting for payment.</p>
            )}

            {reservation.status === "confirmed" && (
              <p>
                Your reservation is confirmed. Your tickets have been created.
              </p>
            )}

            {reservation.status === "cancelled" && (
              <p>This reservation has been cancelled.</p>
            )}
          </section>

          <section className="booking-section">
            <h3>Seat Holds</h3>

            {holds.length > 0 ? (
              <div className="reservation-seat-list">
                {holds.map((hold) => (
                  <div key={hold.id} className="reservation-seat-item">
                    <div>
                      <strong>Seat #{hold.seat_id}</strong>

                      <span>Ticket type: {formatLabel(hold.type)}</span>
                    </div>

                    <div>
                      <span>Expires</span>

                      <strong>
                        {new Date(hold.expires_at).toLocaleString()}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="state-message">No active seat holds.</div>
            )}
          </section>
        </div>

        <aside className="booking-summary">
          <p className="eyebrow">Next step</p>

          {reservation.status === "pending" && (
            <>
              <h3>Complete payment</h3>

              <p className="summary-note">
                Your seat is temporarily held. Complete payment before the hold
                expires.
              </p>

              <button
                type="button"
                className="primary-button"
                disabled={holds.length === 0}
                onClick={() =>
                  navigate(`/reservations/${reservation.id}/payment`)
                }
              >
                Proceed to Payment
              </button>
            </>
          )}

          {reservation.status === "confirmed" && (
            <>
              <h3>Booking confirmed</h3>

              <p className="summary-note">Your ticket has been created.</p>

              <button
                type="button"
                className="primary-button"
                onClick={() =>
                  navigate(`/reservations/${reservation.id}/success`)
                }
              >
                View Booking
              </button>
            </>
          )}

          {reservation.status === "cancelled" && (
            <p className="summary-note">This reservation is cancelled.</p>
          )}
        </aside>
      </div>
    </section>
  );
}

export default ReservationDetailsPage;
