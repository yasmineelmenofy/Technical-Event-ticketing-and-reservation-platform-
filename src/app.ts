import express from 'express';
import userRoutes from './routes/user.routes.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req,res) => {
    res.status(200).json({
        message:"The API is running from the homepage"
    })
})

app.use('/api/users', userRoutes);



export default app;