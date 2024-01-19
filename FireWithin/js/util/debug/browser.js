/* eslint-env browser */

/**
 * This is the web browser implementation of `debug()`.
 */

// KJB: this WAS a CommonJS module ... NOW CONVERTED TO: ES Modules
//      - this module's public API exports a SINGLE log creator function (what they call debug, I call logger)
//        ... see: assignment of module.exports (can be an object for named exports -or- a single item (in this case function) - a default export
//      - in addition, they are exporting a variety of "named" exports (via the exports.xyz assignment)
//        * this is a special feature of CommonJS, where the exports is kinda an alias to module.exports BUT used for named exports
//        * HOWEVER: because this code transfers everything in the exports to properties of the exposed default function,
//                   I can get by with simply using the single default function (at least in MY usage)

// KJB: suspect browser.js refines characteristics of common.js
//      > L8TR: FIND THIS IN CODE (for now I'm primarly interested in converting to ES Modules)
//      - utilize devtools console, 
//      - with proper colors, 
//      - and LocalStorage filter

// KJB: Convert FROM: CommonJS Modules TO: ES Modules
//      - I think I have a fairly good handle on this
//      - a single default export (see module.exports close to end)
//      - DO THIS:
//        1. resolve what this.useColors is doing (in formatArgs(args) below)
//        2. migrate the exports object to our own obj
//           - call it fnAddOns ... const fnAddOns = {}
//           - retrofitting ALL exports.xyz assignments
//        3. do the one-and-only default export
//        4. resolve the ms dependancy ... held has humanize

const fnAddOns = {}
fnAddOns.formatArgs = formatArgs;
fnAddOns.save       = save;
fnAddOns.load       = load;
fnAddOns.useColors  = useColors;
fnAddOns.storage    = localstorage(); // KJB: generically storage ... for browser, this will be the browsers localStorage ... for node.js this is undefined
fnAddOns.destroy    = (() => {
  let warned = false;

  return () => {
    if (!warned) {
      warned = true;
      console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
    }
  };
})();

/**
 * Colors.
 */

fnAddOns.colors = [
  '#0000CC',
  '#0000FF',
  '#0033CC',
  '#0033FF',
  '#0066CC',
  '#0066FF',
  '#0099CC',
  '#0099FF',
  '#00CC00',
  '#00CC33',
  '#00CC66',
  '#00CC99',
  '#00CCCC',
  '#00CCFF',
  '#3300CC',
  '#3300FF',
  '#3333CC',
  '#3333FF',
  '#3366CC',
  '#3366FF',
  '#3399CC',
  '#3399FF',
  '#33CC00',
  '#33CC33',
  '#33CC66',
  '#33CC99',
  '#33CCCC',
  '#33CCFF',
  '#6600CC',
  '#6600FF',
  '#6633CC',
  '#6633FF',
  '#66CC00',
  '#66CC33',
  '#9900CC',
  '#9900FF',
  '#9933CC',
  '#9933FF',
  '#99CC00',
  '#99CC33',
  '#CC0000',
  '#CC0033',
  '#CC0066',
  '#CC0099',
  '#CC00CC',
  '#CC00FF',
  '#CC3300',
  '#CC3333',
  '#CC3366',
  '#CC3399',
  '#CC33CC',
  '#CC33FF',
  '#CC6600',
  '#CC6633',
  '#CC9900',
  '#CC9933',
  '#CCCC00',
  '#CCCC33',
  '#FF0000',
  '#FF0033',
  '#FF0066',
  '#FF0099',
  '#FF00CC',
  '#FF00FF',
  '#FF3300',
  '#FF3333',
  '#FF3366',
  '#FF3399',
  '#FF33CC',
  '#FF33FF',
  '#FF6600',
  '#FF6633',
  '#FF9900',
  '#FF9933',
  '#FFCC00',
  '#FFCC33'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

// eslint-disable-next-line complexity
function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
    return true;
  }

  // Internet Explorer and Edge do not support colors.
  if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
    return false;
  }

  // Is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
         // Is firebug? http://stackoverflow.com/a/398120/376773
         (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
         // Is firefox >= v31?
         // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
         (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
         // Double check webkit in userAgent just in case we are in a worker
         (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */
function formatArgs(args) {
  //  KJB: NOTES:
  //       1. `this` is the log function (returned from debug(...))
  //           BECAUSE: it is invoked as follows: createDebug.formatArgs.call(self, args) ... see: common.js
  //           CAUTION: evidently, this is considered to be an internal function (even though it is publically promoted on the function)
  //                    because of how it needs to be invoked
  //       2. UNSURE what it means to assign the first arg?
  args[0] = (this.useColors ? '%c' : '') + // KJB: add color formatter when useColors is defined
            this.namespace +
             (this.useColors ? ' %c' : ' ') +
            args[0] +
             (this.useColors ? '%c ' : ' ') +
            // KJB: OLD:
            //          '+' + module.exports.humanize(this.diff); // KJB: the one-and-only dependancy (defined in common.js): convert various time formats to milliseconds
            // KJB: NEW:
            '+' + logger.humanize(this.diff);

  if (!this.useColors) {
    return;
  }

  const c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit');

  // The final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  let index = 0;
  let lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, match => {
    if (match === '%%') {
      return;
    }
    index++;
    if (match === '%c') {
      // We only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.debug()` when available.
 * No-op when `console.debug` is not a "function".
 * If `console.debug` is not available, falls back
 * to `console.log`.
 *
 * @api public
 */
// KJB: the general log function ... for browser, this is console.debug ... for node.js it is it's own function tapped into the node process
fnAddOns.log = console.debug || console.log || (() => {});

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */
function save(namespaces) {
  try {
    if (namespaces) {
      fnAddOns.storage.setItem('debug', namespaces); // KJB: they are using the "storage" alias to localStorage (when defined ... when NOT - NO-OP with catch below)
    } else {
      fnAddOns.storage.removeItem('debug');
    }
  } catch (error) {
    // Swallow
    // XXX (@Qix-) should we be logging these?
  }
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */
function load() {
  let r;
  try {
    r = fnAddOns.storage.getItem('debug');
  } catch (error) {
    // Swallow
    // XXX (@Qix-) should we be logging these?
  }

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG;
  }

  return r;
}

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    // TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
    // The Browser also has localStorage in the global context.
    return localStorage;
  } catch (error) {
    // Swallow
    // XXX (@Qix-) should we be logging these?
  }
}

// KJB: common.js is common to BOTH browser.js and node.js
//      - it exposes a single default export, 
//      - which is a setup function
//        - passing fnAddOns
//          ... whose properties get transfered to the returned debug/logger function
//        - RETURNING the debug/logger function ... which in turn is our default export!
// KJB: OLD:
//      module.exports = require('./common')(fnAddOns);
// KJB: NEW:
import setup from './common.js';
const  logger = setup(fnAddOns);
export default logger;

// KJB: extract formatters (defined in common) ... which in turn is transfered to the returned function (above) ... using that (I think)
// KJB: OLD:
//      const {formatters} = module.exports;
// KJB: NEW:
const {formatters} = logger;

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

formatters.j = function (v) {
  try {
    return JSON.stringify(v);
  } catch (error) {
    return '[UnexpectedJSONParseError]: ' + error.message;
  }
};
