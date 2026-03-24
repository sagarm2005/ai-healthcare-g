
const express = require('express');
const {
    registerAdmin,
    registerDoctor,
    registerPatient,
    loginAdmin,
    loginDoctor,
    loginPatient
} = require('../controllers/auth');

const router = express.Router();

router.post('/register/admin', registerAdmin);
router.post('/register/doctor', registerDoctor);
router.post('/register/patient', registerPatient);
router.post('/login/admin', loginAdmin);
router.post('/login/doctor', loginDoctor);
router.post('/login/patient', loginPatient);

module.exports = router;
