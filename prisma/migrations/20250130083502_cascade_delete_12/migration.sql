-- DropForeignKey
ALTER TABLE `CalendarEntry` DROP FOREIGN KEY `CalendarEntry_weeklyCalendarId_fkey`;

-- DropIndex
DROP INDEX `CalendarEntry_weeklyCalendarId_fkey` ON `CalendarEntry`;

-- AddForeignKey
ALTER TABLE `CalendarEntry` ADD CONSTRAINT `CalendarEntry_weeklyCalendarId_fkey` FOREIGN KEY (`weeklyCalendarId`) REFERENCES `WeeklyCalendar`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
