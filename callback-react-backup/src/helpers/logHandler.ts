// import { captureException } from "@sentry/node"
import { createLogger, format, transports, config } from "winston"

const { combine, timestamp, colorize, printf } = format

export const logHandler = createLogger({
    levels: config.npm.levels,
    level: "silly",
    transports: [new transports.Console()],
    format: combine(
        timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
        }),
        colorize(),
        printf((info: any) => `${info.level}: ${[info.timestamp]}: ${info.message}`)
    ),
    exitOnError: false,
})

export const errorHandler = (context: string, err: unknown): void => {
    const error = err as Error
    logHandler.log("error", `There was an error in ${context}:`)
    logHandler.log(
        "error",
        JSON.stringify({ errorMessage: error.message, errorStack: error.stack })
    )
    // captureException(error)
}