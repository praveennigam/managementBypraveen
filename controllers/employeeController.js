const Employee = require('../models/Employee');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Utility function to generate the offer letter PDF
const sendOfferLetter = async (email, offerDetails) => {
  try {
    const offerLetterDir = path.join(__dirname, 'uploads');
    
    // Ensure the 'uploads' directory exists
    if (!fs.existsSync(offerLetterDir)) {
      fs.mkdirSync(offerLetterDir);
    }

    const offerLetterPath = path.join(offerLetterDir, `offer_letter_${offerDetails.name.replace(/\s+/g, '_')}.pdf`);
    await generateOfferLetter(offerDetails, offerLetterPath);

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,

        
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Offer Letter - Congratulations!',
      text: `Dear ${offerDetails.name},\n\nCongratulations on your approval! Please find attached your offer letter.`,
      attachments: [
        {
          filename: path.basename(offerLetterPath),
          path: offerLetterPath,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log('Offer letter sent successfully.');
    fs.unlinkSync(offerLetterPath); // Delete the file after sending the email
  } catch (error) {
    console.error('Error sending offer letter:', error);
  }
};





// Utility function to generate the offer letter PDF
const generateOfferLetter = async (offerDetails, filePath) => {
  const pdfDocument = new PDFDocument();
  pdfDocument.pipe(fs.createWriteStream(filePath));

  // Header
  pdfDocument.fontSize(18).text('OFFER LETTER', { align: 'center', bold: true });
  pdfDocument.moveDown(2);

  // Salutation and Subject
  pdfDocument.fontSize(14).text(`Dear ${offerDetails.name},`, { bold: true });
  pdfDocument.moveDown();

  // Introduction
  pdfDocument.fontSize(12).text(`We are pleased to offer you the position of  ${offerDetails.department} at TheWebSeller Pvt. Ltd.`);
  pdfDocument.moveDown();

  // Employee Details
  pdfDocument.text(`Position: ${offerDetails.role}`);
  pdfDocument.text(`Salary: ${offerDetails.salary ? `${offerDetails.salary.toLocaleString()} LPA` : 'N/A'}`);
  pdfDocument.text(`Date of Joining: ${offerDetails.dateOfJoining ? new Date(offerDetails.dateOfJoining).toLocaleDateString() : 'N/A'}`);
  pdfDocument.text(`Location: ${offerDetails.workLocation || 'N/A'}`);
  pdfDocument.text(`Probation Period: ${offerDetails.probationPeriodEnd ? new Date(offerDetails.probationPeriodEnd).toLocaleDateString() : 'N/A'}`);
  pdfDocument.moveDown();

  // Contact and Emergency Information
  pdfDocument.text(`Contact: ${offerDetails.contactNumber || 'N/A'}`);
  pdfDocument.text(`Emergency Contact: ${offerDetails.emergencyContact ? `${offerDetails.emergencyContact.name} - ${offerDetails.emergencyContact.phone}` : 'N/A'}`);
  pdfDocument.moveDown();

  // Closing Remarks
  pdfDocument.text('We are excited about the opportunity to have you on board and look forward to your contributions at TheWebSeller Pvt. Ltd.');
  pdfDocument.moveDown();

  // Warm Regards & Signature
  pdfDocument.text('Warm Regards,');
  pdfDocument.moveDown();
  pdfDocument.text('HR Team', { italic: true });
  pdfDocument.text('TheWebSeller Pvt. Ltd.', { italic: true });

  pdfDocument.end();
};













// Utility function to send a signup confirmation email

const sendSignupConfirmationEmail = async (email, name) => {
  try {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Offer Letter from TheWebSeller Pvt. Ltd.',
      text: `Dear ${name},\n\n` +
            `We are pleased to welcome you to TheWebSeller Pvt. Ltd.\n\n` +
            `Your account has been successfully created, and you are now ready to get started.\n\n` +
            `To make the most of your account, we kindly ask you to complete the following steps:\n\n` +
            `1. Log in to your account.\n` +
            `2. Complete your profile in the 'Account Settings' section.\n` +
            `3. Explore the available features and resources.\n\n` +
            `If you need any assistance, please do not hesitate to contact us at support@thewebseller.com.\n\n` +
            `We are excited to have you on board and look forward to working with you.\n\n` +
            `Best regards,\n` +
            `The HR Team\n` +
            `TheWebSeller Pvt. Ltd.\n\n` +
            `Please check your inbox for our newsletter containing the latest updates and offers.`
    };

    await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent successfully.');
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
};


const signup = async (req, res) => {
  try {
    const { name, email, password, role, manager, department, contactNumber, address } = req.body;

    // Check if the email already exists in the database
    const existingUser = await Employee.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Create a new employee record
    const newEmployee = new Employee({
      name,
      email,
      password,
      role: role || 'employee', // Default role to 'employee' if not provided
      manager,
      department,
      contactNumber,
      address
    });

    // Save the new employee to the database
    await newEmployee.save();

    // Generate JWT token using the new employee's id and role
    const token = jwt.sign({ id: newEmployee._id, role: newEmployee.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Prepare employee details for the offer letter
    const employeeDetails = {
      name: newEmployee.name,
      role: newEmployee.role,
      department: newEmployee.department,
      salary: 'N/A',
      dateOfJoining: 'N/A',
      empId: 'N/A',
      contactNumber: newEmployee.contactNumber || 'N/A',
      address: newEmployee.address || 'N/A',
      gender: 'N/A',
      employmentType: 'N/A',
      managerName: 'N/A',
      emergencyContact: 'N/A',
      skills: [],
      certifications: [],
      performanceRating: 'N/A',
      lastPromotionDate: 'N/A',
      workLocation: 'N/A',
      probationPeriodEnd: 'N/A',
    };

    // Send the offer letter and signup confirmation email
    await sendOfferLetter(newEmployee.email, employeeDetails);
    await sendSignupConfirmationEmail(newEmployee.email, newEmployee.name);

    // Respond with the token, userId, and employee details
    res.status(201).json({
      message: 'Employee registered successfully',
      token,  // Send back the JWT token
      userId: newEmployee._id,  // Send back the new employee's id
      employee: { name: newEmployee.name, email: newEmployee.email, role: newEmployee.role }
    });

  } catch (error) {
    // Catch any errors and send a 500 response
    console.error(error);
    res.status(500).json({ message: 'Server error during signup' });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await employee.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: employee._id , role: employee.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      message: 'Login successful',
      token,
      userId: employee._id,
      employee: { name: employee.name, email: employee.email, role: employee.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login' });
  }
};


// Create New Employee
const createEmployee = async (req, res) => {
  const { email, password, role } = req.body;
  const image = req.file ? req.file.path : undefined;

  try {
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Employee already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const name = email.split('@')[0];

    const employee = new Employee({ email, password: hashedPassword, role, name, image });
    await employee.save();
    res.status(201).json({ message: 'Employee created successfully', employee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Employees
const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Employee by ID
const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Employee Details
const updateEmployee = async (req, res) => {
  try {
    const updatedData = req.body;
    if (req.file) updatedData.image = req.file.path;
    const employee = await Employee.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Employee
const deleteEmployee = async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign Manager to Employee
const assignManagerToEmployee = async (req, res) => {
  try {
    const { managerId } = req.body;
    const employee = await Employee.findById(req.params.emp_id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    employee.manager = managerId;
    await employee.save();
    res.status(200).json({ message: 'Manager assigned successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Managed Employees
const getManagedEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ manager: req.params.emp_id });
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get My Details
const getMyDetails = (req, res) => {
  res.status(200).json(req.user);
};

// Approve or Reject Employee
const approveRejectEmployee = async (req, res) => {
  const { status } = req.body;

  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Automatically approve admin roles
    if (employee.role === 'admin') {
      employee.approvalStatus = 'approved';
      await employee.save();
      return res.status(200).json({ message: 'Admin approved automatically.' });
    }

    employee.approvalStatus = status === 'approved' ? 'approved' : 'rejected';
    await employee.save();

    // Send offer letter if approved
    if (status === 'approved' && employee.role !== 'admin') {
      sendOfferLetter(employee.email, employee);
    }

    res.status(200).json({ message: `Employee ${status} successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Update Profile (Password, Email, Image)
const updateProfile = async (req, res) => {
  const { email, password } = req.body;
  const image = req.file ? req.file.path : undefined;

  try {
    const employee = await Employee.findById(req.user._id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      employee.password = hashedPassword;
    }

    if (email) employee.email = email;
    if (image) employee.image = image;

    await employee.save();
    res.status(200).json({ message: 'Profile updated successfully', employee });
  }    catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload Employee Image
const uploadEmployeeImage = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const image = req.file.path; // Path of the uploaded image
    employee.image = image; // Save image path to the employee object
    await employee.save();

    res.status(200).json({
      message: 'Image uploaded successfully',
      image: employee.image
    });
  } catch (error) {
    console.error('Error in uploading image:', error);
    res.status(500).json({ message: 'Failed to upload image', error: error.message });
  }
};


// Get Employee Image
const getEmployeeImage = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (!employee.image) {
      return res.status(404).json({ message: 'No image found for this employee' });
    }

    res.status(200).json({ image: employee.image });
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ message: 'Failed to fetch image', error: error.message });
  }
};


// Update Employee Image
const updateEmployeeImage = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const image = req.file.path; // Path of the new uploaded image
    employee.image = image; // Update image path
    await employee.save();

    res.status(200).json({
      message: 'Image updated successfully',
      image: employee.image
    });
  } catch (error) {
    console.error('Error updating image:', error);
    res.status(500).json({ message: 'Failed to update image', error: error.message });
  }
};



// Delete Employee Image
const deleteEmployeeImage = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (!employee.image) {
      return res.status(404).json({ message: 'No image found for this employee' });
    }

    // Delete the image file from the filesystem
    fs.unlinkSync(employee.image); // Sync delete for simplicity (may need async in a real-world case)

    // Remove the image path from the employee record
    employee.image = null;
    await employee.save();

    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ message: 'Failed to delete image', error: error.message });
  }
};


module.exports = {
  signup,
  login,
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  assignManagerToEmployee,
  getManagedEmployees,
  getMyDetails,
  approveRejectEmployee,
  updateProfile,
  uploadEmployeeImage,
  getEmployeeImage,
  updateEmployeeImage,
  deleteEmployeeImage
};






// const Employee = require('../models/Employee');
// const jwt = require('jsonwebtoken');

// exports.signup = async (req, res) => {
//   const { name, email, password, role, department, contactNumber, address } = req.body;
//   try {
//     const existingEmployee = await Employee.findOne({ email });
//     if (existingEmployee) {
//       return res.status(400).json({ message: 'Employee already exists' });
//     }
//     const newEmployee = new Employee({ name, email, password, role, department, contactNumber, address });
//     await newEmployee.save();
//     res.status(201).json({ message: 'Employee created successfully', employee: newEmployee });
//   } catch (error) {
//     res.status(500).json({ message: 'Error creating employee', error });
//   }
// };




// exports.login = async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const employee = await Employee.findOne({ email });
//     if (!employee) {
//       return res.status(404).json({ message: 'Employee not found' });
//     }

//     const isMatch = await employee.comparePassword(password);
//     if (!isMatch) {
//       return res.status(400).json({ message: 'Invalid credentials' });
//     }

//     const token = jwt.sign({ id: employee._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

//     res.status(200).json({
//       message: 'Login successful',
//       token,
//       employee: { name: employee.name, email: employee.email, role: employee.role, empId: employee.empId }
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error });
//   }
// };

// exports.createEmployee = async (req, res) => {
//   const { name, email, password, role, department, contactNumber, address } = req.body;
//   try {
//     const newEmployee = new Employee({
//       name,
//       email,
//       password,
//       role,
//       department,
//       contactNumber,
//       address,
//       image: req.file ? req.file.path : null
//     });
//     await newEmployee.save();
//     res.status(201).json({ message: 'Employee created successfully', employee: newEmployee });
//   } catch (error) {
//     res.status(500).json({ message: 'Error creating employee', error });
//   }
// };

// exports.getAllEmployees = async (req, res) => {
//   try {
//     const employees = await Employee.find();
//     res.status(200).json(employees);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching employees', error });
//   }
// };

// exports.getEmployeeById = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const employee = await Employee.findById(id).populate('manager', 'name');
//     if (!employee) {
//       return res.status(404).json({ message: 'Employee not found' });
//     }
//     res.status(200).json(employee);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching employee details', error });
//   }
// };

// exports.getMyDetails = async (req, res) => {
//   try {
//     const user = req.user; // The user is set by the authMiddleware
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     res.status(200).json(user); // Send back the user details
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching user details', error });
//   }
// };



// exports.updateEmployee = async (req, res) => {
//   const { id } = req.params;
//   const { name, email, password, role, department, contactNumber, address } = req.body;
//   try {
//     const employee = await Employee.findById(id);
//     if (!employee) {
//       return res.status(404).json({ message: 'Employee not found' });
//     }

//     if (req.user._id.toString() === id) {
//       if (name) employee.name = name;
//       if (email) employee.email = email;
//       if (password) employee.password = password;
//       if (department) employee.department = department;
//       if (contactNumber) employee.contactNumber = contactNumber;
//       if (address) employee.address = address;
//       if (req.file) employee.image = req.file.path;
//     } else if (['admin', 'manager', 'hr'].includes(req.user.role)) {
//       if (name) employee.name = name;
//       if (email) employee.email = email;
//       if (password) employee.password = password;
//       if (department) employee.department = department;
//       if (contactNumber) employee.contactNumber = contactNumber;
//       if (address) employee.address = address;
//       if (req.file) employee.image = req.file.path;
//     } else {
//       return res.status(403).json({ message: 'Unauthorized' });
//     }

//     await employee.save();
//     res.status(200).json({ message: 'Employee updated successfully', employee });
//   } catch (error) {
//     res.status(500).json({ message: 'Error updating employee', error });
//   }
// };

// exports.deleteEmployee = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const employee = await Employee.findById(id);
//     if (!employee) {
//       return res.status(404).json({ message: 'Employee not found' });
//     }

//     if (['admin', 'hr'].includes(req.user.role) || req.user._id.toString() === id) {
//       await employee.remove();
//       res.status(200).json({ message: 'Employee deleted successfully' });
//     } else {
//       return res.status(403).json({ message: 'Unauthorized' });
//     }
//   } catch (error) {
//     res.status(500).json({ message: 'Error deleting employee', error });
//   }
// };

// exports.assignManagerToEmployee = async (req, res) => {
//   const { emp_id } = req.params;
//   const { managerId } = req.body;

//   try {
//     const employee = await Employee.findById(emp_id);
//     const manager = await Employee.findById(managerId);

//     if (!employee || !manager) {
//       return res.status(404).json({ message: 'Employee or Manager not found' });
//     }

//     employee.manager = manager._id;
//     employee.managerName = manager.name;
//     await employee.save();

//     res.status(200).json({ message: 'Manager assigned successfully', employee });
//   } catch (error) {
//     res.status(500).json({ message: 'Error assigning manager', error });
//   }
// };

// exports.getManagedEmployees = async (req, res) => {
//   const { emp_id } = req.params;

//   try {
//     const manager = await Employee.findById(emp_id);

//     if (!manager) {
//       return res.status(404).json({ message: 'Manager not found' });
//     }

//     const employees = await Employee.find({ manager: manager._id });
//     res.status(200).json(employees);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching managed employees', error });
//   }
// };
