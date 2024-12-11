const mongoose = require('mongoose');
const Employee = require('./Employee');

const helpDeskSchema = new mongoose.Schema({
  employeeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee', 
    required: true 
  },
  ticketId: { 
    type: String, 
    unique: true, 
    required: true 
  },
  issue: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  status: { 
    type: String, 
    enum: ['open', 'closed', 'in-progress'], 
    default: 'open' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'], 
    default: 'medium' 
  },
  
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  resolvedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee' 
  },
  assignedToHR: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee', // Reference to the Employee model
    required: false,
  },
  statusHistory: [
    {
      status: { type: String, enum: ['open', 'closed', 'in-progress'] },
      updatedAt: { type: Date, default: Date.now },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }
    }
  ],

  isUrgent: { 
    type: Boolean, 
    default: false 
  },

  // Notes field added here
  notes: [
    {
      note: {
        type: String,
        required: true, // The note content is required
      },
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee', // Reference to Employee model to link note to employee
        required: true,
      },
      createdByName: {
        type: String,
        required: true, // Name of the employee who created the note
      },
      createdAt: {
        type: Date,
        default: Date.now, // Automatically set the creation timestamp to the current time
      },
    }
  ]
});

helpDeskSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.updatedAt = Date.now();
  }
  next();
});

const HelpDesk = mongoose.model('HelpDesk', helpDeskSchema);

module.exports = HelpDesk;
