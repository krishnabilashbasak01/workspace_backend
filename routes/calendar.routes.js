const express = require('express');
const {createWeeklyCalendar, getCalendar, deleteCalender, updateCalendar, getSMECalender} = require("../controllers/weeklyCalendar.controller");
const {createEntry, getEntries, updateEntry, deleteEntry} = require("../controllers/calendarentry.controller");
const {getDaysOfMonth} = require("../controllers/calendar.controller");
const router = express.Router();

// Weekly Calendar Router
router.post('/weekly-calendar', createWeeklyCalendar);
router.get('/weekly-calendar/:clientId', getCalendar);
router.delete('/weekly-calendar/:id', deleteCalender);
router.put('/weekly-calendar/:id', updateCalendar);

// Calendar Entry Router
router.post('/weekly-calendar-entry', createEntry);
router.get('/weekly-calendar-entry/all', getEntries);
router.put('/weekly-calendar-entry/:id', updateEntry);
router.delete('/weekly-calendar-entry/:id', deleteEntry);

// Calender Days
router.get('/days-of-month', getDaysOfMonth);

// Sme Calender
router.get('/sme-calender', getSMECalender);


// Export routes
module.exports = router;