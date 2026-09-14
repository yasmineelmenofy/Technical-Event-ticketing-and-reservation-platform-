import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../api/api";

function AppLayout() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await apiFetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      setUser(null);
      navigate("/login");
    }
  }

  const isAdmin = user?.role === "admin";

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>Eventify</h1>
          <p>Ticketing Platform</p>
        </div>

        <nav className="nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/events"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Events
          </NavLink>

          {!isAdmin && (
            <>
              <NavLink
                to="/reservations"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                My Reservations
              </NavLink>

              <NavLink
                to="/tickets"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                My Tickets
              </NavLink>
            </>
          )}

          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Admin
            </NavLink>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-summary">
            <strong>{user?.name}</strong>
            <span>{user?.role}</span>
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
