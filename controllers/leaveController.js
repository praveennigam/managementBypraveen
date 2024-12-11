const Leave = require('../models/Leave');

// Create a leave request
exports.createLeaveRequest = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, totalDays, reason, employeeId } = req.body;

    // Create a new leave request
    const leaveRequest = new Leave({
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason,
      employeeId
    });

    await leaveRequest.save();
    res.status(201).json(leaveRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all leave requests
exports.getAllLeaveRequests = async (req, res) => {
  try {
    const leaves = await Leave.find();
    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a leave request by ID
exports.getLeaveRequestById = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });
    res.status(200).json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update leave status (approved/rejected)
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'approved', 'rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    );
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });

    res.status(200).json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve or reject a leave request (by HR or Manager)
exports.approveRejectLeave = async (req, res) => {
  try {
    const { status, approvedBy } = req.body;
    const validStatuses = ['approved', 'rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status, approvedBy, updatedAt: Date.now() },
      { new: true }
    );
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });

    res.status(200).json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get leave requests by employee ID
exports.getLeavesByEmployee = async (req, res) => {
  try {
    const leaves = await Leave.find({ employeeId: req.params.employeeId });
    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get leave requests by status (pending/approved/rejected)
exports.getLeavesByStatus = async (req, res) => {
  try {
    const leaves = await Leave.find({ status: req.params.status });
    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get leaves approved by a specific employee (HR/Manager)
exports.getLeavesByApprover = async (req, res) => {
  try {
    const leaves = await Leave.find({ approvedBy: req.params.employeeId });
    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a leave request
exports.deleteLeaveRequest = async (req, res) => {
  try {
    const leave = await Leave.findByIdAndDelete(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });

    res.status(200).json({ message: 'Leave request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
