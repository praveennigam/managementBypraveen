// models/Holiday.js
const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
  holidayName: { type: String, required: true },  // Name of the holiday
  startDate: { type: Date, required: true },  // Start date of the holiday
  endDate: { type: Date, required: true },  // End date of the holiday
  description: { type: String },  // Additional details or reason for the holiday
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },  // Approval status
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },  // Employee requesting the holiday
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },  // HR or Manager who approves/rejects
  createdAt: { type: Date, default: Date.now },  // Request creation date
  updatedAt: { type: Date, default: Date.now },  // Last update date
});

const Holiday = mongoose.model('Holiday', holidaySchema);

module.exports = Holiday;
