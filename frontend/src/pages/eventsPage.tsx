import { useEffect, useState } from "react";
import EventCard from "../components/EventCard";
import { getPublishedEvents } from "../services/eventService";
import type { Event } from "../types/event";

function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        setError("");

        const data = await getPublishedEvents();

        setEvents(data);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to load events",
        );
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  return (
    <section className="page">
      <div className="page-header">
        <p className="eyebrow">Discover</p>

        <h2>Upcoming Events</h2>

        <p className="page-description">
          Browse published technical events and choose one to reserve.
        </p>
      </div>

      {loading && <div className="state-message">Loading events...</div>}

      {!loading && error && (
        <div className="state-message error-message">{error}</div>
      )}

      {!loading && !error && events.length === 0 && (
        <div className="state-message">
          No published events are available right now.
        </div>
      )}

      {!loading && !error && events.length > 0 && (
        <div className="events-grid">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </section>
  );
}

export default EventsPage;
