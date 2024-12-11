const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');

// Create a leave request
router.post('/', leaveController.createLeaveRequest);

// Get all leave requests
router.get('/', leaveController.getAllLeaveRequests);

// Get a leave request by ID
router.get('/:id', leaveController.getLeaveRequestById);

// Update leave status (approved/rejected)
router.put('/:id/status', leaveController.updateLeaveStatus);

// Approve or reject a leave request
router.put('/:id/approveReject', leaveController.approveRejectLeave);

// Get leave requests by employee ID
router.get('/employee/:employeeId', leaveController.getLeavesByEmployee);

// Get leave requests by status (pending/approved/rejected)
router.get('/status/:status', leaveController.getLeavesByStatus);

// Get leaves approved by a specific employee (HR/Manager)
router.get('/approvedBy/:employeeId', leaveController.getLeavesByApprover);

// Delete a leave request
router.delete('/:id', leaveController.deleteLeaveRequest);

module.exports = router;
