const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

// @route   GET api/employees/employer/:employerId
// @desc    Get all employees for an employer
// @access  Public (in real app, should be protected)
router.get('/employer/:employerId', async (req, res) => {
  try {
    const { employerId } = req.params;
    console.log('Backend: Fetching employees for employerId:', employerId);

    const employees = await Employee.find({ employerId }).sort({ createdAt: -1 });
    console.log('Backend: Found', employees.length, 'employees for employerId:', employerId);

    res.json(employees);
  } catch (err) {
    console.error('Fetching employees error:', err.message);
    res.status(500).json({ msg: 'Fetching employees failed', error: err.message });
  }
});

// @route   GET api/employees/:id
// @desc    Get single employee by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Backend: Fetching employee with ID:', id);

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }

    res.json(employee);
  } catch (err) {
    console.error('Fetching employee error:', err.message);
    res.status(500).json({ msg: 'Fetching employee failed', error: err.message });
  }
});

// @route   POST api/employees
// @desc    Create new employee
// @access  Public (in real app, should be protected)
router.post('/', async (req, res) => {
  try {
    const {
      name,
      email,
      phoneNumber,
      role,
      licenseNumber,
      address,
      salary,
      dateOfJoining,
      status,
      employerId,
      vehicleNumber,
      profileImageUrl,
    } = req.body;

    console.log('Backend: Creating employee:', name);

    // Validate required fields
    if (!name || !email || !phoneNumber || !employerId) {
      return res.status(400).json({ msg: 'Missing required fields: name, email, phoneNumber, employerId' });
    }

    // Create new employee
    const employee = new Employee({
      name,
      email,
      phoneNumber,
      role: role || 'Worker',
      licenseNumber: licenseNumber || '',
      address: address || '',
      salary: salary || 0,
      dateOfJoining: dateOfJoining || Date.now(),
      status: status || 'Active',
      employerId,
      vehicleNumber: vehicleNumber || '',
      profileImageUrl: profileImageUrl || '',
    });

    const savedEmployee = await employee.save();
    console.log('Backend: Employee created successfully with ID:', savedEmployee._id);

    res.json(savedEmployee);
  } catch (err) {
    console.error('Employee creation error:', err.message);
    res.status(500).json({ msg: 'Employee creation failed', error: err.message });
  }
});

// @route   PUT api/employees/:id
// @desc    Update employee
// @access  Public (in real app, should be protected)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Backend: Updating employee with ID:', id);

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }

    // Update fields
    const {
      name,
      email,
      phoneNumber,
      role,
      licenseNumber,
      address,
      salary,
      dateOfJoining,
      status,
      vehicleNumber,
      profileImageUrl,
    } = req.body;

    if (name) employee.name = name;
    if (email) employee.email = email;
    if (phoneNumber) employee.phoneNumber = phoneNumber;
    if (role) employee.role = role;
    if (licenseNumber !== undefined) employee.licenseNumber = licenseNumber;
    if (address !== undefined) employee.address = address;
    if (salary !== undefined) employee.salary = salary;
    if (dateOfJoining) employee.dateOfJoining = dateOfJoining;
    if (status) employee.status = status;
    if (vehicleNumber !== undefined) employee.vehicleNumber = vehicleNumber;
    if (profileImageUrl !== undefined) employee.profileImageUrl = profileImageUrl;

    const updatedEmployee = await employee.save();
    console.log('Backend: Employee updated successfully');

    res.json(updatedEmployee);
  } catch (err) {
    console.error('Updating employee error:', err.message);
    res.status(500).json({ msg: 'Updating employee failed', error: err.message });
  }
});

// @route   DELETE api/employees/:id
// @desc    Delete employee
// @access  Public (in real app, should be protected)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Backend: Deleting employee with ID:', id);

    const employee = await Employee.findByIdAndDelete(id);
    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }

    console.log('Backend: Employee deleted successfully');
    res.json({ msg: 'Employee deleted successfully', employee });
  } catch (err) {
    console.error('Deleting employee error:', err.message);
    res.status(500).json({ msg: 'Deleting employee failed', error: err.message });
  }
});

// @route   GET api/employees/employer/:employerId/stats
// @desc    Get employee statistics for an employer
// @access  Public
router.get('/employer/:employerId/stats', async (req, res) => {
  try {
    const { employerId } = req.params;
    console.log('Backend: Fetching employee stats for employerId:', employerId);

    const employees = await Employee.find({ employerId });

    // Calculate stats
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter((e) => e.status === 'Active').length;
    const inactiveEmployees = employees.filter((e) => e.status === 'Inactive').length;
    const onLeaveEmployees = employees.filter((e) => e.status === 'On Leave').length;

    // By role
    const byRole = {};
    employees.forEach((employee) => {
      if (!byRole[employee.role]) {
        byRole[employee.role] = 0;
      }
      byRole[employee.role]++;
    });

    console.log('Backend: Stats calculated - Total:', totalEmployees);

    res.json({
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      onLeaveEmployees,
      byRole,
    });
  } catch (err) {
    console.error('Fetching employee stats error:', err.message);
    res.status(500).json({ msg: 'Fetching employee stats failed', error: err.message });
  }
});

module.exports = router;

