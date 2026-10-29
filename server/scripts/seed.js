
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Department from '../src/models/Department.js';
import Employee from '../src/models/Employee.js';

dotenv.config();

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected');

        // WARNING: This deletes ALL existing departments and employees.
        await Employee.deleteMany({});
        await Department.deleteMany({});

        const [it, hr, finance] = await Department.create([
            { name: 'IT' },
            { name: 'HR' },
            { name: 'Finance' }
        ]);

        await Employee.create([
            {
                name: 'Ahmed Ali',
                jobTitle: 'Developer',
                salary: 25000,
                department: it._id
            },
            {
                name: 'Sara Adel',
                jobTitle: 'QA Engineer',
                salary: 17000,
                department: it._id
            },
            {
                name: 'Mona Hassan',
                jobTitle: 'Recruiter',
                salary: 18000,
                department: hr._id
            },
            {
                name: 'Omar Khaled',
                jobTitle: 'Accountant',
                salary: 20000,
                department: finance._id
            }
        ]);

        console.log('Seeded 3 departments and 4 employees');
    } catch (error) {
        console.error('Seeding failed:', error.message);
        process.exitCode = 1;
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    }
}

seed();
