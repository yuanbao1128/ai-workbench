-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "content" TEXT,
    "keyConcepts" TEXT NOT NULL DEFAULT '[]',
    "relatedCards" TEXT NOT NULL DEFAULT '[]',
    "source" TEXT,
    "history" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "dueDate" DATETIME,
    "relatedCards" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME
);

-- CreateTable
CREATE TABLE "LegacyIssue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "plannedDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME
);

-- CreateTable
CREATE TABLE "Delegation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "assignee" TEXT NOT NULL,
    "source" TEXT,
    "status" TEXT NOT NULL DEFAULT 'WAITING',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "followUpTimes" TEXT NOT NULL DEFAULT '[]',
    "customFollowUp" TEXT,
    "conclusion" TEXT,
    "timeline" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "refId" TEXT,
    "refType" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "dateRange" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'app-settings',
    "apiProvider" TEXT NOT NULL DEFAULT 'anthropic',
    "apiKey" TEXT NOT NULL DEFAULT '',
    "model" TEXT NOT NULL DEFAULT 'claude-sonnet-5',
    "baseUrl" TEXT,
    "updatedAt" DATETIME NOT NULL
);
