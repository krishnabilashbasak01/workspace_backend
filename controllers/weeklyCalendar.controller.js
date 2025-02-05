const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Create a weekly calendar
const createWeeklyCalendar = async (req, res) => {
  const { clientId, dayOfWeek, entries } = req.body;

  try {
    const calendar = await prisma.weeklyCalendar.create({
      data: {
        clientId,
        dayOfWeek,
        entries: {
          create: entries,
        },
      },
    });

    res.status(200).send(calendar);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Get a client’s weekly calendar
const getCalendar = async (req, res) => {
  const { clientId } = req.params;

  try {
    const calendars = await prisma.weeklyCalendar.findMany({
      where: { clientId: Number(clientId) },
      include: {
        entries: {
          include: {
            socialMediaPlatform: true, // Include the related social media platform
            postType: true, // Include the related post type
          },
        },
      },
    });

    if (!calendars) {
      res.status(404).send({ message: "No calendar found." });
    }
    res.status(200).send(calendars);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Delete a client's weekly calendar
const deleteCalender = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.weeklyCalendar.delete({
      where: { id: Number(id) },
    });

    res.status(200).send({ message: "Weekly Calendar Successfully Deleted" });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// update a client's weekly calendar
const updateCalendar = async (req, res) => {
  const { id } = req.params;
  const { clientId, dayOfWeek } = req.body;

  try {
    const calendar = await prisma.weeklyCalendar.update({
      where: { id: Number(id) },
      data: {
        clientId,
        dayOfWeek,
      },
    });

    res.status(200).send(calendar);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// getSMECalender
const getSMECalender = async (req, res) => {
  try {
    const { smeId } = req.query;

    // Fetch full client details, including additional information (like address, email, etc.)
    const result = await prisma.sme.findMany({
      where: {
        smeId: smeId,
      },
      select: {
        smeId: true,
        role: true, // 'role' will be used as 'client type'
        client: {
          select: {
            id: true,
            name: true,
            businessName: true,
            email: true,
            address: true,
            profilePicture: true,
            username: true,
            joiningDate: true,
            dob: true,
            weeklyCalendar: {
              select: {
                dayOfWeek: true,
              },
            },
          },
        },
      },
    });

    // Organize and merge the results by SME ID
    const smeData = {};

    result.forEach((sme) => {
      if (!smeData[sme.smeId]) {
        smeData[sme.smeId] = [];
      }

      // Process each calendar entry by SME role (assuming it is primary or secondary)
      const days = sme.client.weeklyCalendar.map((calendar) => ({
        day: calendar.dayOfWeek,
        client: {
          id: sme.client.id,
          name: sme.client.name,
          businessName: sme.client.businessName,
          email: sme.client.email,
          address: sme.client.address,
          profilePicture: sme.client.profilePicture,
          username: sme.client.username,
          joiningDate: sme.client.joiningDate,
          dob: sme.client.dob,
          type: sme.role, // Assume 'role' here maps to client type (primary or secondary)
        },
      }));

      // Merge clients by day, avoiding duplicates (based on both client id and type)
      days.forEach(({ day, client }) => {
        const existingDay = smeData[sme.smeId].find(
          (entry) => entry.day === day
        );
        if (existingDay) {
          // If day already exists, merge clients without duplicates based on client ID and type
          const existingClient = existingDay.clients.find(
            (existingClient) =>
              existingClient.id === client.id &&
              existingClient.type === client.type
          );
          if (!existingClient) {
            existingDay.clients.push(client);
          }
        } else {
          // Create new entry for the day with full client information
          smeData[sme.smeId].push({ day, clients: [client] });
        }
      });
    });

    // Prepare the final response with the sorted days (in the correct order)
    const formattedData = Object.entries(smeData).map(([sme, days]) => ({
      sme,
      days: days.sort((a, b) => {
        const order = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        return order.indexOf(a.day) - order.indexOf(b.day);
      }),
    }));

    res.status(200).json(formattedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// exports
module.exports = {
  createWeeklyCalendar,
  getCalendar,
  deleteCalender,
  updateCalendar,
  getSMECalender,
};
