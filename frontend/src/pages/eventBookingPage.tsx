import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getEventById } from "../services/eventService";
import { getTicketPricesByEvent } from "../services/ticketPriceService";
import { getSeatsByVenue } from "../services/seatService";
import { getAvailableSeatsByEvent } from "../services/seatAvailabilityService";
import { createReservation } from "../services/reservationService";
import { createSeatHold } from "../services/seatHoldService";

import type { Event } from "../types/event";
import type { Seat } from "../types/seat";
import type { TicketPrice, TicketType } from "../types/ticket";

function formatLabel(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatMoney(price: number) {
  return `${price.toFixed(2)} EGP`;
}

function EventBookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const eventId = Number(id);

  const [event, setEvent] = useState<Event | null>(null);

  const [ticketPrices, setTicketPrices] = useState<TicketPrice[]>([]);

  const [seats, setSeats] = useState<Seat[]>([]);
  const [availableSeats, setAvailableSeats] = useState<Seat[]>([]);

  const [selectedType, setSelectedType] = useState<TicketType | null>(null);

  const [selectedSeatId, setSelectedSeatId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadBookingData() {
      if (!Number.isInteger(eventId) || eventId <= 0) {
        setError("Invalid event id");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const eventData = await getEventById(eventId);

        const [prices, venueSeats, available] = await Promise.all([
          getTicketPricesByEvent(eventId),
          getSeatsByVenue(eventData.venue_id),
          getAvailableSeatsByEvent(eventId),
        ]);

        setEvent(eventData);
        setTicketPrices(prices);
        setSeats(venueSeats);
        setAvailableSeats(available);

        if (prices.length > 0) {
          setSelectedType(prices[0].type);
        }
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load booking information",
        );
      } finally {
        setLoading(false);
      }
    }

    loadBookingData();
  }, [eventId]);

  const availableSeatIds = useMemo(
    () => new Set(availableSeats.map((seat) => seat.id)),
    [availableSeats],
  );

  const selectedPrice = ticketPrices.find(
    (price) => price.type === selectedType,
  );

  const selectedSeat = seats.find((seat) => seat.id === selectedSeatId);

  async function handleBooking() {
    if (!event) {
      return;
    }

    if (!selectedType) {
      setError("Please select a ticket type");
      return;
    }

    if (!selectedSeatId) {
      setError("Please select a seat");
      return;
    }

    if (!availableSeatIds.has(selectedSeatId)) {
      setError("This seat is no longer available");
      return;
    }

    try {
      setBooking(true);
      setError("");
      setSuccessMessage("");

      const reservation = await createReservation(event.id);

      await createSeatHold(
        selectedSeatId,
        event.id,
        reservation.id,
        selectedType,
      );

      setSuccessMessage(
        `Seat ${
          selectedSeat?.seat_number
        } is held successfully. Your reservation is ${reservation.id}.`,
      );

      navigate(`/reservations/${reservation.id}`);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to reserve seat",
      );
    } finally {
      setBooking(false);
    }
  }

  if (loading) {
    return (
      <section className="page">
        <div className="state-message">Loading booking information...</div>
      </section>
    );
  }

  if (error && !event) {
    return (
      <section className="page">
        <div className="state-message error-message">{error}</div>

        <Link to="/events" className="back-link">
          ← Back to events
        </Link>
      </section>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <section className="page">
      <Link to={`/events/${event.id}`} className="back-link">
        ← Back to event
      </Link>

      <div className="booking-header">
        <div>
          <p className="eyebrow">{formatLabel(event.category)}</p>

          <h2>{event.title}</h2>

          <p className="page-description">
            Choose your ticket type and an available seat.
          </p>
        </div>
      </div>

      {error && (
        <div className="state-message error-message booking-message">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="state-message booking-message">{successMessage}</div>
      )}

      <div className="booking-layout">
        <div className="booking-main">
          <section className="booking-section">
            <div className="section-title">
              <h3>Ticket Type</h3>

              <span>
                {selectedPrice ? formatMoney(Number(selectedPrice.price)) : ""}
              </span>
            </div>

            <div className="ticket-type-grid">
              {ticketPrices.map((price) => (
                <button
                  key={price.id}
                  type="button"
                  className={
                    selectedType === price.type
                      ? "ticket-type-card selected"
                      : "ticket-type-card"
                  }
                  onClick={() => {
                    setSelectedType(price.type);
                  }}
                >
                  <span>{formatLabel(price.type)}</span>

                  <strong>{formatMoney(Number(price.price))}</strong>
                </button>
              ))}
            </div>
          </section>

          <section className="booking-section">
            <div className="section-title">
              <h3>Select a Seat</h3>

              <div className="seat-legend">
                <span>
                  <i className="legend-dot available" />
                  Available
                </span>

                <span>
                  <i className="legend-dot selected" />
                  Selected
                </span>

                <span>
                  <i className="legend-dot unavailable" />
                  Unavailable
                </span>
              </div>
            </div>

            <div className="seat-map">
              {seats.map((seat) => {
                const isAvailable = availableSeatIds.has(seat.id);

                const isSelected = selectedSeatId === seat.id;

                return (
                  <button
                    key={seat.id}
                    type="button"
                    disabled={!isAvailable}
                    className={[
                      "seat-button",
                      isAvailable ? "available" : "unavailable",
                      isSelected ? "selected" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => {
                      setSelectedSeatId(seat.id);
                    }}
                    title={`${seat.section} - Row ${seat.row} - Seat ${seat.seat_number}`}
                  >
                    {seat.seat_number}
                  </button>
                );
              })}
            </div>

            {seats.length === 0 && (
              <div className="state-message">
                No seats have been configured for this venue.
              </div>
            )}
          </section>
        </div>

        <aside className="booking-summary">
          <p className="eyebrow">Booking Summary</p>

          <h3>{event.title}</h3>

          <div className="summary-row">
            <span>Ticket</span>

            <strong>{selectedType ? formatLabel(selectedType) : "—"}</strong>
          </div>

          <div className="summary-row">
            <span>Seat</span>

            <strong>
              {selectedSeat
                ? `${selectedSeat.section} · Row ${selectedSeat.row} · Seat ${selectedSeat.seat_number}`
                : "—"}
            </strong>
          </div>

          <div className="summary-total">
            <span>Total</span>

            <strong>
              {selectedPrice ? formatMoney(Number(selectedPrice.price)) : "—"}
            </strong>
          </div>

          <button
            type="button"
            className="primary-button"
            disabled={booking || !selectedType || !selectedSeatId}
            onClick={handleBooking}
          >
            {booking ? "Reserving..." : "Reserve & Hold Seat"}
          </button>

          <p className="summary-note">
            Your selected seat will be held for 10 minutes while you complete
            payment.
          </p>
        </aside>
      </div>
    </section>
  );
}

export default EventBookingPage;
