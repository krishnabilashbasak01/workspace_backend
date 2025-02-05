const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config/jwt.config');
const User = require('../models/User');
const Attendance = require('../models/Attendance');

const bcrypt = require("bcrypt");

// Login User
exports.appLogin = async (req, res) => {
    try {
        const { userId, date } = req.body;

        // Login
        const newAttendance = new Attendance({
            userId , date, loginTime: Date.now()
        });
        await newAttendance.save();

        res.status(200).json({ success: true, newAttendance });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Log Out User
exports.appLogout = async (req, res) => {
    try{
        const { _id, } = req.body;
        let attendance = await Attendance.findOneAndUpdate({_id: _id}, {
            logoutTime: Date.now(),
        }, {new: true})
        res.status(200).json({ success: true, attendance });
    }catch (error) {
        res.status(500).send({error: error.message});
    }
}

