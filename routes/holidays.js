const express = require('express');
const router = express.Router();
const holidayController = require('../controllers/holidayController');

// Create a holiday request
router.post('/', holidayController.createHolidayRequest);

// Get all holiday requests
router.get('/', holidayController.getAllHolidayRequests);

// Get a holiday request by ID
router.get('/:id', holidayController.getHolidayRequestById);

// Update the holiday status (approved/rejected)
router.put('/:id/status', holidayController.updateHolidayStatus);

// Approve or reject a holiday request
router.put('/:id/approveReject', holidayController.approveRejectHoliday);

// Get holiday requests by employee ID
router.get('/employee/:employeeId', holidayController.getHolidaysByEmployee);

// Get holiday requests by status (pending/approved/rejected)
router.get('/status/:status', holidayController.getHolidaysByStatus);

// Get holidays approved by a specific employee (HR/Manager)
router.get('/approvedBy/:employeeId', holidayController.getHolidaysByApprover);

// Delete a holiday request
router.delete('/:id', holidayController.deleteHolidayRequest);

module.exports = router;
