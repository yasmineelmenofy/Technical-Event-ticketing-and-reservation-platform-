import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getReservationById } from "../services/reservationService";
import { getPaymentByReservation } from "../services/paymentService";
import { getTicketsByReservation } from "../services/ticketService";
import { getEventById } from "../services/eventService";

import type { Reservation } from "../types/reservation";
import type { Payment } from "../types/payment";
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

function BookingSuccessPage() {
  const { id } = useParams();

  const reservationId = Number(id);

  const [reservation, setReservation] = useState<Reservation | null>(null);

  const [payment, setPayment] = useState<Payment | null>(null);

  const [tickets, setTickets] = useState<Ticket[]>([]);

  const [event, setEvent] = useState<Event | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBookingResult() {
      if (!Number.isInteger(reservationId) || reservationId <= 0) {
        setError("Invalid reservation id");
        setLoading(false);
        return;
      }

      try {
        const reservationData = await getReservationById(reservationId);

        const [paymentData, ticketsData, eventData] = await Promise.all([
          getPaymentByReservation(reservationId),
          getTicketsByReservation(reservationId),
          getEventById(reservationData.event_id),
        ]);

        setReservation(reservationData);
        setPayment(paymentData);
        setTickets(ticketsData);
        setEvent(eventData);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load booking result",
        );
      } finally {
        setLoading(false);
      }
    }

    loadBookingResult();
  }, [reservationId]);

  if (loading) {
    return (
      <section className="page">
        <div className="state-message">Loading booking result...</div>
      </section>
    );
  }

  if (error || !reservation || !payment || !event) {
    return (
      <section className="page">
        <div className="state-message error-message">
          {error || "Booking result not found"}
        </div>
      </section>
    );
  }

  return (
    <section className="page">
      <div className="success-header">
        <div className="success-icon">✓</div>

        <p className="eyebrow">Booking Complete</p>

        <h2>Payment successful</h2>

        <p>
          Your reservation has been confirmed and your ticket has been created.
        </p>
      </div>

      <div className="success-layout">
        <section className="booking-section">
          <h3>{event.title}</h3>

          <div className="summary-row">
            <span>Reservation</span>

            <strong>#{reservation.id}</strong>
          </div>

          <div className="summary-row">
            <span>Status</span>

            <strong>{formatLabel(reservation.status)}</strong>
          </div>

          <div className="summary-row">
            <span>Transaction</span>

            <strong>{payment.transaction_id}</strong>
          </div>

          <div className="summary-total">
            <span>Total paid</span>

            <strong>{formatMoney(Number(payment.amount))}</strong>
          </div>
        </section>

        <section className="booking-section">
          <h3>Your Tickets</h3>

          <div className="ticket-list">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="ticket-item">
                <div>
                  <span className="event-category">
                    {formatLabel(ticket.type)}
                  </span>

                  <h4>Ticket #{ticket.id}</h4>
                </div>

                <div>
                  <span>Seat</span>

                  <strong>{ticket.seat_id}</strong>
                </div>

                <div>
                  <span>Price</span>

                  <strong>{formatMoney(Number(ticket.price))}</strong>
                </div>
              </div>
            ))}
          </div>

          {tickets.length === 0 && (
            <div className="state-message">No tickets found.</div>
          )}
        </section>
      </div>

      <div className="success-actions">
        <Link to="/events" className="secondary-button">
          Browse More Events
        </Link>

        <Link to="/tickets" className="primary-button success-link">
          View My Tickets
        </Link>
      </div>
    </section>
  );
}

export default BookingSuccessPage;
