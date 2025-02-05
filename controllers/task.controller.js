const { PrismaClient } = require("@prisma/client");

const res = require("express/lib/response");
const prisma = new PrismaClient();

// Create Task Status
const createTaskStatus = async (req, res) => {
  const { name, description } = req.body;
  try {
    const task = await prisma.taskStatus.create({
      data: {
        name: name,
        description: description,
      },
    });

    res.status(201).send(task);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

// get all task status
const getAllTaskStatus = async (req, res) => {
  try {
    const statuses = await prisma.taskStatus.findMany();
    res.status(200).send(statuses);
  } catch (error) {
    // console.log(error);

    res.status(500).send({ error: error.message });
  }
};

// Delete task status
const deleteTaskStatus = async (req, res) => {
  const { taskId } = req.params;
  try {
    await prisma.taskStatus.delete({
      where: { id: Number(taskId) },
    });
    res
      .status(200)
      .send({ message: "Task status has been deleted successfully." });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};
// create task log
const createTaskLog = async (taskId, statusId, comment) => {
  try {
    const log = await prisma.taskLog.create({
      data: {
        taskId,
        statusId,
        comment,
      },
    });
    return log;
  } catch (error) {
    console.error(`Error creating task log: ${err.message}`);
    throw new Error("Failed to create task log");
  }
};

// create task
const createTask = async (
  clientId,
  title,
  postTypeId = null,
  calendarEntryIds = [],
  scheduleDate,
  statusId,
  designerId = null,
  workDate = null,
  postLinks = [],
  postFromHome = false
) => {
  try {
    // Ensure required parameters are valid
    if (!clientId || !title || !scheduleDate || !statusId) {
      console.log({
        clientId,
        title,
        // postTypeId,
        // calendarEntryId,
        scheduleDate,
        statusId,
      });
      throw new Error("Missing required parameters.");
    }

    let taskData = {
      client: { connect: { id: clientId } },
      title,
      scheduleDate,
      status: { connect: { id: statusId } },
      designerId,
      workDate,
      postFromHome,
    };

    if (postTypeId) {
      taskData.postType = { connect: { id: postTypeId } };
    }

    if (calendarEntryIds.length > 0) {
      taskData.calendarEntries = {
        connect: calendarEntryIds.map((id) => ({ id })),
      };
    }
    // console.log("taskData", taskData);

    // {
    //     client: { connect: { id: clientId } },
    //     title,
    //     postType: { connect: { id: postTypeId } },
    //     calendarEntry: { connect: { id: calendarEntryId } },
    //     scheduleDate,
    //     status: { connect: { id: statusId } },
    //     designerId,
    //     workDate,
    // }
    const task = await prisma.task.create({
      data: taskData,
    });
    // Add multiple post links
    if (postLinks.length > 0) {
      await Promise.all(
        postLinks.map((url) =>
          prisma.taskPostLink.create({
            data: {
              task: {
                connect: {
                  id: task.id,
                },
              },
            },
          })
        )
      );
    }
    let comment = "Extra task created";
    if (postTypeId && calendarEntryIds.length > 0) {
      comment = "Schedule Task created";
    }
    if (task) {
      await createTaskLog(task.id, statusId, comment);
    }
    return task;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const updateTask = async (data) => {
  try {
    const { id, title, workDate, designerId } = data;
    const task = await prisma.task.update({
      where: {
        id: Number(id),
      },
      data: {
        title,
        workDate: new Date(workDate),
        designerId,
      },
    });

    // await updateTaskStatus(id, 3, "Task Added In Queue")
    return task;
  } catch (err) {
    console.log(err);

    return null;
  }
};

// delete task by id
const deleteTask = async (taskId) => {
  await prisma.taskContent.deleteMany({ where: { taskId } });
  await prisma.taskPostLink.deleteMany({ where: { taskId } });
  await prisma.taskLog.deleteMany({ where: { taskId } });
  await prisma.taskMessage.deleteMany({ where: { taskId } });

  // Remove from many-to-many relation
  await prisma.calendarEntry.updateMany({
    where: { taskId },
    data: { taskId: null },
  });

  // Now delete the task
  const deletedTask = await prisma.task.delete({
    where: { id: taskId },
  });

  if (deletedTask) {
    return true;
  } else {
    return false;
  }
};

// Update task work date
const updateTaskWorkDate = async (taskId, workDate) => {
  try {
    const task = await prisma.task.update({
      where: { id: Number(taskId) },
      data: {
        workDate,
      },
    });
    return task;
  } catch (err) {
    return null;
  }
};

// Update Task Designer
const updateTaskDesigner = async (taskId, designerId) => {
  try {
    const task = await prisma.task.update({
      where: { id: Number(taskId) },
      data: {
        designerId,
      },
    });
    return task;
  } catch (err) {
    return null;
  }
};

// update task status
const updateTaskStatus = async (taskId, statusId, comment) => {
  try {
    const task = await prisma.task.update({
      where: { id: Number(taskId) },
      data: {
        statusId,
      },
    });
    if (task) {
      await createTaskLog(taskId, statusId, comment);
    }
    return true;
  } catch (error) {
    return null;
  }
};

// get task by id
const getTaskById = async (taskId) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: Number(taskId) },
      include: {
        postType: true,
        status: true,
        logs: true,
        messages: true,
        calendarEntries: {
          include: {
            weeklyCalendar: true,
            socialMediaPlatform: true,
            postType: true,
          },
        },
        contents: true,
        client: {
          include: {
            smes: true,
          },
        },
      },
    });
    return task;
  } catch (error) {
    // console.log(error);

    return null;
  }
};

