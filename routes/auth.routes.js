const express = require('express');

const {register, login} = require('../controllers/auth.controller');
const {appLogin, appLogout} = require('../controllers/attendance.controller');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/app-login', appLogin);
router.put('/app-logout', appLogout);



module.exports = router;
