const express = require('express');
const router = express.Router();
const salaryController = require('../controllers/salaryController');

// Create a salary record
router.post('/', salaryController.createSalary);

// Get all salary records
router.get('/', salaryController.getAllSalaries);

// Get salary record by ID
router.get('/:id', salaryController.getSalaryById);

// Get salary records by employee ID
router.get('/employee/:employeeId', salaryController.getSalaryByEmployee);

// Update salary record (for bonus, deductions, etc.)
router.put('/:id', salaryController.updateSalary);

// Increment salary (for raising basic salary)
router.put('/:id/increment', salaryController.incrementSalary);

// Mark salary as paid
router.put('/:id/mark-paid', salaryController.markSalaryAsPaid);

// Delete a salary record
router.delete('/:id', salaryController.deleteSalary);

module.exports = router;
