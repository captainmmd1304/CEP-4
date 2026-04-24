-- CreateTable
CREATE TABLE "MlFeedback" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "recommendedId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "context" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MlFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MlFeedback_recommendedId_fkey" FOREIGN KEY ("recommendedId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "MlFeedback_userId_createdAt_idx" ON "MlFeedback"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "MlFeedback_recommendedId_idx" ON "MlFeedback"("recommendedId");
