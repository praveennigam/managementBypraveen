const Salary = require('../models/Salary');

// Create a salary record
exports.createSalary = async (req, res) => {
  try {
    const { employeeId, basic, bonus, deductions, payDate } = req.body;

    // Calculate total salary (basic + bonus - deductions)
    const totalSalary = basic + bonus - deductions;

    const salary = new Salary({
      employeeId,
      basic,
      bonus,
      deductions,
      totalSalary,
      payDate
    });

    await salary.save();
    res.status(201).json(salary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all salary records
exports.getAllSalaries = async (req, res) => {
  try {
    const salaries = await Salary.find().populate('employeeId', 'name email');
    res.status(200).json(salaries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a salary record by ID
exports.getSalaryById = async (req, res) => {
  try {
    const salary = await Salary.findById(req.params.id).populate('employeeId', 'name email');
    if (!salary) return res.status(404).json({ message: 'Salary record not found' });
    res.status(200).json(salary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get salary records by employee ID
exports.getSalaryByEmployee = async (req, res) => {
  try {
    const salaries = await Salary.find({ employeeId: req.params.employeeId }).populate('employeeId', 'name email');
    if (!salaries.length) return res.status(404).json({ message: 'No salary records found for this employee' });
    res.status(200).json(salaries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update salary record (bonus, deductions, etc.)
exports.updateSalary = async (req, res) => {
  try {
    const { basic, bonus, deductions } = req.body;

    // Recalculate total salary
    const totalSalary = basic + bonus - deductions;

    const updatedSalary = await Salary.findByIdAndUpdate(
      req.params.id,
      { basic, bonus, deductions, totalSalary, updatedAt: Date.now() },
      { new: true }
    ).populate('employeeId', 'name email');

    if (!updatedSalary) return res.status(404).json({ message: 'Salary record not found' });

    res.status(200).json(updatedSalary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Increment salary (increase basic salary)
exports.incrementSalary = async (req, res) => {
  try {
    const { incrementAmount } = req.body;

    const salary = await Salary.findById(req.params.id);
    if (!salary) return res.status(404).json({ message: 'Salary record not found' });

    salary.basic += incrementAmount;
    salary.totalSalary = salary.basic + salary.bonus - salary.deductions;

    const updatedSalary = await salary.save();
    res.status(200).json(updatedSalary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark salary as paid
exports.markSalaryAsPaid = async (req, res) => {
  try {
    const salary = await Salary.findByIdAndUpdate(
      req.params.id,
      { isPaid: true, updatedAt: Date.now() },
      { new: true }
    );

    if (!salary) return res.status(404).json({ message: 'Salary record not found' });

    res.status(200).json(salary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a salary record
exports.deleteSalary = async (req, res) => {
  try {
    const salary = await Salary.findByIdAndDelete(req.params.id);
    if (!salary) return res.status(404).json({ message: 'Salary record not found' });

    res.status(200).json({ message: 'Salary record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
