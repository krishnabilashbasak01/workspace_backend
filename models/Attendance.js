const mongoose = require("mongoose");

// Permission Schema
const attendanceSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    date: {
        type: Date,
        required: true,
    },
    loginTime: {
        type: Date,
    },
    logoutTime: {
        type: Date,
    }
});

// Create Permission Model
const Attendance = mongoose.model("Attendance", attendanceSchema);

// Export Permission model
module.exports = Attendance;
