const Holiday = require('../models/Holidays');

// Create a holiday request
exports.createHolidayRequest = async (req, res) => {
  try {
    const { holidayName, startDate, endDate, description, employeeId } = req.body;

    // Create a new holiday request
    const holidayRequest = new Holiday({
      holidayName,
      startDate,
      endDate,
      description,
      employeeId
    });

    await holidayRequest.save();
    res.status(201).json(holidayRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all holiday requests
exports.getAllHolidayRequests = async (req, res) => {
  try {
    const holidays = await Holiday.find();
    res.status(200).json(holidays);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a holiday request by ID
exports.getHolidayRequestById = async (req, res) => {
  try {
    const holiday = await Holiday.findById(req.params.id);
    if (!holiday) return res.status(404).json({ message: 'Holiday request not found' });
    res.status(200).json(holiday);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update the holiday status (approved/rejected)
exports.updateHolidayStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'approved', 'rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const holiday = await Holiday.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    );
    if (!holiday) return res.status(404).json({ message: 'Holiday request not found' });

    res.status(200).json(holiday);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve or reject a holiday request (by HR or Manager)
exports.approveRejectHoliday = async (req, res) => {
  try {
    const { status, approvedBy } = req.body;
    const validStatuses = ['approved', 'rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const holiday = await Holiday.findByIdAndUpdate(
      req.params.id,
      { status, approvedBy, updatedAt: Date.now() },
      { new: true }
    );
    if (!holiday) return res.status(404).json({ message: 'Holiday request not found' });

    res.status(200).json(holiday);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get holiday requests by employee ID
exports.getHolidaysByEmployee = async (req, res) => {
  try {
    const holidays = await Holiday.find({ employeeId: req.params.employeeId });
    res.status(200).json(holidays);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get holiday requests by status (pending/approved/rejected)
exports.getHolidaysByStatus = async (req, res) => {
  try {
    const holidays = await Holiday.find({ status: req.params.status });
    res.status(200).json(holidays);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get holidays approved by a specific employee (HR/Manager)
exports.getHolidaysByApprover = async (req, res) => {
  try {
    const holidays = await Holiday.find({ approvedBy: req.params.employeeId });
    res.status(200).json(holidays);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a holiday request
exports.deleteHolidayRequest = async (req, res) => {
  try {
    const holiday = await Holiday.findByIdAndDelete(req.params.id);
    if (!holiday) return res.status(404).json({ message: 'Holiday request not found' });

    res.status(200).json({ message: 'Holiday request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
