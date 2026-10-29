
import express from 'express';
import cors from 'cors';

import departmentRoutes from './routes/departmentRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';

const app = express();

// Allow requests from your React frontend
app.use(cors({
    origin: 'http://localhost:5174'
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.json({
        message: 'Employees API is running!'
    });
});

app.use('/api/departments', departmentRoutes);
app.use('/api/employees', employeeRoutes);

export default app;
