const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

const patientAuthRoutes = require('./routes/patient.auth.routes');
const staffAuthRoutes = require('./routes/staff.auth.routes');

const app = express();

// view engine (for res.render)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// basic middleware
app.use(express.json());//Adds JSON/body parsing
app.use(express.urlencoded({ extended: true }));//Adds URL-encoded parsing
app.use(cookieParser());

// simple request logger for debugging
app.use((req, res, next) => {
	console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
	next();
});

app.use('/api/auth/patient', patientAuthRoutes);
app.use('/api/auth/staff', staffAuthRoutes);

module.exports = app;