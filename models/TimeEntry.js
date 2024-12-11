// models/TimeEntry.js
const mongoose = require('mongoose');

const timeEntrySchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },  // Employee ID
  date: { type: Date, required: true },  // Date of entry
  timeIn: { type: Date, required: true },  // Time when the employee clocked in
  timeOut: { type: Date, required: true },  // Time when the employee clocked out
  lunchBreakStart: { type: Date },  // Time when the employee started their lunch break
  lunchBreakEnd: { type: Date },  // Time when the employee ended their lunch break
  grossHours: { type: Number, required: true },  // Total hours worked including lunch break
  effectiveHours: { type: Number, required: true },  // Hours worked excluding lunch break
  createdAt: { type: Date, default: Date.now },  // Entry creation date
  updatedAt: { type: Date, default: Date.now },  // Last update date
});

const TimeEntry = mongoose.model('TimeEntry', timeEntrySchema);

module.exports = TimeEntry;
