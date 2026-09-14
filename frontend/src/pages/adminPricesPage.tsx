import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { getAllEvents } from "../services/eventService";

import {
  createTicketPrice,
  deleteTicketPrice,
  getTicketPricesByEvent,
  updateTicketPrice,
} from "../services/ticketPriceService";

import type { Event } from "../types/event";

import type { TicketPrice, TicketType } from "../types/ticket";

function formatLabel(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function AdminPricesPage() {
  const [events, setEvents] = useState<Event[]>([]);

  const [selectedEventId, setSelectedEventId] = useState("");

  const [prices, setPrices] = useState<TicketPrice[]>([]);

  const [type, setType] = useState<TicketType>("regular");

  const [price, setPrice] = useState("");

  const [loading, setLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await getAllEvents();

        setEvents(data);

        if (data.length > 0) {
          setSelectedEventId(String(data[0].id));
        }
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to load events",
        );
      }
    }

    loadEvents();
  }, []);

  async function loadPrices(eventId: number) {
    try {
      setLoading(true);
      setError("");

      const data = await getTicketPricesByEvent(eventId);

      setPrices(data);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to load ticket prices",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (selectedEventId) {
      loadPrices(Number(selectedEventId));
    } else {
      setPrices([]);
    }
  }, [selectedEventId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const numericPrice = Number(price);

    const eventId = Number(selectedEventId);

    if (
      !Number.isInteger(eventId) ||
      eventId <= 0 ||
      !Number.isFinite(numericPrice) ||
      numericPrice < 0
    ) {
      setError("Please enter a valid ticket price");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      await createTicketPrice(eventId, type, numericPrice);

      setMessage("Ticket price created successfully");

      setPrice("");

      await loadPrices(eventId);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create ticket price",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(ticketPrice: TicketPrice) {
    const input = window.prompt(
      "Enter the new price:",
      String(ticketPrice.price),
    );

    if (input === null) {
      return;
    }

    const numericPrice = Number(input);

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      setError("Invalid price");
      return;
    }

    try {
      setError("");
      setMessage("");

      await updateTicketPrice(
        Number(selectedEventId),
        ticketPrice.type,
        numericPrice,
      );

      setMessage("Ticket price updated successfully");

      await loadPrices(Number(selectedEventId));
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update ticket price",
      );
    }
  }

  async function handleDelete(ticketPrice: TicketPrice) {
    if (!window.confirm(`Delete ${formatLabel(ticketPrice.type)} price?`)) {
      return;
    }

    try {
      setError("");
      setMessage("");

      await deleteTicketPrice(Number(selectedEventId), ticketPrice.type);

      setMessage("Ticket price deleted successfully");

      await loadPrices(Number(selectedEventId));
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete ticket price",
      );
    }
  }

  return (
    <section>
      <div className="admin-section-header">
        <div>
          <h3>Ticket Prices</h3>

          <p className="card-muted">Manage ticket pricing for each event.</p>
        </div>
      </div>

      {error && <div className="state-message error-message">{error}</div>}

      {message && <div className="state-message admin-success">{message}</div>}

      <div className="admin-form-card">
        <label htmlFor="price-event">Event</label>

        <select
          id="price-event"
          value={selectedEventId}
          onChange={(event) => setSelectedEventId(event.target.value)}
        >
          <option value="">Select event</option>

          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title}
            </option>
          ))}
        </select>

        <h4>Add Ticket Price</h4>

        <form className="admin-form" onSubmit={handleSubmit}>
          <select
            value={type}
            onChange={(event) => setType(event.target.value as TicketType)}
          >
            <option value="regular">Regular</option>

            <option value="vip">VIP</option>

            <option value="student">Student</option>

            <option value="early_bird">Early Bird</option>
          </select>

          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Price"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
          />

          <button
            type="submit"
            className="primary-button"
            disabled={saving || !selectedEventId}
          >
            {saving ? "Creating..." : "Create Price"}
          </button>
        </form>
      </div>

      <div className="admin-list">
        {loading ? (
          <div className="state-message">Loading ticket prices...</div>
        ) : prices.length === 0 ? (
          <div className="state-message">
            No ticket prices found for this event.
          </div>
        ) : (
          prices.map((ticketPrice) => (
            <article key={ticketPrice.id} className="admin-list-card">
              <div>
                <span className="event-category">
                  {formatLabel(ticketPrice.type)}
                </span>

                <h4>{Number(ticketPrice.price).toFixed(2)} EGP</h4>
              </div>

              <div className="admin-card-side">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => handleUpdate(ticketPrice)}
                >
                  Update
                </button>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => handleDelete(ticketPrice)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default AdminPricesPage;
