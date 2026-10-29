
import { Router } from 'express';

import {
    getEmployees,
    getEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee
} from '../controllers/employeeController.js';

const router = Router();

router.route('/')
    .get(getEmployees)
    .post(createEmployee);

router.route('/:id')
    .get(getEmployee)
    .put(updateEmployee)
    .delete(deleteEmployee);

export default router;
