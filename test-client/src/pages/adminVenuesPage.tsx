import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import {
  createVenue,
  getVenues,
  updateVenue,
  updateVenueStatus,
} from "../services/venueService";

import type { Venue, VenueStatus } from "../types/venue";

type VenueForm = {
  name: string;
  location: string;
  capacity: string;
  description: string;
  status: VenueStatus;
};

const emptyForm: VenueForm = {
  name: "",
  location: "",
  capacity: "",
  description: "",
  status: "active",
};

function AdminVenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);

  const [form, setForm] = useState<VenueForm>(emptyForm);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  async function loadVenues() {
    try {
      setLoading(true);

      const data = await getVenues();

      setVenues(data);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to load venues",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVenues();
  }, []);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEdit(venue: Venue) {
    setEditingId(venue.id);

    setForm({
      name: venue.name,
      location: venue.location,
      capacity: String(venue.capacity),
      description: venue.description ?? "",
      status: venue.status,
    });

    setMessage("");
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const capacity = Number(form.capacity);

    if (
      !form.name.trim() ||
      !form.location.trim() ||
      !Number.isInteger(capacity) ||
      capacity < 0
    ) {
      setError("Please enter valid venue information");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      if (editingId === null) {
        await createVenue({
          name: form.name.trim(),
          location: form.location.trim(),
          capacity,
          description: form.description.trim() || undefined,
          status: form.status,
        });

        setMessage("Venue created successfully");
      } else {
        await updateVenue(editingId, {
          name: form.name.trim(),
          location: form.location.trim(),
          capacity,
          description: form.description.trim() || undefined,
          status: form.status,
        });

        setMessage("Venue updated successfully");
      }

      resetForm();
      await loadVenues();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to save venue");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(venue: Venue) {
    const newStatus = venue.status === "active" ? "inactive" : "active";

    try {
      setError("");
      setMessage("");

      await updateVenueStatus(venue.id, newStatus);

      setMessage(`Venue ${newStatus} successfully`);

      await loadVenues();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update venue status",
      );
    }
  }

  return (
    <section>
      <div className="admin-section-header">
        <div>
          <h3>Venues</h3>
          <p className="card-muted">Create and manage event venues.</p>
        </div>
      </div>

      {error && <div className="state-message error-message">{error}</div>}

      {message && <div className="state-message admin-success">{message}</div>}

      <div className="admin-form-card">
        <h4>{editingId === null ? "Create Venue" : "Edit Venue"}</h4>

        <form className="admin-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Venue name"
            value={form.name}
            onChange={(event) =>
              setForm({
                ...form,
                name: event.target.value,
              })
            }
          />

          <input
            type="text"
            placeholder="Location"
            value={form.location}
            onChange={(event) =>
              setForm({
                ...form,
                location: event.target.value,
              })
            }
          />

          <input
            type="number"
            min="0"
            placeholder="Capacity"
            value={form.capacity}
            onChange={(event) =>
              setForm({
                ...form,
                capacity: event.target.value,
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
            value={form.status}
            onChange={(event) =>
              setForm({
                ...form,
                status: event.target.value as VenueStatus,
              })
            }
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <div className="form-actions">
            <button type="submit" className="primary-button" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId === null
                  ? "Create Venue"
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
          <div className="state-message">Loading venues...</div>
        ) : venues.length === 0 ? (
          <div className="state-message">No venues found.</div>
        ) : (
          venues.map((venue) => (
            <article key={venue.id} className="admin-list-card">
              <div>
                <h4>{venue.name}</h4>

                <p className="card-muted">{venue.location}</p>

                <p className="card-muted">Capacity: {venue.capacity}</p>
              </div>

              <div className="admin-card-side">
                <span className={`status-badge status-${venue.status}`}>
                  {venue.status}
                </span>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => startEdit(venue)}
                >
                  Edit
                </button>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => handleStatusChange(venue)}
                >
                  {venue.status === "active" ? "Deactivate" : "Activate"}
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default AdminVenuesPage;
