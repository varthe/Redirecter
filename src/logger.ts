import path from "path"
import winston, { Logger } from "winston"
import DailyRotateFile from "winston-daily-rotate-file"

const filePath: string = process.argv[2] || "./logs"
const logLevel: string = process.env.LOG_LEVEL || "debug"
const debug = true

const logger: Logger = winston.createLogger({
    level: logLevel,
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

export default logger
