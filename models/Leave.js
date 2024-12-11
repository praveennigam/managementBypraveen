// models/Leave.js
const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },  // Employee ID
  leaveType: { type: String, enum: ['sick', 'vacation', 'casual'], required: true },  // Type of leave
  startDate: { type: Date, required: true },  // Leave start date
  endDate: { type: Date, required: true },  // Leave end date
  totalDays: { type: Number, required: true },  // Total number of leave days
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },  // Leave status
  reason: { type: String },  // Reason for the leave
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },  // HR or Manager who approved/rejected the leave
  createdAt: { type: Date, default: Date.now },  // Leave request creation date
  updatedAt: { type: Date, default: Date.now },  // Last update date
});

const Leave = mongoose.model('Leave', leaveSchema);

module.exports = Leave;
