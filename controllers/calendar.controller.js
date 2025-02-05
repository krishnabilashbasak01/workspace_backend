const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

const {format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, add, isToday, isSameDay, parse, parseISO} = require('date-fns');

const getDaysOfMonth = async (req, res) => {
    // Parse month and year from the query, default to current month/year
    const {year, month, clientId} = req.query;

    const currentMonth = month && year ? new Date(year, month - 1) : new Date();

//     Get start and end for complete grid of the month
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));


    // Fetch tasks for the given client with in date range
    const tasks = await prisma.task.findMany({
        where: {
            clientId: parseInt(clientId),
            scheduleDate:{
                gte: start,
                lte:end
            }
        },
        include: {
            postType: true,       // Include relational PostType
            status: true,         // Include relational Status
            logs: true,           // Include task logs
            messages: true,       // Include task messages
            calendarEntries: true,  // Include calendar entry
            client: {
                include:{
                    smes: true
                }
            },
            postLinks: true,         // Include client
        }

    })
    // console.log(tasks);




    const days = [];
    let day = start;

    while (day <= end) {
        const formattedDay = format(day, 'yyyy-MM-dd');
        const dayTasks = tasks
            .filter(task => format(task.scheduleDate, 'yyyy-MM-dd') === formattedDay)
            .map(task => ({
                ...task, // Spread the task object to include all fields
            }));

        days.push({
            day: formattedDay,
            tasks: dayTasks,
        });

        day = add(day, {days: 1});
    }

    res.json({
        currentMonth: format(currentMonth, 'MMMM yyyy'),
        days,
        weekdayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    })

}


module.exports = {
    getDaysOfMonth
}