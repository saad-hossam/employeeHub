
import Department from '../models/Department.js';
import Employee from '../models/Employee.js';

// GET /api/departments
export const getDepartments = async (req, res) => {
    try {
        const departments = await Department.find().sort({ name: 1 });
        res.json(departments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/departments
export const createDepartment = async (req, res) => {
    try {
        const department = await Department.create({
            name: req.body?.name
        });

        res.status(201).json(department);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// DELETE /api/departments/:id
export const deleteDepartment = async (req, res) => {
    try {
        const staff = await Employee.countDocuments({
            department: req.params.id
        });

        if (staff > 0) {
            return res.status(409).json({
                message: `Cannot delete: ${staff} employee(s) still in this department`
            });
        }

        const department = await Department.findByIdAndDelete(
            req.params.id
        );

        if (!department) {
            return res.status(404).json({
                message: 'Department not found'
            });
        }

        res.status(204).send();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.updateDepartment = async (req, res) => {
  const department = await Department.findByIdAndUpdate(
    req.params.id,
    { name: req.body?.name },
    { new: true, runValidators: true }
  );
  if (!department) return res.status(404).json({ message: 'Department not found' });
  res.json(department);
};

