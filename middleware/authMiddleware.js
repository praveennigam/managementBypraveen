const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Employee.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

const roleMiddleware = (allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied.' });
  }
  next();
};

const isCEO = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Only CEO can perform this action.' });
  }
  next();
};

const isManager = (req, res, next) => {
  if (!['admin', 'manager'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied. Only Manager or CEO can perform this action.' });
  }
  next();
};

const isHR = (req, res, next) => {
  if (req.user.role !== 'hr') {
    return res.status(403).json({ message: 'Access denied. Only HR can perform this action.' });
  }
  next();
};

const isEmployee = (req, res, next) => {
  if (req.user.role !== 'employee') {
    return res.status(403).json({ message: 'Access denied. Only employee can perform this action.' });
  }
  next();
};

module.exports = { authMiddleware, roleMiddleware, isCEO, isManager, isHR, isEmployee };
