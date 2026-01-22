-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rpName" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "badgeNumber" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "avatarUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "unitAssignment" TEXT,
    "notes" TEXT,
    "certifications" TEXT,
    "lastActive" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "rankId" TEXT NOT NULL,
    CONSTRAINT "User_rankId_fkey" FOREIGN KEY ("rankId") REFERENCES "Rank" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_User" ("avatarUrl", "badgeNumber", "createdAt", "email", "id", "password", "phoneNumber", "rankId", "rpName", "updatedAt") SELECT "avatarUrl", "badgeNumber", "createdAt", "email", "id", "password", "phoneNumber", "rankId", "rpName", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_badgeNumber_key" ON "User"("badgeNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
