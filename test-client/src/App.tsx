import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";

import LoginPage from "./pages/loginPage";
import DashboardPage from "./pages/dashboardPage";

import EventsPage from "./pages/eventsPage";
import EventDetailsPage from "./pages/eventDetailsPage";
import EventBookingPage from "./pages/eventBookingPage";

import MyReservationsPage from "./pages/myReservationsPage";
import ReservationDetailsPage from "./pages/reservationDetailsPage";

import PaymentPage from "./pages/paymentPage";
import BookingSuccessPage from "./pages/bookingSuccessPage";

import MyTicketsPage from "./pages/myTicketsPage";
import TicketDetailsPage from "./pages/ticketDetailsPage";

import AdminPage from "./pages/adminPage";
import AdminVenuesPage from "./pages/adminVenuesPage";
import AdminEventsPage from "./pages/adminEventsPage";
import AdminSeatsPage from "./pages/adminSeatsPage";
import AdminPricesPage from "./pages/adminPricesPage";

import AppLayout from "./components/AppLayout";

function AppRoutes() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={<DashboardPage />} />

        <Route path="/events" element={<EventsPage />} />

        <Route path="/events/:id" element={<EventDetailsPage />} />

        <Route path="/events/:id/booking" element={<EventBookingPage />} />

        <Route path="/reservations" element={<MyReservationsPage />} />

        <Route path="/reservations/:id" element={<ReservationDetailsPage />} />

        <Route path="/reservations/:id/payment" element={<PaymentPage />} />

        <Route
          path="/reservations/:id/success"
          element={<BookingSuccessPage />}
        />

        <Route path="/tickets" element={<MyTicketsPage />} />

        <Route path="/tickets/:id" element={<TicketDetailsPage />} />

        {user.role === "admin" && (
          <Route path="/admin" element={<AdminPage />}>
            <Route index element={<Navigate to="/admin/venues" replace />} />

            <Route path="venues" element={<AdminVenuesPage />} />

            <Route path="events" element={<AdminEventsPage />} />

            <Route path="seats" element={<AdminSeatsPage />} />

            <Route path="prices" element={<AdminPricesPage />} />
          </Route>
        )}

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