// get task by work date

// get tasks by schedule date of client by client id
const getTasksByClientAndDate = async (clientId, scheduleDate) => {
  try {
    if (!clientId || !scheduleDate) {
      return { error: "clientId and scheduleDate are required" };
    }

    let tasks = await prisma.task.findMany({
      where: {
        clientId: parseInt(clientId),
        scheduleDate: new Date(scheduleDate),
      },
      include: {
        postType: true, // Include relational PostType
        status: true, // Include relational Status
        logs: true, // Include task logs
        messages: true, // Include task messages
        calendarEntries: true, // Include calendar entry
        client: true, // Include client
        postLinks: true,
        contents: true,
      },
    });
    return { message: "Task found successfully", tasks };
  } catch (err) {
    return null;
  }
};

// const

// get tasks of today by sme id
const getTaskOfTodayBySmeId = async (req, res) => {
  const { smeId } = req.query;
  const today = new Date();
  try {
    let clients = null;
    if (smeId) {
      // First, find all clients associated with the smeId
      clients = await prisma.client.findMany({
        where: {
          smes: {
            some: { smeId: smeId }, // Checking if any SME is linked to the client by smeId
          },
        },
        select: {
          id: true, // Only get the client ID
        },
      });
    } else {
      clients = await prisma.client.findMany({
        select: {
          id: true,
        },
      });
    }

    if (clients.length === 0) {
      return res.status(404).send({ error: "No clients found for this SME." });
    }

    // Extract client IDs
    const clientIds = clients.map((client) => client.id);

    // Now query the tasks for today for those clients
    const tasks = await prisma.task.findMany({
      where: {
        scheduleDate: {
          gte: new Date(today.setHours(0, 0, 0, 0)), // From 00:00
          lt: new Date(today.setHours(23, 59, 59, 999)), // Until 23:59
        },
        clientId: {
          in: clientIds, // Filter tasks by the client IDs associated with the SME
        },
      },
      include: {
        postType: true,
        status: true,
        logs: true,
        messages: true,
        calendarEntries: true,
        client: true,
        postLinks: true,
        contents: true,
      },
    });

    res.status(200).send({ tasks });
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
};

// get tasks by user id and user type

const getTasks = async ({ userType, userId, date = null }) => {
  if (date == null) date = new Date();

  try {
    let where = {
      workDate: {
        gte: new Date(date.setHours(0, 0, 0, 0)), // From 00:00
        lt: new Date(date.setHours(23, 59, 59, 999)), // Until 23:59
      },
    };

    if (userType.toLowerCase() == "sme") {
      let clients = await prisma.client.findMany({
        where: {
          smes: {
            some: { smeId: userId }, // Checking if any SME is linked to the client by smeId
          },
        },
        select: {
          id: true, // Only get the client ID
        },
      });
      if (clients.length === 0) {
        return null;
      }
      const clientIds = clients.map((client) => client.id);
      where.clientId = {
        in: clientIds,
      };
    } else if (
      userType.toLowerCase() == "ve" ||
      userType.toLowerCase() == "gd"
    ) {
      where.designerId = userId;
    } else if (
      userType.toLowerCase() == "super admin" ||
      userType.toLowerCase() == "admin"
    ) {
      // admin can get all
    }

    const tasks = await prisma.task.findMany({
      where: where,
      include: {
        postType: true,
        status: true,
        logs: true,
        messages: true,
        calendarEntries: {
          // Updated to handle multiple calendar entries
          include: {
            postType: true,
            socialMediaPlatform: true,
          },
        },
        contents: true,
        client: {
          include: {
            smes: true,
          },
        },
        postLinks: true,
      },
    });

    return tasks;
  } catch (err) {
    console.log(err);

    return null;
  }
};

const getTasksByIdList = async ({ idList }) => {
  // console.log(idList);

  try {
    let tasks = [];
    tasks = await prisma.task.findMany({
      where: {
        id: {
          in: idList.map(Number),
        },
      },
      include: {
        postType: true,
        status: true,
        logs: true,
        messages: true,

        calendarEntries: {
          include: {
            postType: true,
            socialMediaPlatform: true,
          },
        },
        postLinks: true,
        contents: true,
        client: {
          include: {
            smes: true,
          },
        },
      },
    });

    // Create a map for quick access by id
    const tasksMap = new Map(tasks.map((task) => [String(task.id), task]));

    // Reorder tasks to match the order of idList
    const orderedTasks = idList.map((id) => tasksMap.get(String(id)));

    return orderedTasks;
  } catch (error) {
    console.log("inner error", error);
    return null;
  }
};

const saveMessage = async ({ task, message, fromId }) => {
  try {
    const _task = await getTaskById(task.id);
    if (_task) {
      // if task available then save message for task
      const taskMessage = await prisma.taskMessage.create({
        data: {
          taskId: parseInt(task.id),
          message,
          fromId,
        },
      });
      if (taskMessage) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
};

const getAllTasksOfClientByDateRange = async (req, res) => {
  try {
    const { clientId, startDate, endDate } = req.query;
    // Validate input
    if (!clientId || !startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "clientId, startDate, and endDate are required" });
    }

    // Query tasks for the client within the date range
    const tasks = await prisma.task.findMany({
      where: {
        clientId: parseInt(clientId),
        scheduleDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        client: true,
        status: true,
        postType: true,
        calendarEntries: {
          include: {
            weeklyCalendar: true,
            socialMediaPlatform: true,
            postType: true,
          },
        },
        contents: true,
        postLinks: true,
      },
    });

    return res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getTasksByDateOrRange = async (req, res) => {
  console.log(req.query);

  try {
    const { from, to, dateType, clientId } = req.query;
    let queryType = "date";
    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;
    if (from && to) {
      queryType = "date-range";
    }

    let where = {};
    if (queryType === "date-range") {
      where[dateType] = {
        gte: fromDate,
        lte: toDate,
      };
    } else {
      where[dateType] = {
        gte: new Date(fromDate.setHours(0, 0, 0, 0)),
        lte: new Date(fromDate.setHours(23, 59, 59, 999)),
      };
    }
    if (clientId) {
      where.clientId = parseInt(clientId);
    }

    const tasks = await prisma.task.findMany({
      where: where,
      include: {
        client: true,
        status: true,
        postType: true,
        calendarEntries: {
          include: {
            weeklyCalendar: true,
            socialMediaPlatform: true,
            postType: true,
          },
        },
        contents: true,
        postLinks: true,
      },
    });
    // console.log(where);

    res.status(200).json(tasks);
  } catch (error) {
    console.log(error);

    res.status(500).json({ error: error });
  }
};

module.exports = {
  createTaskStatus,
  deleteTaskStatus,
  createTaskLog,
  createTask,
  updateTaskDesigner,
  updateTaskStatus,
  updateTaskWorkDate,
  getAllTaskStatus,
  getTaskById,
  getTasksByClientAndDate,
  updateTask,
  getTaskOfTodayBySmeId,
  getTasks,
  getTasksByIdList,
  saveMessage,
  getAllTasksOfClientByDateRange,
  getTasksByDateOrRange,
  deleteTask,
};
