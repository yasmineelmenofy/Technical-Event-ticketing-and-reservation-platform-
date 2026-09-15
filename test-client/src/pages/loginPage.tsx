import { useState } from "react";
import type { FormEvent } from "react";

import { apiFetch } from "../api/api";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const { setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      setUser(data.data);
      setMessage(data.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-shell">
        <div className="login-brand">
          <div className="login-logo">E</div>

          <div>
            <h1>Eventify</h1>
            <p>Technical Event Platform</p>
          </div>
        </div>

        <div className="login-card">
          <div className="login-header">
            <p className="eyebrow">Welcome back</p>

            <h2>Sign in to your account</h2>

            <p>
              Manage your reservations, tickets, and technical events from one
              place.
            </p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <div className="login-field">
              <label htmlFor="email">Email address</label>

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="login-field">
              <div className="login-label-row">
                <label htmlFor="password">Password</label>
              </div>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              className="primary-button login-button"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {message && (
            <div
              className={
                message.toLowerCase().includes("success")
                  ? "login-message login-success"
                  : "login-message login-error"
              }
            >
              {message}
            </div>
          )}
        </div>

        <p className="login-footer">
          Technical Event Ticketing & Reservation Platform
        </p>
      </section>
    </main>
  );
}

export default LoginPage;
