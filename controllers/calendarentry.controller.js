const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

// Create calender entry
const createEntry = async (req, res) => {
    const {
        weeklyCalendarId, socialMediaPlatformId, postTypeId, quantity
    } = req.body;

    try {
        const entry = await prisma.calendarEntry.create({
            data: {
                weeklyCalendarId,
                socialMediaPlatformId,
                postTypeId,
                quantity
            }
        })

        res.status(201).send(entry);
    } catch (error) {
        res.status(500).send({error: error.message});
    }
}
// Get all calendar entries
const getEntries = async (req, res) => {
    try {
        const entries = await prisma.calendarEntry.findMany();
        res.status(200).send(entries);
    } catch (error) {
        res.status(500).send({error: error.message});
    }
}

// Update a calendar entry
const updateEntry = async (req, res) => {
    const {id} = req.params;
    const {quantity} = req.body;
    try {
        const entry = await prisma.calendarEntry.update({
            where: {id: Number(id)},
            data: {
                quantity
            }
        });
        res.status(200).send(entry);
    } catch (error) {
        res.status(500).send({error: error.message});
    }
}

// Delete a calendar entry
const deleteEntry = async (req, res) => {
    const {id} = req.params;
    try{
        await prisma.calendarEntry.delete({
            where: {id: Number(id)},
        });
        res.status(200).send({message: 'Calender entry Deleted successfully'});
    }catch(error){
        res.status(500).send({error: error.message});
    }
}

// Export
module.exports = {createEntry, getEntries,
    updateEntry, deleteEntry}