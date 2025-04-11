const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const User = require('../models/User');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Middleware to log all requests
router.use((req, res, next) => {
    console.log(`Received ${req.method} request for ${req.url}`);
    next();
});

// Registration Route
router.get('/register', (req, res) => {
    console.log('Rendering register page');
    res.render('register', { error: null });
});

router.post('/register', [
    check('username').notEmpty().withMessage('Username is required'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
    console.log('Processing registration:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.render('register', { error: errors.array()[0].msg });
    }

    const { username, password } = req.body;
    const existingUser = await User.findOne({ username: new RegExp(`^${username}$`, 'i') });
    if (existingUser) {
        console.log('Username already exists:', username);
        return res.render('register', { error: 'Username already exists' });
    }

    const user = new User({ username, password });
    try {
        await user.save();
        console.log('User registered successfully:', { username: user.username, password: user.password });
        res.redirect('/employees/login');
    } catch (error) {
        console.error('Registration error:', error);
        res.render('register', { error: 'Registration failed. Please try again.' });
    }
});

// Login Route with Enhanced Debugging
router.get('/login', (req, res) => {
    console.log('Rendering login page');
    res.render('login', { error: null });
});

router.post('/login', async (req, res) => {
    console.log('Received login request with body:', req.body); // Log the incoming request body

    const { username, password } = req.body;
    if (!username || !password) {
        console.log('Missing username or password:', { username, password });
        return res.render('login', { error: 'Please fill out all fields' });
    }

    try {
        console.log('Searching for user:', username);
        const user = await User.findOne({ username: new RegExp(`^${username}$`, 'i') });
        console.log('Found user in DB:', user);

        if (!user) {
            console.log('User not found');
            return res.render('login', { error: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        console.log('Password match result:', isMatch);

        if (!isMatch) {
            console.log('Password does not match');
            return res.render('login', { error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, 'your-secret-key');
        console.log('Generated token:', token);
        res.header('x-auth-token', token).redirect('/employees');
    } catch (error) {
        console.error('Login error:', error);
        res.render('login', { error: 'Login failed. Please try again.' });
    }
});

// Dashboard (publicly accessible)
router.get('/', async (req, res) => {
    console.log('Rendering dashboard');
    try {
        const employees = await Employee.find();
        res.render('dashboard', { employees });
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.render('dashboard', { employees: [], error: 'Failed to load employees' });
    }
});

// Create Employee
router.get('/new', (req, res) => {
    console.log('Rendering new employee form');
    res.render('employee-form', { employee: null, errors: null });
});

router.post('/', [
    check('email').isEmail().withMessage('Invalid email'),
    check('phone').isMobilePhone().withMessage('Invalid phone number'),
    check('firstName').notEmpty().withMessage('First name is required'),
    check('lastName').notEmpty().withMessage('Last name is required'),
    check('position').notEmpty().withMessage('Position is required')
], async (req, res) => {
    console.log('Processing new employee:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.render('employee-form', { employee: req.body, errors: errors.array() });
    }

    const employee = new Employee(req.body);
    try {
        await employee.save();
        res.redirect('/employees');
    } catch (error) {
        console.error('Error creating employee:', error);
        res.render('employee-form', { employee: req.body, errors: [{ msg: 'Failed to save employee' }] });
    }
});

// Update Employee
router.get('/edit/:id', async (req, res) => {
    console.log('Rendering edit form for ID:', req.params.id);
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) return res.redirect('/employees');
        res.render('employee-form', { employee, errors: null });
    } catch (error) {
        console.error('Error fetching employee:', error);
        res.redirect('/employees');
    }
});

router.post('/update/:id', [
    check('email').isEmail(),
    check('phone').isMobilePhone()
], async (req, res) => {
    console.log('Processing update for ID:', req.params.id, 'with data:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const employee = await Employee.findById(req.params.id);
        return res.render('employee-form', { employee, errors: errors.array() });
    }

    try {
        await Employee.findByIdAndUpdate(req.params.id, req.body);
        res.redirect('/employees');
    } catch (error) {
        console.error('Error updating employee:', error);
        res.render('employee-form', { employee: req.body, errors: [{ msg: 'Failed to update employee' }] });
    }
});

// Delete Employee
router.get('/delete/:id', async (req, res) => {
    console.log('Processing delete for ID:', req.params.id);
    try {
        await Employee.findByIdAndDelete(req.params.id);
        res.redirect('/employees');
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.redirect('/employees');
    }
});

module.exports = router;