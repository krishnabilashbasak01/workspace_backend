-- DropForeignKey
ALTER TABLE `ClientPackage` DROP FOREIGN KEY `ClientPackage_clientId_fkey`;

-- DropIndex
DROP INDEX `ClientPackage_clientId_fkey` ON `ClientPackage`;

-- AddForeignKey
ALTER TABLE `ClientPackage` ADD CONSTRAINT `ClientPackage_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
