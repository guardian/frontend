// @flow

/*
   Report errors to Sentry with optional tags metadata
   We optionally re-throw the error to halt execution and to ensure the error is
   still logged to the console via browsers built-in logging for uncaught
   exceptions. This is optional because sometimes we log errors for tracking
   user data.
*/
export type ReportedError = Error & {
    reported?: boolean,
};

export type ErrorLogger = (
    err: ReportedError,
    tags: Object,
    shouldThrow?: boolean
) => void;

const reportError: ErrorLogger = (
    err: ReportedError,
    tags: Object,
    shouldThrow?: boolean = true
): void => {
    console.log('***** NEW reportError', err, tags, shouldThrow);
};

export default reportError;
