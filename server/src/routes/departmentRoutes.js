
import { Router } from 'express';
import {
    getDepartments,
    createDepartment,
    deleteDepartment
} from '../controllers/departmentController.js';

const router = Router();

router.route('/')
    .get(getDepartments)
    .post(createDepartment);

router.route('/:id')
    .delete(deleteDepartment);

export default router;
