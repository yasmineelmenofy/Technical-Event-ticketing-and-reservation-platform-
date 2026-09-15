import { useAuth } from "../context/AuthContext";

function DashboardPage() {
  const { user } = useAuth();

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h2>Welcome back, {user?.name}</h2>
          <p className="page-description">
            Manage events, reservations, seats, and tickets.
          </p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <span className="card-label">Account</span>
          <strong>{user?.name}</strong>
          <p>{user?.email}</p>
        </div>

        <div className="dashboard-card">
          <span className="card-label">Role</span>
          <strong>{user?.role}</strong>
          <p>Your access level</p>
        </div>

        <div className="dashboard-card">
          <span className="card-label">Next</span>
          <strong>Browse Events</strong>
          <p>Choose an event and reserve your seat.</p>
        </div>
      </div>
    </section>
  );
}

export default DashboardPage;