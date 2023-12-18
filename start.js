const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3000;

// Connecting to MongoDB
mongoose.connect('mongodb://localhost/ugmc', { useNewUrlParser: true, useUnifiedTopology: true });

// Patient Schema
const patientSchema = new mongoose.Schema({
  surname: String,
  otherNames: String,
  gender: String,
  phoneNumber: String,
  residentialAddress: String,
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String,
  },
});

const Patient = mongoose.model('Patient', patientSchema);

// Encounter Schema
const encounterSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  dateAndTime: { type: Date, default: Date.now },
  encounterType: String,
});

const Encounter = mongoose.model('Encounter', encounterSchema);

// Vitals Schema
const vitalsSchema = new mongoose.Schema({
  encounterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Encounter' },
  bloodPressure: String,
  temperature: Number,
  pulse: Number,
  spO2: Number,
});

const Vitals = mongoose.model('Vitals', vitalsSchema);

// Body Parser Middleware
app.use(express.json());

// Routes

// Register Patients
app.post('/api/patients', async (req, res) => {
  try {
    const patient = new Patient(req.body);
    await patient.save();
    res.json({ patientId: patient._id, message: 'Patient registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering patient' });
  }
});

// Start Encounter
app.post('/api/encounters', async (req, res) => {
  try {
    const encounter = new Encounter(req.body);
    await encounter.save();
    res.json({ encounterId: encounter._id, message: 'Encounter started successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error starting encounter' });
  }
});

// Submit Patient Vitals
app.post('/api/vitals', async (req, res) => {
  try {
    const vitals = new Vitals(req.body);
    await vitals.save();
    res.json({ message: 'Vitals submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting vitals' });
  }
});

// View List of Patients
app.get('/api/patients', async (req, res) => {
  try {
    const patients = await Patient.find({}, 'patientId surname otherNames gender phoneNumber');
    res.json({ patients });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patients' });
  }
});

// View Details of a Patient
app.get('/api/patients/:patientId', async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const patient = await Patient.findById(patientId).populate({
      path: 'encounters',
      populate: { path: 'vitals' },
    });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patient details' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
