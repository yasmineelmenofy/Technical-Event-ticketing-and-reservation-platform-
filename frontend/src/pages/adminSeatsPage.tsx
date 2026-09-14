import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import {
  createSeat,
  deleteSeat,
  getSeatsByVenue,
  updateSeat,
} from "../services/seatService";

import { getVenues } from "../services/venueService";

import type { Seat } from "../types/seat";
import type { Venue } from "../types/venue";

type SeatForm = {
  venue_id: string;
  section: string;
  row: string;
  seat_number: string;
};

const emptyForm: SeatForm = {
  venue_id: "",
  section: "",
  row: "",
  seat_number: "",
};

function AdminSeatsPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);

  const [form, setForm] = useState<SeatForm>(emptyForm);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [loadingVenues, setLoadingVenues] = useState(true);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadVenues() {
    try {
      setLoadingVenues(true);
      setError("");

      const data = await getVenues();

      setVenues(data);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to load venues",
      );
    } finally {
      setLoadingVenues(false);
    }
  }

  async function loadSeats(venueId: number) {
    try {
      setLoadingSeats(true);
      setError("");

      const data = await getSeatsByVenue(venueId);

      setSeats(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load seats");

      setSeats([]);
    } finally {
      setLoadingSeats(false);
    }
  }

  useEffect(() => {
    loadVenues();
  }, []);

  function resetForm() {
    setForm({
      venue_id: form.venue_id,
      section: "",
      row: "",
      seat_number: "",
    });

    setEditingId(null);
  }

  function handleVenueChange(venueId: string) {
    setForm({
      ...form,
      venue_id: venueId,
    });

    setEditingId(null);
    setMessage("");
    setError("");

    if (!venueId) {
      setSeats([]);
      return;
    }

    loadSeats(Number(venueId));
  }

  function startEdit(seat: Seat) {
    setEditingId(seat.id);

    setForm({
      venue_id: String(seat.venue_id),
      section: seat.section,
      row: seat.row,
      seat_number: String(seat.seat_number),
    });

    setMessage("");
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const venueId = Number(form.venue_id);
    const seatNumber = Number(form.seat_number);

    if (
      !Number.isInteger(venueId) ||
      venueId <= 0 ||
      !form.section.trim() ||
      !form.row.trim() ||
      !Number.isInteger(seatNumber) ||
      seatNumber <= 0
    ) {
      setError("Please enter valid seat information");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      if (editingId === null) {
        await createSeat({
          venue_id: venueId,
          section: form.section.trim(),
          row: form.row.trim(),
          seat_number: seatNumber,
        });

        setMessage("Seat created successfully");
      } else {
        await updateSeat(editingId, {
          row: form.row.trim(),
          section: form.section.trim(),
          seat_number: seatNumber,
        });

        setMessage("Seat updated successfully");
      }

      const selectedVenueId = Number(form.venue_id);

      setForm({
        venue_id: String(selectedVenueId),
        section: "",
        row: "",
        seat_number: "",
      });

      setEditingId(null);

      await loadSeats(selectedVenueId);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to save seat");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(seat: Seat) {
    const confirmed = window.confirm(
      `Delete seat ${seat.section} - ${seat.row}${seat.seat_number}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      await deleteSeat(seat.id);

      setMessage("Seat deleted successfully");

      if (editingId === seat.id) {
        setEditingId(null);
      }

      if (form.venue_id) {
        await loadSeats(Number(form.venue_id));
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to delete seat",
      );
    }
  }

  return (
    <section>
      <div className="admin-section-header">
        <div>
          <h3>Seats</h3>

          <p className="card-muted">Create and manage seats for each venue.</p>
        </div>
      </div>

      {error && <div className="state-message error-message">{error}</div>}

      {message && <div className="state-message admin-success">{message}</div>}

      <div className="admin-form-card">
        <h4>{editingId === null ? "Create Seat" : "Edit Seat"}</h4>

        <form className="admin-form" onSubmit={handleSubmit}>
          <select
            value={form.venue_id}
            onChange={(event) => handleVenueChange(event.target.value)}
            disabled={loadingVenues || editingId !== null}
          >
            <option value="">
              {loadingVenues ? "Loading venues..." : "Select venue"}
            </option>

            {venues.map((venue) => (
              <option key={venue.id} value={venue.id}>
                {venue.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Section"
            value={form.section}
            onChange={(event) =>
              setForm({
                ...form,
                section: event.target.value,
              })
            }
          />

          <input
            type="text"
            placeholder="Row"
            value={form.row}
            onChange={(event) =>
              setForm({
                ...form,
                row: event.target.value,
              })
            }
          />

          <input
            type="number"
            min="1"
            placeholder="Seat number"
            value={form.seat_number}
            onChange={(event) =>
              setForm({
                ...form,
                seat_number: event.target.value,
              })
            }
          />

          <div className="form-actions">
            <button
              type="submit"
              className="primary-button"
              disabled={saving || !form.venue_id}
            >
              {saving
                ? "Saving..."
                : editingId === null
                  ? "Create Seat"
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
        {!form.venue_id ? (
          <div className="state-message">Select a venue to view its seats.</div>
        ) : loadingSeats ? (
          <div className="state-message">Loading seats...</div>
        ) : seats.length === 0 ? (
          <div className="state-message">No seats found for this venue.</div>
        ) : (
          seats.map((seat) => (
            <article key={seat.id} className="admin-list-card">
              <div>
                <h4>
                  {seat.section} - {seat.row}
                  {seat.seat_number}
                </h4>

                <p className="card-muted">Section: {seat.section}</p>

                <p className="card-muted">Row: {seat.row}</p>

                <p className="card-muted">Seat number: {seat.seat_number}</p>
              </div>

              <div className="admin-card-side">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => startEdit(seat)}
                >
                  Edit
                </button>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => handleDelete(seat)}
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

export default AdminSeatsPage;
