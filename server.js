const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const employeeRoutes = require('./routes/employee');
const helpDeskRoutes = require('./routes/helpDesk');
const holidayRoutes = require('./routes/holidays');
const salaryRoutes = require('./routes/salary');
const timeEntryRoutes = require('./routes/timeEntry');
const leaveRoutes = require('./routes/leave');
const path = require('path');
const socketIo = require('socket.io');
const http = require('http');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app); // Use the http server with app

// Attach Socket.IO to the HTTP server
const io = socketIo(server);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'empdata'));

// Routes for rendering views
app.get('/signup', (req, res) => {
  res.render('signup');
});
app.get('/login', (req, res) => {
  res.render('login');
});
app.get('/', (req, res) => {
  res.render('dashboard');
});

app.get('/dashboard', (req, res) => {
  res.render('dashboard');
});
app.get('/create-employee', (req, res) => {
  res.render('create-employee');
});
app.get('/all-employees', (req, res) => {
  res.render('all-employees');
});
app.get('/employee-details/:id', (req, res) => {
  res.render('employee-details', { employeeId: req.params.id });
});
app.get('/update-employee/:id', (req, res) => {
  res.render('update-employee', { employeeId: req.params.id });
});
app.get('/delete-employee/:id', (req, res) => {
  res.render('delete-employee', { employeeId: req.params.id });
});
app.get('/assign-manager/:id', (req, res) => {
  res.render('assign-manager', { employeeId: req.params.id });
});
app.get('/manage-juniors', (req, res) => {
  res.render('manage-juniors');
});
app.get('/my-profile', (req, res) => {
  res.render('my-profile');
});
app.get('/update-profile', (req, res) => {
  res.render('update-profile');
});

// Helpdesk-related routes
app.get('/helpdesk', (req, res) => {
  res.render('helpdesk');
});
app.get('/helpdesk/view-tickets-status', (req, res) => {
  res.render('view-tickets-status'); 
})

app.get('/helpdesk/status/:status', (req, res) => {
  const { status } = req.params;
  res.render('view-tickets-status', { status });
});
app.get('/helpdesk/view-tickets', (req, res) => {
  res.render('view-all-tickets');
});
app.get('/helpdesk/create-ticket', (req, res) => {
  res.render('create-ticket');
});
app.get('/helpdesk/assign-employee', (req, res) => {
  res.render('assign-employee');
});
app.get('/helpdesk/ticket-details/:ticketId', (req, res) => {
  const { ticketId } = req.params;
  res.render('ticket-details', { ticketId });
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use((req, res, next) => {
  req.io = io; 
  next();
});
// Connect to database
connectDB();

// API routes
app.use('/api/emp', employeeRoutes);
app.use('/api/helpdesk', helpDeskRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/salaries', salaryRoutes);
app.use('/api/timeEntries', timeEntryRoutes);
app.use('/api/leaves', leaveRoutes);

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('New client connected');

  // Listen for ticket updates
  socket.on('ticketUpdate', (ticketData) => {
    io.emit('ticketUpdate', ticketData);  // Emit to all connected clients
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to the Employee Management API');
});

// Start server with Socket.IO support
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});







































// const express = require('express');
// const dotenv = require('dotenv');
// const connectDB = require('./config/db');
// const employeeRoutes = require('./routes/employee');
// const helpDeskRoutes = require('./routes/helpDesk');
// const holidayRoutes = require('./routes/holidays');
// const salaryRoutes = require('./routes/salary');
// const timeEntryRoutes = require('./routes/timeEntry');
// const leaveRoutes = require('./routes/leave');
// const path = require('path');
// const socketIo = require('socket.io');
// const http = require('http');



// dotenv.config();

// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server);

// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'empdata'));


// app.get('/signup', (req, res) => {
//   res.render('signup');
// });

// app.get('/login', (req, res) => {
//   res.render('login');
// });

// app.get('/dashboard', (req, res) => {
//   res.render('dashboard');
// });

// app.get('/create-employee', (req, res) => {
//   res.render('create-employee');
// });

// app.get('/all-employees', (req, res) => {
//   res.render('all-employees');
// });

// app.get('/employee-details/:id', (req, res) => {
//   res.render('employee-details', { employeeId: req.params.id });
// });

// app.get('/update-employee/:id', (req, res) => {
//   res.render('update-employee', { employeeId: req.params.id });
// });

// app.get('/delete-employee/:id', (req, res) => {
//   res.render('delete-employee', { employeeId: req.params.id });
// });

// app.get('/assign-manager/:id', (req, res) => {
//   res.render('assign-manager', { employeeId: req.params.id });
// });

// app.get('/manage-juniors', (req, res) => {
//   res.render('manage-juniors');
// });

// app.get('/my-profile', (req, res) => {
//   res.render('my-profile');
// });

// app.get('/update-profile', (req, res) => {
//   res.render('update-profile');
// });

// app.use(express.static(path.join(__dirname, 'public')));

// app.use(express.json());

// connectDB();

// app.use('/api/emp', employeeRoutes);
// app.use('/api/helpdesk', helpDeskRoutes);
// app.use('/api/holidays', holidayRoutes);
// app.use('/api/salaries', salaryRoutes);
// app.use('/api/timeEntries', timeEntryRoutes);
// app.use('/api/leaves', leaveRoutes);










// io.on('connection', (socket) => {
//   console.log('New client connected');

//   // Listen for ticket updates
//   socket.on('ticketUpdate', (ticketData) => {
//     io.emit('ticketUpdate', ticketData);  // Emit the update to all connected clients
//   });

//   socket.on('disconnect', () => {
//     console.log('Client disconnected');
//   });
// });





// app.get('/', (req, res) => {
//   res.send('Welcome to the Employee Management API');
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });








