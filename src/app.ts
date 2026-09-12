import express from "express";
import userRoutes from "./routes/user.routes.js";
import venueRoutes from "./routes/venue.routes.js";
import eventRoutes from "./routes/event.routes.js";
import authRoutes from "./routes/auth.routes.js";
import reservationRoutes from "./routes/reservation.routes.js";
import eventTicketPriceRoutes from "./routes/eventTicketPrice.routes.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({
    message: "The API is running from the homepage",
  });
});

app.use("/api/users", userRoutes);
app.use("/api/venues", venueRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api", eventTicketPriceRoutes);
app.use(errorMiddleware);

export default app;
