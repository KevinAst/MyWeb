/**
 * Report an unexpected condition to the user, while logging details.
 *
 * @param {Logger} log - the logger to report this issue on.
 *
 * @param {string} attemptingToContext - a human readable description
 * of what was being attempted when the error ocurred.
 *
 * @param {Error} err - the JavaScript Error that occurred
 */
export function showUnexpectedError(log, attemptingToContext, err) {
  const userMsg = `An unexpected error was encountered: ${err.message} ATTEMPTING TO: ${attemptingToContext}`;
  log.f(`*** ERROR *** ${userMsg}`, err);
  alert(`${userMsg} ... see logs for full details`);
}
