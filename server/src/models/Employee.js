
import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        jobTitle: {
            type: String,
            required: true,
            trim: true
        },
        salary: {
            type: Number,
            required: true,
            min: 0
        },
        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department',
            required: true
        }
    },
    {
        timestamps: true
    }
);

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;
