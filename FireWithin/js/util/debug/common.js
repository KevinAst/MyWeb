import msFn from '../ms/index.js'; // KJB: NEW: pull in from local dev (converted FROM: CommonJS Modules TO: ES Modules)
                                   // KJB: this is the ONE external dependancy ... converts various time formats to milliseconds
/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 */

function setup(env) {
  // KJB: createDebug is the inner function that is returned from setup() ... what they call debug (I call logger) ... used to create a log function
  //      ... see: function createDebug(...)
  createDebug.debug    = createDebug;
  createDebug.default  = createDebug;
  createDebug.coerce   = coerce;
  createDebug.disable  = disable;
  createDebug.enable   = enable;
  createDebug.enabled  = enabled;
//createDebug.humanize = require('ms'); // KJB: OLD
  createDebug.humanize = msFn;          // KJB: NEW
  createDebug.destroy  = destroy;

  // KJB: transfer items from supplied env param TO the createDebug function (just like above)
  Object.keys(env).forEach(key => {
    createDebug[key] = env[key];
  });

  /**
   * The currently active debug mode names, and names to skip.
   */

  createDebug.names = []; // KJB: LogEnablement: regexp to "include" (set via enable() ... tested in enabled())
  createDebug.skips = []; // KJB: LogEnablement: regexp to "exclude" (set via enable() ... tested in enabled())

  /**
   * Map of special "%n" handling functions, for the debug "format" argument.
   *
   * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
   */
  createDebug.formatters = {};

  /**
   * Selects a color for a debug namespace
   * @param {String} namespace The namespace string for the debug instance to be colored
   * @return {Number|String} An ANSI color code for the given namespace
   * @api private
   */
  function selectColor(namespace) {
    let hash = 0;

    for (let i = 0; i < namespace.length; i++) {
      hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }

    return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
  }
  createDebug.selectColor = selectColor;

  /**
   * Create a debugger with the given `namespace`.
   *
   * @param {String} namespace
   * @return {Function}
   * @api public
   */
  // KJB: this is the inner function that is returned from setup() ... what they call debug (I call logger) ... used to create a log function
  function createDebug(namespace) {
    let prevTime;
    let enableOverride = null;
    let namespacesCache;
    let enabledCache;

    //  KJB: this is the log function ... returned from createDebug
    function debug(...args) {
      // Disabled?
      if (!debug.enabled) {
        return;
      }

      const self = debug;

      // Set `diff` timestamp
      const curr = Number(new Date());
      const ms = curr - (prevTime || curr);
      self.diff = ms;
      self.prev = prevTime;
      self.curr = curr;
      prevTime = curr;

      args[0] = createDebug.coerce(args[0]);

      if (typeof args[0] !== 'string') {
        // Anything else let's inspect with %O
        args.unshift('%O');
      }

      // Apply any `formatters` transformations
      let index = 0;
      args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
        // If we encounter an escaped % then don't increase the array index
        if (match === '%%') {
          return '%';
        }
        index++;
        const formatter = createDebug.formatters[format];
        if (typeof formatter === 'function') {
          const val = args[index];
          match = formatter.call(self, val);

          // Now we need to remove `args[index]` since it's inlined in the `format`
          args.splice(index, 1);
          index--;
        }
        return match;
      });

      // Apply env-specific formatting (colors, etc.)
      createDebug.formatArgs.call(self, args);

      const logFn = self.log || createDebug.log;
      logFn.apply(self, args);
    }

    //  KJB: we add props onto the returned debug logger function
    debug.namespace = namespace;
    debug.useColors = createDebug.useColors();
    debug.color     = createDebug.selectColor(namespace);
    debug.extend    = extend;
    debug.destroy   = createDebug.destroy; // XXX Temporary. Will be removed in the next major release.

    Object.defineProperty(debug, 'enabled', {
      enumerable: true,
      configurable: false,
      get: () => {
        if (enableOverride !== null) {
          return enableOverride;
        }
        if (namespacesCache !== createDebug.namespaces) {
          namespacesCache = createDebug.namespaces;
          enabledCache = createDebug.enabled(namespace);
        }

        return enabledCache;
      },
      set: v => {
        enableOverride = v;
      }
    });

    // Env-specific initialization logic for debug instances
    if (typeof createDebug.init === 'function') {
      createDebug.init(debug);
    }

    // KJB: return from createDebug() ... returning the debug/logger log function
    return debug;
  }

  function extend(namespace, delimiter) {
    const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
    newDebug.log = this.log;
    return newDebug;
  }

  /**
   * Enables a debug mode by namespaces. This can include modes
   * separated by a colon and wildcards.
   *
   * KJB: LogEnablement: resets skips/names for a specific logger (funct) ... this is attached to a logger function
   *
   * @param {String} namespaces
   * @api public
   */
  function enable(namespaces) {
    // KJB: createDebug is associated associated to the instance of the logger via the fact that it is an inner function passed out (with closure)
    createDebug.save(namespaces);
    createDebug.namespaces = namespaces;

    createDebug.names = []; // KJB: LogEnablement: regexp to "include" (set via enable() ... tested in enabled())
    createDebug.skips = []; // KJB: LogEnablement: regexp to "exclude" (set via enable() ... tested in enabled())

    let i;
    const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
    const len = split.length;

    for (i = 0; i < len; i++) {
      if (!split[i]) {
        // ignore empty strings
        continue;
      }

      namespaces = split[i].replace(/\*/g, '.*?');

      if (namespaces[0] === '-') {
        createDebug.skips.push(new RegExp('^' + namespaces.slice(1) + '$')); // KJB: LogEnablement: minus - skips
      } else {
        createDebug.names.push(new RegExp('^' + namespaces + '$'));          // KJB: LogEnablement: otherwise - include
      }
    }
  }

  /**
   * Disable debug output.
   *
   * @return {String} namespaces
   * @api public
   */
  function disable() {
    const namespaces = [
      ...createDebug.names.map(toNamespace),
      ...createDebug.skips.map(toNamespace).map(namespace => '-' + namespace)
    ].join(',');
    createDebug.enable('');
    return namespaces;
  }

  /**
   * Returns true if the given mode name is enabled, false otherwise.
   *
   * @param {String} name
   * @return {Boolean}
   * @api public
   */
  function enabled(name) {
    if (name[name.length - 1] === '*') {
      return true;
    }

    let i;
    let len;

    // KJB: LogEnablement: if any of the .skips reqexp arr matches the supplied name, it is disabled
    for (i = 0, len = createDebug.skips.length; i < len; i++) {
      if (createDebug.skips[i].test(name)) {
        return false;
      }
    }

    // KJB: LogEnablement: if any of the .names reqexp arr matches the supplied name, it is enabled
    for (i = 0, len = createDebug.names.length; i < len; i++) {
      if (createDebug.names[i].test(name)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Convert regexp to namespace
   *
   * @param {RegExp} regxep
   * @return {String} namespace
   * @api private
   */
  function toNamespace(regexp) {
    return regexp.toString()
                 .substring(2, regexp.toString().length - 2)
                 .replace(/\.\*\?$/, '*');
  }

  /**
   * Coerce `val`.
   *
   * @param {Mixed} val
   * @return {Mixed}
   * @api private
   */
  function coerce(val) {
    if (val instanceof Error) {
      return val.stack || val.message;
    }
    return val;
  }

  /**
   * XXX DO NOT USE. This is a temporary stub function.
   * XXX It WILL be removed in the next major release.
   */
  function destroy() {
    console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
  }

  createDebug.enable(createDebug.load());

  // KJB: return from setup() ... returning the debug creator (what they call debug, what I call logger)
  return createDebug;
}

// KJB: this is a default export ... a single function
// KJB: from a usage perspective, I think this is what they call debug (or I call logger) ... invoke this to create the log function
// KJB: OLD:
// module.exports = setup;
// KJB: NEW:
export default setup;
