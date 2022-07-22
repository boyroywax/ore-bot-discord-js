import { createLogger, format, transports, config } from "winston";


const { combine, timestamp, colorize, printf } = format;


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
    level: process.env.LOG_LEVEL || "silly",
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

export const debugLogger = ( message: string ) => {
    logHandler.log( "debug", message )
}

export const errorLogger = (context: string, err: unknown): void => {
    const error = err as Error
    logHandler.log("error", `There was an error in ${context}:` )
    logHandler.log(
        "error",
        JSON.stringify({ errorMessage: error.message, errorStack: error.stack })
    )
    // const eventId = Sentry.captureException(error)
    // logHandler.log("error", `Sentry eventId: ${eventId}`)
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

export const eventLogger = ( event: {message: string, user: bigint} ) => {
    logHandler.log( "info", event.message + `by ` + event.user )
}