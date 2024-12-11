// models/Salary.js
const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },  // Employee ID
  basic: { type: Number, required: true },  // Basic salary
  bonus: { type: Number, default: 0 },  // Bonus
  deductions: { type: Number, default: 0 },  // Deductions
  totalSalary: { type: Number, required: true },  // Total salary (basic + bonus - deductions)
  payDate: { type: Date, default: Date.now },  // Date of salary payment
  isPaid: { type: Boolean, default: false },  // Has the salary been paid
  createdAt: { type: Date, default: Date.now },  // Date when salary was created
  updatedAt: { type: Date, default: Date.now },  // Date when salary was last updated
});

const Salary = mongoose.model('Salary', salarySchema);

module.exports = Salary;
