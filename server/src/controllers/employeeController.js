
import Employee from '../models/Employee.js';
import Department from '../models/Department.js';

export const getEmployees = async (req, res) => {
    try {
        const { department, search } = req.query;
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(50, Number(req.query.limit) || 20);

        const filter = {};

        if (department) filter.department = department;

        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }

        const [items, total] = await Promise.all([
            Employee.find(filter)
                .populate('department', 'name')
                .sort({ name: 1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Employee.countDocuments(filter)
        ]);

        res.json({
            items,
            total,
            page,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id)
            .populate('department', 'name');

        if (!employee) {
            return res.status(404).json({
                message: 'Employee not found'
            });
        }

        res.json(employee);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};



async function assertDepartmentExists(departmentId) {
    const exists = await Department.exists({ _id: departmentId });

    if (!exists) {
        const error = new Error(`Department ${departmentId} not found`);
        error.statusCode = 400;
        throw error;
    }
}

function pickEmployeeFields(body = {}) {
    const { name, jobTitle, salary, department, hireDate } = body;

    return { name, jobTitle, salary, department, hireDate };
}

export const createEmployee = async (req, res) => {
    try {
        const data = pickEmployeeFields(req.body);

        if (data.department) {
            await assertDepartmentExists(data.department);
        }

        const employee = await Employee.create(data);
        await employee.populate('department', 'name');

        res.status(201).json(employee);
    } catch (error) {
        res.status(error.statusCode || 400).json({
            message: error.message
        });
    }
};

export const updateEmployee = async (req, res) => {
    try {
        const data = pickEmployeeFields(req.body);

        if (data.department) {
            await assertDepartmentExists(data.department);
        }

        const employee = await Employee.findByIdAndUpdate(
            req.params.id,
            data,
            {
                new: true,
                runValidators: true
            }
        ).populate('department', 'name');

        if (!employee) {
            return res.status(404).json({
                message: 'Employee not found'
            });
        }

        res.json(employee);
    } catch (error) {
        res.status(error.statusCode || 400).json({
            message: error.message
        });
    }
};

export const deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndDelete(req.params.id);

        if (!employee) {
            return res.status(404).json({
                message: 'Employee not found'
            });
        }

        res.status(204).send();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
