import { Link } from "react-router-dom";
import type { Event } from "../types/event";

type EventCardProps = {
  event: Event;
};

function formatCategory(category: Event["category"]) {
  return category
    .split("_")
    .map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");
}

function EventCard({ event }: EventCardProps) {
  return (
    <article className="event-card">
      {event.image ? (
        <img
          src={event.image}
          alt={event.title}
          className="event-card-image"
        />
      ) : (
        <div className="event-card-image event-image-placeholder">
          Technical Event
        </div>
      )}

      <div className="event-card-body">
        <span className="event-category">
          {formatCategory(event.category)}
        </span>

        <h3>{event.title}</h3>

        <p className="event-date">
          {event.date} · {event.start_time} - {event.end_time}
        </p>

        {event.description && (
          <p className="event-description">
            {event.description}
          </p>
        )}

        <Link
          to={`/events/${event.id}`}
          className="event-details-link"
        >
          View event
        </Link>
      </div>
    </article>
  );
}

export default EventCard;