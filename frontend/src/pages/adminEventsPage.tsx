import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import {
  createEvent,
  getAllEvents,
  updateEvent,
  updateEventStatus,
} from "../services/eventService";

import { getVenues } from "../services/venueService";

import type { Event, EventCategory, EventStatus } from "../types/event";

import type { Venue } from "../types/venue";

type EventForm = {
  title: string;
  description: string;
  category: EventCategory;
  status: EventStatus;
  date: string;
  venue_id: string;
  start_time: string;
  end_time: string;
  image: string;
};

const emptyForm: EventForm = {
  title: "",
  description: "",
  category: "technical_meetup",
  status: "draft",
  date: "",
  venue_id: "",
  start_time: "",
  end_time: "",
  image: "",
};

function formatLabel(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);

  const [venues, setVenues] = useState<Venue[]>([]);

  const [form, setForm] = useState<EventForm>(emptyForm);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  async function loadData() {
    try {
      setLoading(true);

      const [eventData, venueData] = await Promise.all([
        getAllEvents(),
        getVenues(),
      ]);

      setEvents(eventData);
      setVenues(venueData);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load admin event data",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEdit(event: Event) {
    setEditingId(event.id);

    setForm({
      title: event.title,
      description: event.description ?? "",
      category: event.category,
      status: event.status,
      date: event.date,
      venue_id: String(event.venue_id),
      start_time: event.start_time,
      end_time: event.end_time,
      image: event.image ?? "",
    });

    setError("");
    setMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const venueId = Number(form.venue_id);

    if (
      !form.title.trim() ||
      !form.date ||
      !Number.isInteger(venueId) ||
      venueId <= 0 ||
      !form.start_time ||
      !form.end_time
    ) {
      setError("Please complete all required event fields");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const data = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        category: form.category,
        status: form.status,
        date: form.date,
        venue_id: venueId,
        start_time: form.start_time,
        end_time: form.end_time,
        image: form.image.trim() || undefined,
      };

      if (editingId === null) {
        await createEvent(data);

        setMessage("Event created successfully");
      } else {
        await updateEvent(editingId, data);

        setMessage("Event updated successfully");
      }

      resetForm();
      await loadData();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to save event");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(event: Event) {
    const nextStatus: EventStatus =
      event.status === "published" ? "cancelled" : "published";

    try {
      setError("");
      setMessage("");

      await updateEventStatus(event.id, nextStatus);

      setMessage("Event status updated successfully");

      await loadData();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update event status",
      );
    }
  }

  return (
    <section>
      <div className="admin-section-header">
        <div>
          <h3>Events</h3>

          <p className="card-muted">Create and manage technical events.</p>
        </div>
      </div>

      {error && <div className="state-message error-message">{error}</div>}

      {message && <div className="state-message admin-success">{message}</div>}

      <div className="admin-form-card">
        <h4>{editingId === null ? "Create Event" : "Edit Event"}</h4>

        <form className="admin-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Event title"
            value={form.title}
            onChange={(event) =>
              setForm({
                ...form,
                title: event.target.value,
              })
            }
          />

          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(event) =>
              setForm({
                ...form,
                description: event.target.value,
              })
            }
          />

          <select
            value={form.category}
            onChange={(event) =>
              setForm({
                ...form,
                category: event.target.value as EventCategory,
              })
            }
          >
            <option value="conference">Conference</option>

            <option value="workshop">Workshop</option>

            <option value="technical_meetup">Technical Meetup</option>

            <option value="seminar">Seminar</option>

            <option value="training_session">Training Session</option>
          </select>

          <select
            value={form.status}
            onChange={(event) =>
              setForm({
                ...form,
                status: event.target.value as EventStatus,
              })
            }
          >
            <option value="draft">Draft</option>

            <option value="published">Published</option>

            <option value="cancelled">Cancelled</option>

            <option value="completed">Completed</option>
          </select>

          <input
            type="date"
            value={form.date}
            onChange={(event) =>
              setForm({
                ...form,
                date: event.target.value,
              })
            }
          />

          <select
            value={form.venue_id}
            onChange={(event) =>
              setForm({
                ...form,
                venue_id: event.target.value,
              })
            }
          >
            <option value="">Select venue</option>

            {venues.map((venue) => (
              <option key={venue.id} value={venue.id}>
                {venue.name}
              </option>
            ))}
          </select>

          <input
            type="time"
            value={form.start_time}
            onChange={(event) =>
              setForm({
                ...form,
                start_time: event.target.value,
              })
            }
          />

          <input
            type="time"
            value={form.end_time}
            onChange={(event) =>
              setForm({
                ...form,
                end_time: event.target.value,
              })
            }
          />

          <input
            type="text"
            placeholder="Image URL (optional)"
            value={form.image}
            onChange={(event) =>
              setForm({
                ...form,
                image: event.target.value,
              })
            }
          />

          <div className="form-actions">
            <button type="submit" className="primary-button" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId === null
                  ? "Create Event"
                  : "Save Changes"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                className="secondary-button"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-list">
        {loading ? (
          <div className="state-message">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="state-message">No events found.</div>
        ) : (
          events.map((event) => {
            const venue = venues.find((item) => item.id === event.venue_id);

            return (
              <article key={event.id} className="admin-list-card">
                <div>
                  <span className="event-category">
                    {formatLabel(event.category)}
                  </span>

                  <h4>{event.title}</h4>

                  <p className="card-muted">
                    {event.date} · {event.start_time} - {event.end_time}
                  </p>

                  <p className="card-muted">
                    Venue: {venue?.name ?? event.venue_id}
                  </p>
                </div>

                <div className="admin-card-side">
                  <span className={`status-badge status-${event.status}`}>
                    {event.status}
                  </span>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => startEdit(event)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => handleStatusChange(event)}
                  >
                    {event.status === "published" ? "Cancel" : "Publish"}
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}

export default AdminEventsPage;
