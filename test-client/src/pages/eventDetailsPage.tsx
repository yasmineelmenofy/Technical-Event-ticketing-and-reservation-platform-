import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getEventById } from "../services/eventService";
import type { Event } from "../types/event";

function formatCategory(category: Event["category"]) {
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEvent() {
      if (!id) {
        setError("Invalid event id");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getEventById(Number(id));

        setEvent(data);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to load event",
        );
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [id]);

  if (loading) {
    return (
      <section className="page">
        <div className="state-message">Loading event...</div>
      </section>
    );
  }

  if (error || !event) {
    return (
      <section className="page">
        <div className="state-message error-message">
          {error || "Event not found"}
        </div>

        <Link to="/events" className="back-link">
          ← Back to events
        </Link>
      </section>
    );
  }

  return (
    <section className="page">
      <Link to="/events" className="back-link">
        ← Back to events
      </Link>

      <div className="event-details">
        {event.image ? (
          <img
            src={event.image}
            alt={event.title}
            className="event-details-image"
          />
        ) : (
          <div className="event-details-image event-image-placeholder">
            Technical Event
          </div>
        )}

        <div className="event-details-content">
          <span className="event-category">
            {formatCategory(event.category)}
          </span>

          <h2>{event.title}</h2>

          <div className="event-meta">
            <div>
              <span>Date</span>
              <strong>{event.date}</strong>
            </div>

            <div>
              <span>Time</span>
              <strong>
                {event.start_time} - {event.end_time}
              </strong>
            </div>

            <div>
              <span>Venue ID</span>
              <strong>{event.venue_id}</strong>
            </div>
          </div>

          {event.description && (
            <div className="event-description-large">
              <h3>About this event</h3>
              <p>{event.description}</p>
            </div>
          )}

          <div className="event-action-area">
            <p>
              Seat selection and reservation will be available from this event.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={() => navigate(`/events/${event.id}/booking`)}
            >
              Reserve a seat
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default EventDetailsPage;
