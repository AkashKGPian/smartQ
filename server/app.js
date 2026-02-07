const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

const patientAuthRoutes = require('./routes/patient.auth.routes');
const staffAuthRoutes = require('./routes/staff.auth.routes');
const storeRoutes = require('./routes/store.routes');
const queueRoutes = require('./routes/queue.routes');
const tokenRoutes = require('./routes/token.routes');
const staffRoutes = require('./routes/staff.routes');

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

app.use('/api/store', storeRoutes);
app.use('/store', storeRoutes); // for QR / browser access

app.use('/api/queue', queueRoutes);
app.use('/api/token', tokenRoutes);

app.use('/api/staff', staffRoutes);

module.exports = app;