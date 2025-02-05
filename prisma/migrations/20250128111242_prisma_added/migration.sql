-- CreateTable
CREATE TABLE `Client` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `businessName` VARCHAR(100) NOT NULL,
    `username` VARCHAR(100) NOT NULL,
    `joiningDate` DATE NOT NULL,
    `dob` DATE NULL,
    `email` VARCHAR(191) NULL,
    `address` VARCHAR(255) NOT NULL,
    `profilePicture` VARCHAR(2048) NOT NULL,

    UNIQUE INDEX `Client_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClientPackage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clientId` INTEGER NOT NULL,
    `packageId` INTEGER NOT NULL,
    `activationDate` DATETIME(3) NOT NULL,
    `deactivationDate` DATETIME(3) NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sme` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `smeId` VARCHAR(100) NOT NULL,
    `role` VARCHAR(50) NOT NULL,
    `clientId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Package` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `Package_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SocialMediaPlatform` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `icon` VARCHAR(2048) NOT NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WeeklyCalendar` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dayOfWeek` ENUM('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday') NOT NULL,
    `clientId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CalendarEntry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `weeklyCalendarId` INTEGER NOT NULL,
    `socialMediaPlatformId` INTEGER NOT NULL,
    `postTypeId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `taskId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PostType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SocialMediaContext` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,

    INDEX `SocialMediaContext_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SocialMediaMetrics` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `clientId` INTEGER NOT NULL,
    `socialMediaPlatformId` INTEGER NOT NULL,
    `contextId` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `metricType` VARCHAR(255) NOT NULL,
    `value` INTEGER NOT NULL,

    INDEX `SocialMediaMetrics_clientId_socialMediaPlatformId_contextId__idx`(`clientId`, `socialMediaPlatformId`, `contextId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Task` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `postTypeId` INTEGER NULL,
    `clientId` INTEGER NOT NULL,
    `scheduleDate` DATETIME(3) NOT NULL,
    `designerId` VARCHAR(100) NULL,
    `workDate` DATETIME(3) NULL,
    `statusId` INTEGER NOT NULL,
    `postFromHome` BOOLEAN NOT NULL DEFAULT false,
    `calendarEntryId` INTEGER NULL,

    INDEX `Task_clientId_scheduleDate_workDate_idx`(`clientId`, `scheduleDate`, `workDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TaskPostLink` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `taskId` INTEGER NOT NULL,
    `url` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TaskLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `taskId` INTEGER NOT NULL,
    `statusId` INTEGER NOT NULL,
    `comment` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TaskStatus` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TaskMessage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `taskId` INTEGER NOT NULL,
    `message` LONGTEXT NOT NULL,
    `fromId` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ClientPlatforms` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_ClientPlatforms_AB_unique`(`A`, `B`),
    INDEX `_ClientPlatforms_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_TaskCalendarEntries` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_TaskCalendarEntries_AB_unique`(`A`, `B`),
    INDEX `_TaskCalendarEntries_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_PostTypeToSocialMediaPlatform` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_PostTypeToSocialMediaPlatform_AB_unique`(`A`, `B`),
    INDEX `_PostTypeToSocialMediaPlatform_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_PlatformToContext` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_PlatformToContext_AB_unique`(`A`, `B`),
    INDEX `_PlatformToContext_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ClientPackage` ADD CONSTRAINT `ClientPackage_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientPackage` ADD CONSTRAINT `ClientPackage_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sme` ADD CONSTRAINT `Sme_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WeeklyCalendar` ADD CONSTRAINT `WeeklyCalendar_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CalendarEntry` ADD CONSTRAINT `CalendarEntry_weeklyCalendarId_fkey` FOREIGN KEY (`weeklyCalendarId`) REFERENCES `WeeklyCalendar`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CalendarEntry` ADD CONSTRAINT `CalendarEntry_socialMediaPlatformId_fkey` FOREIGN KEY (`socialMediaPlatformId`) REFERENCES `SocialMediaPlatform`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CalendarEntry` ADD CONSTRAINT `CalendarEntry_postTypeId_fkey` FOREIGN KEY (`postTypeId`) REFERENCES `PostType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SocialMediaMetrics` ADD CONSTRAINT `SocialMediaMetrics_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SocialMediaMetrics` ADD CONSTRAINT `SocialMediaMetrics_socialMediaPlatformId_fkey` FOREIGN KEY (`socialMediaPlatformId`) REFERENCES `SocialMediaPlatform`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SocialMediaMetrics` ADD CONSTRAINT `SocialMediaMetrics_contextId_fkey` FOREIGN KEY (`contextId`) REFERENCES `SocialMediaContext`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_statusId_fkey` FOREIGN KEY (`statusId`) REFERENCES `TaskStatus`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_postTypeId_fkey` FOREIGN KEY (`postTypeId`) REFERENCES `PostType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaskPostLink` ADD CONSTRAINT `TaskPostLink_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `Task`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaskLog` ADD CONSTRAINT `TaskLog_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `Task`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaskLog` ADD CONSTRAINT `TaskLog_statusId_fkey` FOREIGN KEY (`statusId`) REFERENCES `TaskStatus`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaskMessage` ADD CONSTRAINT `TaskMessage_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `Task`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ClientPlatforms` ADD CONSTRAINT `_ClientPlatforms_A_fkey` FOREIGN KEY (`A`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ClientPlatforms` ADD CONSTRAINT `_ClientPlatforms_B_fkey` FOREIGN KEY (`B`) REFERENCES `SocialMediaPlatform`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_TaskCalendarEntries` ADD CONSTRAINT `_TaskCalendarEntries_A_fkey` FOREIGN KEY (`A`) REFERENCES `CalendarEntry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_TaskCalendarEntries` ADD CONSTRAINT `_TaskCalendarEntries_B_fkey` FOREIGN KEY (`B`) REFERENCES `Task`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PostTypeToSocialMediaPlatform` ADD CONSTRAINT `_PostTypeToSocialMediaPlatform_A_fkey` FOREIGN KEY (`A`) REFERENCES `PostType`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PostTypeToSocialMediaPlatform` ADD CONSTRAINT `_PostTypeToSocialMediaPlatform_B_fkey` FOREIGN KEY (`B`) REFERENCES `SocialMediaPlatform`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PlatformToContext` ADD CONSTRAINT `_PlatformToContext_A_fkey` FOREIGN KEY (`A`) REFERENCES `SocialMediaContext`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PlatformToContext` ADD CONSTRAINT `_PlatformToContext_B_fkey` FOREIGN KEY (`B`) REFERENCES `SocialMediaPlatform`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
