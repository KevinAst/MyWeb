/**
 * Detect Electron renderer / nwjs process, which is node, but we should
 * treat as a browser.
 */

// KJB:
// TODO: Fully integrate node.js support (see "loggerNode" references - BELOW)
//       - I am punting on this now ... because:
//         * node.js has not been converted yet
//         * and I have no way to test it (FireWithin has NO node component)
//       - Currently it is NOT being referenced (see: index.js)


import loggerBrowser from './browser.js';
// import loggerNode    from './node.js'; // TODO: activate this -AND- remove const declaration on next line
const loggerNode = loggerBrowser;

const useBrowser = typeof process === 'undefined' || process.type === 'renderer' || process.browser === true || process.__nwjs;
const logger     = useBrowser ? loggerBrowser : loggerNode;
export default logger;
