-- DropForeignKey
ALTER TABLE `Sme` DROP FOREIGN KEY `Sme_clientId_fkey`;

-- DropForeignKey
ALTER TABLE `SocialMediaMetrics` DROP FOREIGN KEY `SocialMediaMetrics_clientId_fkey`;

-- DropForeignKey
ALTER TABLE `Task` DROP FOREIGN KEY `Task_clientId_fkey`;

-- DropForeignKey
ALTER TABLE `WeeklyCalendar` DROP FOREIGN KEY `WeeklyCalendar_clientId_fkey`;

-- DropIndex
DROP INDEX `Sme_clientId_fkey` ON `Sme`;

-- DropIndex
DROP INDEX `WeeklyCalendar_clientId_fkey` ON `WeeklyCalendar`;

-- AddForeignKey
ALTER TABLE `Sme` ADD CONSTRAINT `Sme_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WeeklyCalendar` ADD CONSTRAINT `WeeklyCalendar_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SocialMediaMetrics` ADD CONSTRAINT `SocialMediaMetrics_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
