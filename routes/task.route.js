const express = require('express');
const {createTaskStatus, getAllTaskStatus, getTaskOfTodayBySmeId, getAllTasksOfClientByDateRange, getTasksByDateOrRange} = require("../controllers/task.controller");

const router = express.Router();

router.post('/create-task-status', createTaskStatus);
router.get('/task-status/all', getAllTaskStatus);
router.get('/get-current-task-of-sme', getTaskOfTodayBySmeId);
router.get('/get-tasks-of-client-by-date-range', getAllTasksOfClientByDateRange)
router.get('/get-all-task-by-date-and-range', getTasksByDateOrRange)



module.exports = router;