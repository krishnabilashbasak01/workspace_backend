require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const helmet = require("helmet");
const http = require("http");
const { Server } = require("socket.io");
const Redis = require("ioredis");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Import routes and middleware
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const roleRoutes = require("./routes/role.routes");
const clientRoutes = require("./routes/client.routes");
const socialMediaPlatformsRoutes = require("./routes/socialmediaplatforms.routes");
const calendarRoutes = require("./routes/calendar.routes");
const packageRoutes = require("./routes/package.routes");
const taskRoutes = require("./routes/task.route");

const errorHandler = require("./middlewares/errorHandler");
const { MONGO_URI } = require("./config/db.config");
const { getUserById } = require("./controllers/user.controller");
const {
  createTask,
  getTasksByClientAndDate,
  updateTask,
  getTasks,
  getTasksByIdList,
  getTaskById,
  updateTaskStatus,
  saveMessage,
  deleteTask,
} = require("./controllers/task.controller");
const { resolve } = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan("combined"));
app.use(helmet());

// Connect to MongoDB
mongoose
  .connect(MONGO_URI, {})
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => console.error(err));

// Routes

app.use("/api/", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/social-media-platforms", socialMediaPlatformsRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/package", packageRoutes);
app.use("/api/task", taskRoutes);
// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Server listener
// app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

// Redis// Set up Redis connection (assuming Redis is locally running)
// const redis = new Redis({
//   username: "default",
//   password: "0Hgvu2Ink483EdXtTKgYPlId8DepKlcy", // specify if Redis requires authentication
//   host: "redis-16679.crce179.ap-south-1-1.ec2.redns.redis-cloud.com", // replace with your Redis host if different
//   port: 16679, // default Redis port
//   db: 0, // default database in Redis
// });

// // beta
// const redis = new Redis({
//   username: "default",
//   password: "IMyZFLwpxqCuSfzvi2Ui1FVbAygIFpYz", // specify if Redis requires authentication
//   host: "redis-19288.c270.us-east-1-3.ec2.redns.redis-cloud.com", // replace with your Redis host if different
//   port: 19288, // default Redis port
//   db: 0, // default database in Redis
// });

const redis = new Redis({
  username: process.env.REDIS_USER || "default",
  password: process.env.REDIS_PASSWORD, // specify if Redis requires authentication
  host: process.env.REDIS_HOST, // replace with your Redis host if different
  port: process.env.REDIS_PORT, // default Redis port
  db: 0, // default database in Redis
});

redis.on("connect", () => {
  console.log("Redis connected");
});

redis.on("error", (err) => {
  console.error("Redis error:", err);
});

redis.on("ready", () => {
  console.log("Redis ready");
});

redis.on("reconnecting", () => {
  console.log("Redis reconnecting");
});

// New socket server change
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

