

/*
    Swallows (and reports) exceptions. Designed to wrap around modules at the "bootstrap" level.
    For example "comments throwing an exception should not stop auto refresh"
 */

import reportError from "lib/report-error";

const catchErrors = (fn: Function): Error | null | undefined => {
  let error;

  try {
    fn();
  } catch (e) {
    error = e;
  }

  return error;
};

const logError = (module: string, error: Error, tags: {
  [key: string]: string;
} | null | undefined): void => {
  if (window.console && window.console.warn) {
    window.console.warn('Caught error.', error.stack);
  }

  if (tags) {
    reportError(error, {module, ...tags}, false);
  } else {
    reportError(error, { module }, false);
  }
};

const catchAndLogError = (name: string, fn: Function, tags: {
  [key: string]: string;
} | null | undefined): void => {
  const error = catchErrors(fn);

  if (error) {
    logError(name, error, tags);
  }
};

const catchErrorsWithContext = (modules: Array<any>, tags: {
  [key: string]: string;
} | null | undefined): void => {
  modules.forEach(([name, fn]) => catchAndLogError(name, fn, tags));
};

export { catchErrorsWithContext, logError };
export const _ = { catchAndLogError };