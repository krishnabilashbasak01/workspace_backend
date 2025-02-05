-- DropForeignKey
ALTER TABLE `Task` DROP FOREIGN KEY `Task_statusId_fkey`;

-- DropForeignKey
ALTER TABLE `TaskContent` DROP FOREIGN KEY `TaskContent_taskId_fkey`;

-- DropForeignKey
ALTER TABLE `TaskPostLink` DROP FOREIGN KEY `TaskPostLink_taskId_fkey`;

-- DropIndex
DROP INDEX `Task_statusId_fkey` ON `Task`;

-- DropIndex
DROP INDEX `TaskContent_taskId_fkey` ON `TaskContent`;

-- DropIndex
DROP INDEX `TaskPostLink_taskId_fkey` ON `TaskPostLink`;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_statusId_fkey` FOREIGN KEY (`statusId`) REFERENCES `TaskStatus`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaskContent` ADD CONSTRAINT `TaskContent_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `Task`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaskPostLink` ADD CONSTRAINT `TaskPostLink_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `Task`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
