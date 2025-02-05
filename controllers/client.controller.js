const { PrismaClient } = require("@prisma/client");
const error = require("jsonwebtoken/lib/JsonWebTokenError");
const { id } = require("date-fns/locale");
const prisma = new PrismaClient({ log: ["query", "info", "warn", "error"] });

// Create New Client
const createClient = async (req, res) => {
  const { name, businessName, username, joiningDate, address, profilePicture } =
    req.body;
  const formattedJoiningDate = new Date(joiningDate).toISOString();
  try {
    const client = await prisma.client.create({
      data: {
        name,
        businessName,
        username,
        joiningDate: formattedJoiningDate,
        address,
        profilePicture,
      },
    });

    res.status(201).send(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all clients
const getClients = async (req, res) => {
  const { user } = req;
  let smeId = "";
  let where = {};
  if (user.role.name.toLowerCase() === "sme") {
    smeId = user._id;
    where = {
      smes: {
        some: { smeId: `${smeId}` }, // Checking if any SME is linked to the client by smeId
      },
    };
  }

  try {
    const _clients = await prisma.client.findMany({
      where: where,
      include: {
        platforms: true,
        weeklyCalendar: true,
        smes: true,
      },
    });
    // console.log('clients', clients);

    // console.log('smeId', smeId);
    // console.log('_clients',_clients);

    res.status(200).send(_clients);
  } catch (error) {
    console.log(error);

    res.status(500).json({ error: error.message });
  }
};

// get single client by id
const getClient = async (req, res) => {
  const { id } = req.params;
  try {
    const client = await prisma.client.findUnique({
      where: { id: Number(id) },
      include: {
        packages: {
          include: {
            package: true, // This includes the `Package` details in the `packages`
          },
        },
        // platforms: true,
        platforms: {
          include: {
            contexts: true, // Includes contexts for each platform
            socialMediaMetrics: {
              where: {
                clientId: Number(id), // Filters metrics specific to the client
              },
              include: {
                context: true, // Including context information for each metric
              },
            },
          },
        },
        weeklyCalendar: {
          include: {
            entries: {
              include: {
                socialMediaPlatform: true,
                postType: true,
              },
            },
          },
        },
        smes: true,
      },
    });
    if (!client) {
      res.status(404).json({ error: "Client not found" });
    }
    res.status(200).send(client);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

// get single client by username
const getClientByUserName = async (req, res) => {
  let { username } = req.params;
  try {
    // Get client by username to fetch its ID
    const clientBasic = await prisma.client.findFirst({ where: { username } });

    if (!clientBasic) {
      return res.status(404).json({ error: "Client not found" });
    }

    const client = await prisma.client.findFirst({
      where: { username: username },
      include: {
        packages: {
          include: {
            package: true,
          },
        },
        platforms: {
          include: {
            contexts: true,
            socialMediaMetrics: {
              where: { clientId: clientBasic.id },
              include: {
                context: true,
              },
            },
          },
        },
        // platforms:true,
        weeklyCalendar: {
          include: {
            entries: {
              include: {
                socialMediaPlatform: true,
                postType: true,
              },
            },
          },
        },
      },
    });

    if (!client) {
      res.status(404).json({ error: "Client not found" });
    }
    res.status(200).send(client);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Update a client
const updateClient = async (req, res) => {
  const { id } = req.params;
  const { name, businessName, username, joiningDate, address, profilePicture } =
    req.body;
  try {
    const client = await prisma.client.update({
      where: { id: Number(id) },
      data: {
        name,
        businessName,
        username,
        joiningDate,
        address,
        profilePicture,
      },
    });
    res.status(200).send(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Delete a client
const deleteClient = async (req, res) => {
  const { id } = req.params;
  try {
    // Convert id to Number
    const clientId = Number(id);

    // Delete related records in a proper order
    await prisma.taskLog.deleteMany({ where: { task: { clientId } } });
    await prisma.taskMessage.deleteMany({ where: { task: { clientId } } });
    await prisma.taskPostLink.deleteMany({ where: { task: { clientId } } });
    await prisma.taskContent.deleteMany({ where: { task: { clientId } } });

    // Delete tasks
    await prisma.task.deleteMany({ where: { clientId } });

    // Delete related client records
    await prisma.clientPackage.deleteMany({ where: { clientId } });
    await prisma.sme.deleteMany({ where: { clientId } });
    // Delete calendar entries first
    await prisma.calendarEntry.deleteMany({
      where: {
        weeklyCalendarId: {
          in: (
            await prisma.weeklyCalendar.findMany({
              where: { clientId },
              select: { id: true },
            })
          ).map((wc) => wc.id),
        },
      },
    });
    await prisma.weeklyCalendar.deleteMany({ where: { clientId } });
    await prisma.socialMediaMetrics.deleteMany({ where: { clientId } });

    // Finally, delete the client
    await prisma.client.delete({ where: { id: clientId } });
    res.status(200).send({ message: "Client deleted successfully" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Client not found" });
    }
    res.status(500).json({ error: error.message });
  }
};

const addSmeToClient = async (req, res) => {
  try {
    const { smeId, clientId, role } = req.body;
    const sme = await prisma.sme.create({
      data: {
        smeId,
        role,
        client: {
          connect: { id: Number(clientId) },
        },
      },
    });
    if (!sme) {
      res.status(404).json({ error: "Client not found" });
    }
    res.status(200).send(sme);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

// export all
module.exports = {
  createClient,
  getClients,
  getClient,
  updateClient,
  deleteClient,
  getClientByUserName,
  addSmeToClient,
};
