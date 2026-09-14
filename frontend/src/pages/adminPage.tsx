import { NavLink, Outlet } from "react-router-dom";

function AdminPage() {
  return (
    <section className="page">
      <div className="page-header">
        <p className="eyebrow">Administration</p>

        <h2>Admin Dashboard</h2>

        <p className="page-description">
          Manage venues, events, seats, and ticket prices.
        </p>
      </div>

      <div className="admin-nav">
        <NavLink
          to="/admin/venues"
          className={({ isActive }) =>
            isActive ? "admin-tab active" : "admin-tab"
          }
        >
          Venues
        </NavLink>

        <NavLink
          to="/admin/events"
          className={({ isActive }) =>
            isActive ? "admin-tab active" : "admin-tab"
          }
        >
          Events
        </NavLink>

        <NavLink
          to="/admin/seats"
          className={({ isActive }) =>
            isActive ? "admin-tab active" : "admin-tab"
          }
        >
          Seats
        </NavLink>

        <NavLink
          to="/admin/prices"
          className={({ isActive }) =>
            isActive ? "admin-tab active" : "admin-tab"
          }
        >
          Ticket Prices
        </NavLink>
      </div>

      <div className="admin-content">
        <Outlet />
      </div>
    </section>
  );
}

export default AdminPage;
