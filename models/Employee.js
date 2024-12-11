const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Employee Schema
const employeeSchema = new mongoose.Schema({
  empId: { type: Number, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  address: { type: String },

  role: {
    type: String,
    required: true,
    enum: ['admin', 'manager', 'hr', 'employee'],
    default: 'employee',
  },
  password: { type: String, required: true },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
  hireDate: { type: Date, default: Date.now },
  department: { type: String },
  contactNumber: { type: String },
  address: { type: String },
  isActive: { type: Boolean, default: true },
  image: { type: String, default: null },
  gender: { type: String, enum: ['male', 'female', 'other'], default: 'male' },
  dateOfBirth: { type: Date },
  emergencyContact: {
    name: { type: String },
    relationship: { type: String },
    phone: { type: String },
  },
  employmentStatus: {
    type: String,
    enum: ['active', 'on-leave', 'terminated', 'resigned'],
    default: 'active',
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved',
  },
  dateOfJoining: { type: Date, default: Date.now },
  endDate: { type: Date },
  performanceRating: { type: Number, min: 1, max: 5 },
  salary: { type: Number },
  isMarried: { type: Boolean, default: false },
  education: { type: String },
  workExperience: { type: String },
  skills: [String],
  certifications: [String],
  lastPromotionDate: { type: Date },
  workLocation: { type: String },
  employmentType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'intern'],
    default: 'full-time',
  },
  probationPeriodEnd: { type: Date },
  managerName: { type: String },
}, {
  timestamps: true,  // Automatically adds createdAt and updatedAt timestamps
});

// Pre-save hook to generate empId automatically
employeeSchema.pre('save', async function (next) {
  if (this.isNew) {
    try {
      // Use aggregation to find the maximum empId in the collection
      const latestEmployee = await mongoose.model('Employee').findOne().sort({ empId: -1 }).exec();
      // If no employees exist, start with empId 1, else increment the latest empId
      this.empId = latestEmployee ? latestEmployee.empId + 1 : 1;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Pre-save hook to hash the password before saving it
employeeSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare the plain password with the hashed password in the database
employeeSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;















// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const employeeSchema = new mongoose.Schema({
//   empId: { type: Number, unique: true },
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   role: {
//     type: String,
//     required: true,
//     enum: ['admin', 'manager', 'hr', 'employee'],
//     default: 'employee'
//   },
//   password: { type: String, required: true },
//   manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
//   hireDate: { type: Date, default: Date.now },
//   department: { type: String },
//   contactNumber: { type: String },
//   address: { type: String },
//   isActive: { type: Boolean, default: true },
//   image: { type: String, default: null },
//   gender: { type: String, enum: ['male', 'female', 'other'], default: 'male' },
//   dateOfBirth: { type: Date },
//   emergencyContact: {
//     name: { type: String },
//     relationship: { type: String },
//     phone: { type: String }
//   },
//   employmentStatus: {
//     type: String,
//     enum: ['active', 'on-leave', 'terminated', 'resigned'],
//     default: 'active'
//   },
  
//   dateOfJoining: { type: Date, default: Date.now },
//   endDate: { type: Date },
//   performanceRating: { type: Number, min: 1, max: 5 },
//   salary: { type: Number },
//   isMarried: { type: Boolean, default: false },
//   education: { type: String },
//   workExperience: { type: String },
//   skills: [String],
//   certifications: [String],
//   lastPromotionDate: { type: Date },
//   workLocation: { type: String },
//   employmentType: {
//     type: String,
//     enum: ['full-time', 'part-time', 'contract', 'intern'],
//     default: 'full-time'
//   },
//   probationPeriodEnd: { type: Date },
//   managerName: { type: String },
// }, {
//   timestamps: true,
// });



// employeeSchema.pre('save', async function (next) {
//   if (this.isNew) {
//     try {
//       const lastEmployee = await Employee.findOne().sort({ empId: -1 }).exec();
//       this.empId = lastEmployee ? lastEmployee.empId + 1 : 1;
//     } catch (error) {
//       next(error);
//     }
//   }

//   if (this.isModified('password')) {
//     this.password = await bcrypt.hash(this.password, 10);
//   }

//   next();
// });

// employeeSchema.methods.comparePassword = async function (candidatePassword) {
//   return bcrypt.compare(candidatePassword, this.password);
// };

// const Employee = mongoose.model('Employee', employeeSchema);

// module.exports = Employee;
