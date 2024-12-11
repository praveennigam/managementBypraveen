const express = require('express');
const router = express.Router();
const helpDeskController = require('../controllers/helpDeskController');

// Create a new help desk ticket
router.post('/myticket', helpDeskController.createTicket);

//get hr name 
router.get('/hr/employees', helpDeskController.getAllHREmployees);

// Get all help desk tickets
router.get('/', helpDeskController.getAllTickets);

router.get('/tickets/:employeeName', helpDeskController.getTicketsByEmployeeName);
// Get help desk ticket by ID
router.get('/:id', helpDeskController.getTicketById);

// Update ticket status (open/closed/in-progress)
router.put('/:ticketId/status', helpDeskController.updateTicketStatus);

// Assign an employee to resolve the ticket
router.put('/:ticketId/assign', helpDeskController.assignEmployeeToTicket);

// Get tickets by employee ID
router.get('/employee/:employeeId', helpDeskController.getTicketsByEmployee);

// Get tickets by status
router.get('/status/:status', helpDeskController.getTicketsByStatus);

// Get tickets by priority
router.get('/priority/:priority', helpDeskController.getTicketsByPriority);

// Get tickets by resolved employee ID
router.get('/resolvedBy/:employeeId', helpDeskController.getTicketsByResolvedEmployee);

// Update the description of a ticket
router.put('/:ticketId/description', helpDeskController.updateTicketDescription);

// Delete a ticket by ticketId
router.delete('/:ticketId', helpDeskController.deleteTicket);

// Define the GET route for retrieving notes of a ticket
router.get('/:ticketId/notes', helpDeskController.getNotesByTicketId);

// Define the POST route for adding a note to a ticket
router.post('/:ticketId/note', helpDeskController.addNoteToTicket);

router.get('/tickets/employee/:employeeId', helpDeskController.getTicketsByEmployee);
module.exports = router;
