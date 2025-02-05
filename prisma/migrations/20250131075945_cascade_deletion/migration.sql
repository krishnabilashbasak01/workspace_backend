-- DropForeignKey
ALTER TABLE `TaskLog` DROP FOREIGN KEY `TaskLog_taskId_fkey`;

-- DropForeignKey
ALTER TABLE `TaskMessage` DROP FOREIGN KEY `TaskMessage_taskId_fkey`;

-- DropIndex
DROP INDEX `TaskLog_taskId_fkey` ON `TaskLog`;

-- DropIndex
DROP INDEX `TaskMessage_taskId_fkey` ON `TaskMessage`;

-- AddForeignKey
ALTER TABLE `TaskLog` ADD CONSTRAINT `TaskLog_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `Task`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaskMessage` ADD CONSTRAINT `TaskMessage_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `Task`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
