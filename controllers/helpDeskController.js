const HelpDesk = require('../models/HelpDesk');
const Employee = require('../models/Employee');

// Create a new help desk ticket
exports.createTicket = async (req, res) => {
  try {
    const { employeeId, issue, description, priority } = req.body;

    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    const ticketId = 'TD-' + new Date().getTime(); // Generate a unique ticket ID
    const newTicket = new HelpDesk({ employeeId, ticketId, issue, description, priority });

    await newTicket.save();
    res.status(201).json(newTicket);
  } catch (error) {
    console.error(error);  // Log the error for debugging
    res.status(500).json({ message: error.message });
  }
};

// Get all help desk tickets
exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await HelpDesk.find()
      .populate('assignedToHR', 'name')  // Populate assignedToHR with the name
      .populate('employeeId', 'name');   // Populate employeeId with the name (make sure to use 'employeeId' not 'employee')

    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Get help desk ticket by ID
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await HelpDesk.findById(req.params.id)
      .populate('assignedToHR', 'name')  // Populate assignedToHR with the name
      .populate('employee', 'name');    // Populate employee with the name (or use the correct field based on your schema)
    
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update ticket status (open/closed/in-progress)
exports.updateTicketStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    const validStatuses = ['open', 'closed', 'in-progress'];
    if (!validStatuses.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const ticket = await HelpDesk.findOneAndUpdate({ ticketId }, { status, updatedAt: Date.now() }, { new: true });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign an HR to a ticket
exports.assignEmployeeToTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { userId } = req.body;  // The HR ID to be assigned to the ticket

    const ticket = await HelpDesk.findOneAndUpdate(
      { ticketId },
      { assignedToHR: userId, updatedAt: Date.now() },
      { new: true }
    ).populate('assignedToHR', 'name');  // Populate HR name after assignment

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Emit the ticket update event to all connected clients via Socket.IO
    if (req.io) {
      req.io.emit('ticketUpdate', { ticketId, assignedToHR: userId });
    }

    res.status(200).json(ticket);
  } catch (error) {
    console.error('Error assigning HR:', error);
    res.status(500).json({ message: error.message });
  }
};















// Controller: getNotesByTicketId
exports.getNotesByTicketId = async (req, res) => {
  const { ticketId } = req.params;

  try {
    const ticket = await HelpDesk.findOne({ ticketId })
      .populate('notes.createdBy', 'name');  
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const notesWithPostedBy = ticket.notes.map(note => {
      note.postedBy = note.createdBy ? note.createdBy.name : 'Unknown'; // Ensure that 'createdBy' exists
      return note;
    });

    res.status(200).json(notesWithPostedBy);
  } catch (error) {
    console.error('Error fetching ticket notes:', error);  // Log the error for debugging
    res.status(500).json({ message: 'Internal server error' });
  }
};




// Controller: addNoteToTicket
exports.addNoteToTicket = async (req, res) => {
  const { ticketId } = req.params;
  const { note, userId } = req.body;
  const employeeId = userId;

  if (!employeeId) {
    return res.status(400).json({ message: 'Employee ID is required' });
  }

  try {
    const ticket = await HelpDesk.findOne({ ticketId: ticketId });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    ticket.notes.push({
      note,
      createdBy: employeeId,
      createdByName: employee.name,
      createdAt: new Date(),
    });

    await ticket.save();

    res.status(200).json(ticket.notes);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};









// Controller: getTicketsByEmployee
exports.getTicketsByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params; // Extract the employee ID from the URL parameters

    // Fetch all tickets where the employeeId matches
    const tickets = await HelpDesk.find({ employeeId: employeeId })
      .populate('employeeId', 'name') // Optional: populate employee name
      .populate('assignedToHR', 'name'); // Optional: populate assigned HR name if needed

    // Check if any tickets were found
    if (!tickets || tickets.length === 0) {
      return res.status(404).json({ message: 'No tickets found for this employee.' });
    }

    // Return the tickets for the employee
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error fetching tickets for employee:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};












// Controller to get all tickets by employee name with pagination and optional HR filter
exports.getTicketsByEmployeeName = async (req, res) => {
  const { employeeName } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const hrId = req.query.hr || '';  // HR ID filter (optional)

  try {
    // Find employee by name with a case-insensitive search
    const employee = await Employee.findOne({
      name: { $regex: new RegExp(employeeName, 'i') }
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Prepare query to find tickets for the employee
    let query = {
      $or: [
        { employeeId: employee._id },           // Tickets created by the employee
        { assignedToHR: employee._id },         // Tickets assigned to the employee in HR
        { resolvedBy: employee._id },           // Tickets resolved by the employee
      ]
    };

    // If HR filter is provided, add it to the query
    if (hrId) {
      query['assignedToHR'] = hrId;
    }

    // Fetch tickets related to the employee
    const tickets = await HelpDesk.find(query)
      .populate('employeeId', 'name')
      .populate('assignedToHR', 'name')
      .populate('resolvedBy', 'name')
      .populate('statusHistory.updatedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    if (tickets.length === 0) {
      return res.status(404).json({ message: 'No tickets found for this employee' });
    }

    // Calculate total number of tickets for the employee (for pagination)
    const totalTickets = await HelpDesk.countDocuments(query);

    res.status(200).json({
      tickets,
      totalTickets,
      totalPages: Math.ceil(totalTickets / limit),
      currentPage: page
    });

  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};







// Get tickets by status (open/closed/in-progress)
exports.getTicketsByStatus = async (req, res) => {
  try {
    const tickets = await HelpDesk.find({ status: req.params.status });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// for get hr name 
exports.getAllHREmployees = async (req, res) => {
  try {
    // Fetch all employees with the role 'HR'
    const hrEmployees = await Employee.find({ role: 'hr' });  
    res.status(200).json(hrEmployees);
  } catch (error) {
    console.error('Error fetching HR employees:', error); 
    res.status(500).json({ message: error.message });
  }
};

// Get tickets by priority (low/medium/high)
exports.getTicketsByPriority = async (req, res) => {
  try {
    const tickets = await HelpDesk.find({ priority: req.params.priority });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get tickets by resolved employee ID
exports.getTicketsByResolvedEmployee = async (req, res) => {
  try {
    const tickets = await HelpDesk.find({ resolvedBy: req.params.employeeId });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update the description of a ticket
// Add a comment (or update description)
exports.updateTicketDescription = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { description } = req.body;

    // Assuming description field holds the comment for simplicity
    const ticket = await HelpDesk.findOneAndUpdate(
      { ticketId },
      { 
        $push: { 
          notes: {
            note: description,
            createdBy: req.body.employeeId,  // Assuming employeeId is sent along with the comment
            createdAt: Date.now()
          }
        },
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a ticket by ticketId
exports.deleteTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = await HelpDesk.findOneAndDelete({ ticketId });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    res.status(200).json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
