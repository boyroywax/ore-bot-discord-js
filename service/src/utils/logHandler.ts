import { captureException, captureEvent, Event } from "@sentry/node"
import * as Sentry from "@sentry/node"
import { RewriteFrames } from '@sentry/integrations'
import { createLogger, format, transports, config } from "winston";


const { combine, timestamp, colorize, printf } = format;

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [
    //     new RewriteFrames({
    //         root: global.__dirname,
    //     }),
    ],
})


// Logging Levels:
//   error
//   warn
//   info
//   http
//   verbose
//   debug
//   silly

export const logHandler = createLogger({
    levels: config.npm.levels,
    level: process.env.LOG_LEVEL,
    transports: [new transports.Console()],
    format: combine(
        timestamp({
            format: "YYYY-MM-DD HH:mm:ss",
        }),
        colorize(),
        printf((info) => `${info.level}: ${[info.timestamp]}: ${info.message}`)
    ),
    exitOnError: false,
})

export const errorLogger = (context: string, err: unknown): void => {
    const error = err as Error
    logHandler.log("error", `There was an error in the ${context}:`)
    logHandler.log(
        "error",
        JSON.stringify({ errorMessage: error.message, errorStack: error.stack })
    )
    const eventId = captureException(error)
    logHandler.log("error", `Sentry eventId: ${eventId}`)
}

// Event Params:
// {
//     event_id?: string;
//     message?: string;
//     timestamp?: number;
//     start_timestamp?: number;
//     level?: Severity;
//     platform?: string;
//     logger?: string;
//     server_name?: string;
//     release?: string;
//     dist?: string;
//     environment?: string;
//     sdk?: SdkInfo;
//     request?: Request;
//     transaction?: string;
//     modules?: {
//         [key: string]: string;
//     };
//     fingerprint?: string[];
//     exception?: {
//         values?: Exception[];
//     };
//     stacktrace?: Stacktrace;
//     breadcrumbs?: Breadcrumb[];
//     contexts?: Contexts;
//     tags?: {
//         [key: string]: Primitive;
//     };
//     extra?: Extras;
//     user?: User;
//     type?: EventType;
//     spans?: Span[];
//     measurements?: Measurements;
//     debug_meta?: DebugMeta;
//     sdkProcessingMetadata?: {
//         [key: string]: any;
//     };
// }

export const eventLogger = ( event: {} ) => {
    const dateTime = new Date()
    let eventEntry = event as Event
    logHandler.log( "info", eventEntry)

    eventEntry.environment = process.env.STAGE
    eventEntry.timestamp = dateTime.valueOf()

    const eventId = captureEvent( eventEntry )
    logHandler.log("info", `Sentry eventId: ${eventId}`)
}