io.on("connection", (socket) => {
  // console.log("New user connected", socket.id);

  // Example event handler
  socket.on("message", (data) => {
    // console.log('Received message:', data);
    // Echo the message back to the client
    socket.emit("message", `Server received: ${data}`);
  });

  // Listen for the "user_connected" event
  socket.on("user_connected", async (data) => {
    const { userId } = data;

    try {
      await redis.set(`user:${userId}`, socket.id);
    } catch (err) {
      console.error("Error storing in Redis:", error);
    }

    // Emit 'user_status' to notify all other users of this new connection
    // socket.broadcast.emit('user_status', { userId, status: 'online' });
    const user = await getUserById(userId);

    // socket.broadcast.emit("new_user_connected", user);
    socket.emit("message", `Server received: ${userId}`);

    const keys = await redis.keys("user:*");
    let _users = [];
    for (const key of keys) {
      const id = key.split(":")[1];
      _users.push(id);
    }
    io.emit("online_users", _users);
  });

  socket.on("get_online_users", async (data) => {
    const keys = await redis.keys("user:*");
    let _users = [];
    for (const key of keys) {
      const id = key.split(":")[1];
      _users.push(id);
    }
    io.emit("online_users", _users);
  });

  // Create task
  // 1. check if task is already exist or not
  // 2. if task not exist then create task
  // 3. if task created then get all task of client and send to all to front end
  socket.on("create_task", async (data, callback) => {
    try {
      const {
        clientId,
        title,
        postTypeId,
        calendarEntryIds,
        scheduleDate,
        statusId,
        designerId,
        workDate,
        postLinks,
        postFromHome,
      } = data;
      // console.log("data", data);

      let task = await createTask(
        clientId,
        title,
        postTypeId || null,
        calendarEntryIds || [],
        scheduleDate,
        statusId,
        designerId || null,
        workDate || null,
        postLinks || [],
        postFromHome || false
      );

      // console.log("task", task);

      if (task) {
        const tasks = await getTasksByClientAndDate(clientId, scheduleDate);
        callback({
          status: "success",
          message: "Task Successfully Created",
          tasks: tasks,
        });
      }
    } catch {
      callback({ status: "error", message: "Task Creation Error" });
    }
  });

  // delete task
  socket.on("delete_task", async (taskId, callback) => {
    try {
      let response = await deleteTask(taskId);
      console.log(response, "response");

      if (response) {
        callback({
          status: "success",
          message: "Task deleted successfully",
        });
      } else {
        callback({
          status: "error",
          message: "Have an error to delete task",
        });
      }
    } catch (error) {
      callback({
        status: "error",
        message: "Have an error to delete task",
      });
    }
  });

  // update task
  socket.on("update_task", async (data, callback) => {
    try {
      const task = await updateTask(data);
      if (task) {
        const tasks = await getTasksByClientAndDate(
          task.clientId,
          task.scheduleDate
        );

        callback({
          status: "success",
          message: "Task Successfully Created",
          tasks: tasks,
        });
      } else {
        callback({
          status: "error",
          message: "Have an error to update task",
        });
      }
    } catch (error) {
      console.log(error);

      callback({
        status: "error",
        message: "Have an error to update task",
      });
    }
  });

  // get all tasks sme and admin tasks
  socket.on("get_tasks", async (data) => {
    // const {userType, date = null} = data;
    const tasks = await getTasks(data);

    socket.emit("receive_tasks", tasks);
  });

  // add task to bucket
  socket.on("add_task_to_bucket", async (data, callback) => {
    try {
      // add to total bucket
      let result = await addToTotalBucket(data);
      // add to designer bucket

      if (result) {
        callback({ status: "success", message: "Added to bucket" });
      } else {
        callback({ status: "error", message: "Failed task add to bucket" });
      }
    } catch (error) {
      console.log(error);

      callback({ status: "error", message: "Failed task add to bucket" });
    }
  });

  // add to total bucket
  const addToTotalBucket = async (data) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      let { task } = data;
      // console.log("data", task);
      const key = `bucket:total`;
      const keyDesigner = `bucket:designer:${data.task.designerId}`;
      const taskData = JSON.stringify(task);

      // Fetch all tasks from the sorted set
      const existingTasks = await redis.zrange(key, 0, -1);

      // Check if the task ID already exists
      const isDuplicate = existingTasks.some((existingTask) => {
        const parsedTask = JSON.parse(existingTask);
        return parsedTask.id === task.id;
      });

      if (!isDuplicate) {
        const order = parseInt(existingTasks.length) + 1; // Define task priority/order if needed
        await redis.zadd(key, parseInt(order), taskData);
        await redis.expire(key, 60 * 60 * 12); // Set expiration (12 hours)

        // Add to designer-specific bucket
        await redis.zadd(keyDesigner, parseInt(order), taskData);
        await redis.expire(keyDesigner, 60 * 60 * 12);

        const _res = await updateTaskStatus(task.id, 3, "Task Added in queue");
        getTasksOfDesigner(data.task.designerId);
        getAllBucket();
        return true;
      }

      return true;
    } catch (error) {
      console.log(error);

      return false;
    }
  };

  // after added send tasks to designer list
  const getTasksOfDesigner = async (designerId) => {
    try {
      console.log("getting task ", designerId);

      const socketIdOfDesigner = await redis.get(`user:${designerId}`);
      console.log("socketIdOfDesigner", socketIdOfDesigner);

      const keyDesigner = `bucket:designer:${designerId}`;
      const tasks = await redis.zrange(keyDesigner, 0, -1);

      const tasksIds = [];
      for (const task of tasks) {
        tasksIds.push(JSON.parse(task).id);
      }
      const _tasks = await getTasksByIdList({ idList: tasksIds });
      // console.log('getting task ', _tasks);

      io.to(socketIdOfDesigner).emit("tasks_in_queue", _tasks);
    } catch (error) {
      console.log("error to get designer tasks");
    }
  };

  // get all bucket
  const getAllBucket = async () => {
    // console.log("get all tasks");

    try {
      const key = `bucket:total`;
      const tasksIds = [];
      const tasks = await redis.zrange(key, 0, -1);

      for (const t of tasks) {
        // console.log("task", );
        tasksIds.push(JSON.parse(t).id);
      }
      const _tasks = await getTasksByIdList({ idList: tasksIds });
      socket.emit("tasks_in_queue", _tasks);
    } catch (error) {
      console.log("outer error : ", error);
    }
  };

  socket.on("get_tasks_in_queue", async (data, callback) => {
    try {
      const { role, id, head } = data;
      if (role.toLowerCase() === "sme") {
        if (head) {
          // get all
          getAllBucket();
        }
        await getAllBucket();
      } else if (role.toLowerCase() === "ve" || role.toLowerCase() === "gd") {
        const keyDesigner = `bucket:designer:${id}`;
        const tasks = await redis.zrange(keyDesigner, 0, -1);

        const tasksIds = [];
        for (const task of tasks) {
          tasksIds.push(JSON.parse(task).id);
        }
        const _tasks = await getTasksByIdList({ idList: tasksIds });
        // console.log('designer tasks', _tasks);
        socket.emit("tasks_in_queue", _tasks);
      } else if (
        role.toLowerCase() === "admin" ||
        role.toLowerCase() === "super admin"
      ) {
        // get all
        getAllBucket();
      }
    } catch (error) {
      callback({ status: "error", message: "Get task in queue failed" });
    } finally {
      callback({
        status: "success",
        message: "Task in queue get successfully",
      });
    }
  });

  // task
  // Create Task
  // socket.on("create_task", async (data, callback) => {
  //   try {
  //     const {
  //       clientId,
  //       title,
  //       postTypeId,
  //       calendarEntryIds,
  //       scheduleDate,
  //       statusId,
  //       designerId,
  //       workDate,
  //       postLinks,
  //       postFromHome,
  //     } = data;
  //     // console.log(data);

  //     let task = await createTask(
  //       clientId,
  //       title,
  //       postTypeId || null,
  //       calendarEntryIds || [],
  //       scheduleDate,
  //       statusId,
  //       designerId || null,
  //       workDate || null,
  //       postLinks || [],
  //       postFromHome || false
  //     );
  //     if (task) {
  //       const tasks = await getTasksByClientAndDate(clientId, scheduleDate);
  //       io.emit("task_creation_response", {
  //         message: "New Task Created",
  //         tasks: tasks,
  //       });
  //       callback({ status: "success", message: "Task Successfully Created" });
  //     } else {
  //       socket.emit("task_creation_response", { error: "Task Creation Error" });
  //       callback({ status: "error", message: "Task Creation Error" });
  //     }
  //   } catch {
  //     callback({ status: "error", message: "Task Creation Error" });
  //   }
  // });

  // // Update Task
  // socket.on("update_task", async (data) => {
  //   try {
  //     const task = await updateTask(data);
  //     if (task) {
  //       const tasks = await getTasksByClientAndDate(
  //         task.clientId,
  //         task.scheduleDate
  //       );
  //       console.log("task", task);
  //       let _userData = {};
  //       _userData.userType = user.role.name;
  //       _userData.userId = user._id;
  //       const _tasks = await getTasks(_userData);
  //       socket.emit("receive_tasks", tasks);

  //       io.emit("task_creation_response", {
  //         message: "Task Updated",
  //         tasks: tasks,
  //       });
  //     } else {
  //       socket.emit("task_creation_response", { error: "Task Update Error" });
  //     }
  //   } catch (err) {
  //     console.log(err.message);
  //   }
  // });

  // socket.on("delete_task", async (taskId, callback) => {
  //   try {
  //     await prisma.taskContent.deleteMany({ where: { taskId } });
  //     await prisma.taskPostLink.deleteMany({ where: { taskId } });
  //     await prisma.taskLog.deleteMany({ where: { taskId } });
  //     await prisma.taskMessage.deleteMany({ where: { taskId } });

  //     // Remove from many-to-many relation
  //     await prisma.calendarEntry.updateMany({
  //       where: { taskId },
  //       data: { taskId: null },
  //     });

  //     // Now delete the task
  //     const deletedTask = await prisma.task.delete({
  //       where: { id: taskId },
  //     });

  //     if (deletedTask) {
  //       io.emit("task_deletion_response", {
  //         message: "Task Deleted Successfully",
  //         taskId: taskId,
  //       });
  //       callback({ status: "success", message: "Task Deleted Successfully" });
  //     } else {
  //       callback({ status: "error", message: "Task Not Found" });
  //     }
  //   } catch (error) {
  //     console.error("Error deleting task:", error);
  //     callback({ status: "error", message: "Error Deleting Task" });
  //   }
  // });

  // // socket set task to designer bucket
  // socket.on("set_task_on_bucket", async (data, callback) => {
  //   try {
  //     await addTaskToDesignerBucket(data);
  //     await getDesignerBucket({ designerId: data.task.designerId });
  //     await getSmeBucket({ smeId: data.user.smeId });
  //   } catch (error) {
  //     callback({ status: "error", message: "Failed task add to bucket" });
  //   } finally {
  //     callback({ status: "success", message: "Task Added to bucket" });
  //   }
  // });

  // //   get tasks of user in queue
  // socket.on("get_tasks_in_queue", async (data, callback) => {
  //   try {
  //     const { role, id, head } = data;
  //     if (role.toLowerCase() === "sme") {
  //       if (head) {
  //         // get all
  //         getAllBucket();
  //       }
  //       await getSmeBucket({ smeId: id });
  //     } else if (role.toLowerCase() === "ve" || role.toLowerCase() === "gd") {
  //       await getDesignerBucket({ designerId: id });
  //     } else if (
  //       role.toLowerCase() === "admin" ||
  //       role.toLowerCase() === "super admin"
  //     ) {
  //       // get all
  //       getAllBucket();
  //     }
  //   } catch (error) {
  //     callback({ status: "error", message: "Get task in queue failed" });
  //   } finally {
  //     callback({
  //       status: "success",
  //       message: "Task in queue get successfully",
  //     });
  //   }
  // });

  // Update task status
  socket.on("update_task_status", async (data, callback) => {
    try {
      const { task, status } = data;

      const _status = await prisma.taskStatus.findFirst({
        where: {
          name: status,
        },
      });
      if (_status) {
        const response = await updateTaskStatus(
          task.id,
          _status.id,
          `Task added in ${status}`
        );
        if (response) {
          await getTasksOfDesigner(data.task.designerId);
          let smeIds = [];
          for (const sme of task?.client?.smes) {
            smeIds.push(sme.smeId);
          }
          let tasksIds = [];
          const keyTotal = `bucket:total`;
          const tasks = await redis.zrange(keyTotal, 0, -1);
          for (const t of tasks) {
            tasksIds.push(JSON.parse(t).id);
          }
          const _tasks = await getTasksByIdList({ idList: tasksIds });

          if (smeIds) {
            let socketIds = [];
            for (const _id of smeIds) {
              const socketId = await redis.get(`user:${_id}`);
              if (socketId) {
                socketIds.push(socketId);
                io.to(socketId).emit("tasks_in_queue", _tasks);
              }
            }
            console.log("socketIds", socketIds);
            for (const socketId of socketIds) {
              io.to(socketId).emit("message_updated_task", task);
            }
          }

          callback({
            status: "success",
            message: "Status Updated Successfully",
          });
        } else {
          callback({ status: "error", message: "Status Update Failed" });
        }
      }
    } catch (err) {
      console.log(err);

      callback({ status: "error", message: "Status Update Failed" });
    }
  });

  //   reorder task in queue
  socket.on("on_reorder", async (data, callback) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const { newOrderOfTasks, user, designerId } = data;
      // console.log("user : ", user);
      // console.log("designerId : ", designerId);
      // console.log("new order of task : ", newOrderOfTasks);

      const keyDesigner = `bucket:designer:${designerId}`;
      const keyTotal = `bucket:total`;

      // Step 1: Clear and Reinsert in Designer's Bucket
      await redis.del(keyDesigner); // Clear old data

      for (let i = 0; i < newOrderOfTasks.length; i++) {
        const taskData = JSON.stringify(newOrderOfTasks[i]);
        // await redis.zadd(keyDesigner, i + 1, taskData); // Add task with new priority
      }

      // 1. Fetch the entire total bucket with scores.
      // (Assume tasks are stored as JSON strings.)
      const totalBucketData = await redis.zrange(keyTotal, 0, -1, "WITHSCORES");

      // Extract only those tasks belonging to the designer.
      let designerTasks = [];
      for (let i = 0; i < totalBucketData.length; i += 2) {
        const task = JSON.parse(totalBucketData[i]);
        const score = parseFloat(totalBucketData[i + 1]);
        if (task.designerId === designerId) {
          designerTasks.push({ task, score });
        }
      }

      // Sort the designer tasks by score (their current total bucket order).
      designerTasks.sort((a, b) => a.score - b.score);

      // (Optional) Check that the number of tasks matches the new order.
      if (designerTasks.length !== newOrderOfTasks.length) {
        console.error(
          "Mismatch between designer tasks in total bucket and new order count"
        );
        return callback({
          status: "error",
          message:
            "Mismatch between tasks count in designer bucket and total bucket",
        });
      }

      // 2. Remove the designer tasks from the total bucket.
      const pipeline = redis.pipeline();
      for (const { task } of designerTasks) {
        // Remove by matching the exact stored JSON string.
        pipeline.zrem(keyTotal, JSON.stringify(task));
      }
      await pipeline.exec();

      // 3. Re‑insert the tasks from the new order into the total bucket.
      // Here we “reassign” the same scores that were present before.
      // In this example the i‑th task in the sorted (old) designer tasks array
      // will have its score assigned to the i‑th task in the newOrderOfTasks.
      // (Thus if your new order is such that a different task is now in that i‑th slot,
      // it gets that same score.)
      const newPipeline = redis.pipeline();
      for (let i = 0; i < newOrderOfTasks.length; i++) {
        // Use the score from the i‑th element of the old sorted order.
        const score = designerTasks[i].score;
        const task = newOrderOfTasks[i];

        // Re‑add into total bucket.
        newPipeline.zadd(keyTotal, score, JSON.stringify(task));
        await redis.expire(keyTotal, 60 * 60 * 12);
        // Also update the designer-specific bucket.
        newPipeline.zadd(keyDesigner, score, JSON.stringify(task));
        await redis.expire(keyDesigner, 60 * 60 * 12);
      }
      await newPipeline.exec();

      // send updated list to designer
      getTasksOfDesigner(designerId);

      // send updated list to same client
      getAllBucket();

      // send updated list to smes
      getSMEsBucket();

      callback({ status: "success", message: "Rearranged Successfully" });
    } catch (error) {
      console.log(error);
      callback({ status: "error", message: "Status Update Failed" });
    }
  });

  // remove task from designer bucket
  socket.on("remove_task_from_bucket", async (data, callback) => {
    try {
      const { task, user } = data;

      console.log("task", task);

      // find in bucket
      const key = `bucket:total`;
      const tasks = await redis.zrange(key, 0, -1);

      // Find the key containing this task
      for (const item of tasks) {
        if (JSON.parse(item).id === `${task.id}`) {
          await redis.zrem(key, item);
          break;
        }
      }

      // // Update task status to removed/pending
      await updateTaskStatus(
        task.id,
        2, // Assuming 1 is the status ID for pending/removed
        "Task removed from bucket"
      );

      // Notify relevant users about the change

      callback({ status: "success", data: "Task removed successfully" });

      // remove from bucket

      // update status of task
    } catch (error) {
      callback({ status: "error", data: "Task Removed failed received!" });
    }
  });

  //   get sme bucket , this will send task to sme
  const getSMEsBucket = async () => {
    try {
      let _result = [];

      const keyTotal = `bucket:total`;

      const tasks = await redis.zrange(keyTotal, 0, -1);

      let _sockets = [];

      let tasksIds = [];
      for (const t of tasks) {
        tasksIds.push(JSON.parse(t).id);
      }
      const _tasks = await getTasksByIdList({ idList: tasksIds });

      for (const t of _tasks) {
        for (const sme of t.client.smes) {
          const socketIdOfSME = await redis.get(`user:${sme.smeId}`);
          socketIdOfSME && _sockets.push(socketIdOfSME);
          // console.log(sme.smeId, socketIdOfSME);
        }
      }

      for (const id of _sockets) {
        io.to(id).emit("tasks_in_queue", _tasks);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // message send
  socket.on("send_message", async (data, callback) => {
    try {
      const { task, user, message } = data;
      let res = await saveMessage({
        task: task,
        message: message,
        fromId: user._id,
      });

      if (res) {
        const _newTask = await getTaskById(task.id);
        let smeIds = [];

        task.client?.smes?.map((sme) => {
          smeIds.push(sme.smeId);
        });

        // if message successfully saved then check all ids connected to task like smes and designer
        let socketIds = [];
        let socketIdOfDesigner = await redis.get(`user:${task.designerId}`);
        if (socketIdOfDesigner) {
          socketIds.push(socketIdOfDesigner);
        }

        if (smeIds) {
          for (const _id of smeIds) {
            const socketId = await redis.get(`user:${_id}`);
            if (socketId) {
              socketIds.push(socketId);
            }
          }
        }
        for (const socketId of socketIds) {
          io.to(socketId).emit("message_updated_task", _newTask);
        }

        callback({ status: "success", data: "Message received!" });
      } else {
        callback({ status: "error", data: "Message saved failed received!" });
      }
    } catch (error) {
      callback({ status: "error", data: "Message saved failed received!" });
    }
  });

  // Add content to task
  socket.on("add_content_to_task", async (data, callback) => {
    try {
      const { task, title, contentUrl } = data;
      const _content = await prisma.taskContent.create({
        data: {
          task: {
            connect: {
              id: task.id,
            },
          },
          title: title,
          contentUrl: contentUrl,
        },
      });

      if (_content) {
        const _newTask = await getTaskById(task.id);
        let smeIds = [];
        task.client?.smes?.map((sme) => {
          smeIds.push(sme.smeId);
        });

        // if contentLink successfully saved then check all ids connected to task like smes and designer
        let socketIds = [];
        let socketIdOfDesigner = await redis.get(`user:${task.designerId}`);
        if (socketIdOfDesigner) {
          socketIds.push(socketIdOfDesigner);
          getTasksOfDesigner(task.designerId);
        }

        if (smeIds) {
          for (const _id of smeIds) {
            const socketId = await redis.get(`user:${_id}`);
            if (socketId) {
              socketIds.push(socketId);
            }
          }
        }
        getAllBucket();
        getSMEsBucket();
        for (const socketId of socketIds) {
          io.to(socketId).emit("message_updated_task", _newTask);
        }
      }
    } catch (error) {
      callback({ status: "error", data: "Content add failed" });
    } finally {
      callback({ status: "success", data: "Content added successfully" });
    }
  });

  // post_link_submit
  socket.on("post_link_submit", async (data, callback) => {
    try {
      const { task, postLink } = data;
      const _postLink = await prisma.taskPostLink.create({
        data: {
          task: {
            connect: {
              id: task.id,
            },
          },
          url: postLink,
        },
      });
      if (_postLink) {
        const _newTask = await getTaskById(task.id);
        let smeIds = [];

        task.client?.smes?.map((sme) => {
          smeIds.push(sme.smeId);
        });

        // if message successfully saved then check all ids connected to task like smes and designer
        let socketIds = [];
        let socketIdOfDesigner = await redis.get(`user:${task.designerId}`);
        if (socketIdOfDesigner) {
          socketIds.push(socketIdOfDesigner);
          getTasksOfDesigner(task.designerId);
        }

        if (smeIds) {
          for (const _id of smeIds) {
            const socketId = await redis.get(`user:${_id}`);
            if (socketId) {
              socketIds.push(socketId);
            }
          }
        }
        getAllBucket();
        getSMEsBucket();
        for (const socketId of socketIds) {
          io.to(socketId).emit("message_updated_task", _newTask);
        }
        callback({ status: "success", data: "Post link updated" });
      } else {
        callback({
          status: "error",
          data: "Post Link Update failed received!",
        });
      }
    } catch (error) {
      callback({ status: "error", data: "Post Link Update failed received!" });
    }
  });


  // Handle disconnection
  socket.on("disconnect", async () => {
    try {
      const keys = await redis.keys("user:*");
      for (const key of keys) {
        const storedSocketId = await redis.get(key);

        if (storedSocketId === socket.id) {
          // Delete the Redis entry
          const userId = key.split(":")[1];

          const user = await getUserById(userId);
          socket.broadcast.emit("user_disconnected", user);

          await redis.del(key);
          const _keys = await redis.keys("user:*");
          let _users = [];
          for (const key of _keys) {
            const id = key.split(":")[1];
            _users.push(id);
          }
          io.emit("online_users", _users);
          // console.log(`Removed ${key} for disconnected socket ${socket.id}`);
          break;
        }
      }
    } catch (error) {
      console.error("Error removing from Redis:", error);
    }
    console.log("Client disconnected:", socket.id);
  });
});

// Start the server
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
