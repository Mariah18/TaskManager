-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    "dueDate" DATETIME,
    "priority" TEXT NOT NULL DEFAULT 'low',
    CONSTRAINT "tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_tasks" ("completed", "createdAt", "deletedAt", "description", "dueDate", "id", "title", "updatedAt", "userId") SELECT "completed", "createdAt", "deletedAt", "description", "dueDate", "id", "title", "updatedAt", "userId" FROM "tasks";
DROP TABLE "tasks";
ALTER TABLE "new_tasks" RENAME TO "tasks";
CREATE INDEX "tasks_userId_idx" ON "tasks"("userId");
CREATE INDEX "tasks_completed_idx" ON "tasks"("completed");
CREATE INDEX "tasks_createdAt_idx" ON "tasks"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
