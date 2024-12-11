// routes/timeEntryRoutes.js
const express = require('express');
const router = express.Router();
const {
  createTimeEntry,
  getTimeEntries,
  getEmployeeTimeEntries,
  getEmployeeTimesheet,
  updateTimeEntry,
  deleteTimeEntry,
  clockIn,
  markLunchBreak
} = require('../controllers/timeEntryController');
const { authMiddleware, isManager, isHR, isCEO } = require('../middleware/authMiddleware');

// Employee routes
router.post('/timeEntries', authMiddleware, createTimeEntry); // Create Time Entry
router.get('/timeEntries/employee', authMiddleware, getEmployeeTimeEntries); // Get Employee Time Entries
router.get('/timeEntries/timesheet', authMiddleware, getEmployeeTimesheet); // Get Employee Timesheet
router.post('/timeEntries/clockIn', authMiddleware, clockIn); // Clock-In
router.post('/timeEntries/lunchBreak', authMiddleware, markLunchBreak); // Mark Lunch Break

// Manager/HR/CEO routes
router.get('/timeEntries', authMiddleware, isManager, getTimeEntries); // Get All Time Entries
router.put('/timeEntries/:id', authMiddleware, isManager, updateTimeEntry); // Update Time Entry
router.delete('/timeEntries/:id', authMiddleware, isCEO, deleteTimeEntry); // Delete Time Entry

module.exports = router;
