const fs = require("fs/promises");

// Define log levels as an object instead of enum
const LogLevel = {
  SILENT: 0,
  INFO: 1,
  DEBUG: 2,
};

// Provide a default value for logFile in case it's not set in the environment
const logFile = process.env.LOG_FILE || "default-log.txt";  // Use a default file name
const logLevel = parseInt(process.env.LOG_LEVEL || "0", 10);

// Ensure log file exists (optional, can remove if not necessary)
async function ensureLogFileExists() {
  try {
    await fs.access(logFile);
  } catch {
    await fs.writeFile(logFile, "", "utf8");
  }
}

// Utility function to log messages
async function log(message, level) {
  if (level <= logLevel) {
    const logMessage = `[${new Date().toISOString()}] ${Object.keys(LogLevel)[level]}: ${message}\n`;
    await fs.appendFile(logFile, logMessage, "utf8");
  }
}

// Specific log level functions
async function info(message) {
  await ensureLogFileExists();
  await log(message, LogLevel.INFO);
}

async function debug(message) {
  await ensureLogFileExists();
  await log(message, LogLevel.DEBUG);
}

async function silent(message) {
  await ensureLogFileExists();
  await log(message, LogLevel.SILENT);
}

module.exports = { info, debug, silent };
