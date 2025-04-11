const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const employeeRoutes = require('./routes/employeeRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Log all requests
app.use((req, res, next) => {
    console.log(`App-level: ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/employees', employeeRoutes);

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/employee_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});