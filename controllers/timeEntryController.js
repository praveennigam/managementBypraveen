// controllers/timeEntryController.js
const TimeEntry = require('../models/TimeEntry');
const Employee = require('../models/Employee');

// Create a new time entry (Employee)
const createTimeEntry = async (req, res) => {
  const { date, timeIn, timeOut, lunchBreakStart, lunchBreakEnd } = req.body;
  const { employeeId } = req.user;

  try {
    // Calculate Gross Hours: Time difference between timeIn and timeOut
    const grossHours = (new Date(timeOut) - new Date(timeIn)) / 1000 / 3600; // in hours

    // Calculate Lunch Break Duration: if lunchBreakStart and lunchBreakEnd are provided
    const lunchBreakDuration = lunchBreakStart && lunchBreakEnd ? (new Date(lunchBreakEnd) - new Date(lunchBreakStart)) / 1000 / 3600 : 0; // in hours

    // Calculate Effective Hours: Subtract lunch break from gross hours
    const effectiveHours = grossHours - lunchBreakDuration;

    const timeEntry = new TimeEntry({
      employeeId,
      date,
      timeIn,
      timeOut,
      lunchBreakStart,
      lunchBreakEnd,
      grossHours,
      effectiveHours,
    });

    await timeEntry.save();
    res.status(201).json({ message: 'Time entry created successfully', timeEntry });
  } catch (error) {
    res.status(400).json({ message: 'Error creating time entry', error });
  }
};

// Get all time entries (Manager/HR/CEO)
const getTimeEntries = async (req, res) => {
  try {
    const timeEntries = await TimeEntry.find()
      .populate('employeeId', 'name email role')
      .sort({ createdAt: -1 });
    res.status(200).json(timeEntries);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching time entries', error });
  }
};

// Get time entries of a specific employee (Employee)
const getEmployeeTimeEntries = async (req, res) => {
  const { employeeId } = req.user;

  try {
    const timeEntries = await TimeEntry.find({ employeeId })
      .sort({ createdAt: -1 });
    res.status(200).json(timeEntries);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching time entries for the employee', error });
  }
};

// Get employee timesheet (Employee)
const getEmployeeTimesheet = async (req, res) => {
  const { employeeId } = req.user;

  try {
    const timeEntries = await TimeEntry.find({ employeeId })
      .sort({ date: 1 });  // Sort by date ascending
    res.status(200).json(timeEntries);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching employee timesheet', error });
  }
};

// Update a time entry (Manager/HR)
const updateTimeEntry = async (req, res) => {
  const { id } = req.params;
  const { timeIn, timeOut, lunchBreakStart, lunchBreakEnd } = req.body;

  try {
    const timeEntry = await TimeEntry.findById(id);
    if (!timeEntry) {
      return res.status(404).json({ message: 'Time entry not found' });
    }

    if (req.user.role === 'manager' || req.user.role === 'hr') {
      // Recalculate Gross and Effective Hours
      const grossHours = (new Date(timeOut) - new Date(timeIn)) / 1000 / 3600; // in hours
      const lunchBreakDuration = lunchBreakStart && lunchBreakEnd ? (new Date(lunchBreakEnd) - new Date(lunchBreakStart)) / 1000 / 3600 : 0; // in hours
      const effectiveHours = grossHours - lunchBreakDuration;

      timeEntry.timeIn = timeIn || timeEntry.timeIn;
      timeEntry.timeOut = timeOut || timeEntry.timeOut;
      timeEntry.lunchBreakStart = lunchBreakStart || timeEntry.lunchBreakStart;
      timeEntry.lunchBreakEnd = lunchBreakEnd || timeEntry.lunchBreakEnd;
      timeEntry.grossHours = grossHours || timeEntry.grossHours;
      timeEntry.effectiveHours = effectiveHours || timeEntry.effectiveHours;

      await timeEntry.save();
      res.status(200).json({ message: 'Time entry updated successfully', timeEntry });
    } else {
      res.status(403).json({ message: 'Access denied' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error updating time entry', error });
  }
};

// Delete a time entry (CEO)
const deleteTimeEntry = async (req, res) => {
  const { id } = req.params;

  try {
    const timeEntry = await TimeEntry.findById(id);
    if (!timeEntry) {
      return res.status(404).json({ message: 'Time entry not found' });
    }

    await timeEntry.remove();
    res.status(200).json({ message: 'Time entry deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting time entry', error });
  }
};

// Clock In (Employee)
const clockIn = async (req, res) => {
  const { date, timeIn } = req.body;
  const { employeeId } = req.user;

  try {
    const timeEntry = new TimeEntry({
      employeeId,
      date,
      timeIn,
      timeOut: null,
      grossHours: 0,
      effectiveHours: 0,
    });
    await timeEntry.save();
    res.status(201).json({ message: 'Clock-in recorded successfully', timeEntry });
  } catch (error) {
    res.status(400).json({ message: 'Error recording clock-in', error });
  }
};

// Mark Lunch Break (Employee)
const markLunchBreak = async (req, res) => {
  const { timeEntryId, lunchBreakStart, lunchBreakEnd } = req.body;

  try {
    const timeEntry = await TimeEntry.findById(timeEntryId);
    if (!timeEntry) {
      return res.status(404).json({ message: 'Time entry not found' });
    }

    timeEntry.lunchBreakStart = lunchBreakStart || timeEntry.lunchBreakStart;
    timeEntry.lunchBreakEnd = lunchBreakEnd || timeEntry.lunchBreakEnd;

    // Recalculate the hours
    const grossHours = (new Date(timeEntry.timeOut) - new Date(timeEntry.timeIn)) / 1000 / 3600;
    const lunchBreakDuration = (new Date(lunchBreakEnd) - new Date(lunchBreakStart)) / 1000 / 3600;
    const effectiveHours = grossHours - lunchBreakDuration;

    timeEntry.grossHours = grossHours;
    timeEntry.effectiveHours = effectiveHours;

    await timeEntry.save();
    res.status(200).json({ message: 'Lunch break recorded successfully', timeEntry });
  } catch (error) {
    res.status(400).json({ message: 'Error recording lunch break', error });
  }
};

module.exports = {
  createTimeEntry,
  getTimeEntries,
  getEmployeeTimeEntries,
  getEmployeeTimesheet,
  updateTimeEntry,
  deleteTimeEntry,
  clockIn,
  markLunchBreak,
};
