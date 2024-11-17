const path = require("path")
const winston = require("winston")
const DailyRotateFile = require("winston-daily-rotate-file")

const filePath = process.argv[2] || "./logs"

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message}`
        })
    ),
    transports: [
        new winston.transports.Console(),
        new DailyRotateFile({
            filename: path.join(filePath, "redirecterr-%DATE%.log"),
            datePattern: "YYYY-MM-DD",
            maxSize: "500k",
            maxFiles: "7d",
        }),
    ],
})

module.exports = logger
