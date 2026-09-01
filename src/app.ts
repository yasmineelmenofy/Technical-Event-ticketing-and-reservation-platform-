import express from 'express';
import userRoutes from './routes/user.routes.js';
import venueRoutes from './routes/venue.routes.js'
import eventRoutes from './routes/event.routes.js';
import { errorMiddleware } from "./middleware/error.middleware.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req,res) => {
    res.status(200).json({
        message:"The API is running from the homepage"
    })
})

app.use('/api/users', userRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/events', eventRoutes);

app.use(errorMiddleware);


export default app;