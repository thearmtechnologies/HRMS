const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const session = require('express-session');
dotenv.config();
const authRoutes = require('./routes/authRoutes');
const salaryRoutes = require('./routes/salaryRoutes');
const manualAttRoutes = require('./routes/manualAttRoutes');
const noteRoutes = require('./routes/noteRoutes')
const siteRoutes = require('./routes/siteRoutes')
const departmentRoutes = require('./routes/departmentRoutes')
const employeeRoutes = require('./routes/employeeRoutes')

const cors = require('cors');
const path = require('path');
const { startBirthdayReminder } = require('./cron/birthdayReminder');

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    startBirthdayReminder();
  })
  .catch((error) => console.log(error));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/pay', salaryRoutes);
app.use('/api/manual-att', manualAttRoutes);
app.use('/api/notes', noteRoutes)
app.use('/api', siteRoutes)
app.use('/api', departmentRoutes)
app.use('/api', employeeRoutes)


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

