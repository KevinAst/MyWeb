//*-------------------------------------------------------------------------------
//* fwMemoryVerseTranslation.js: the "memoryVerseTranslation state" module of the "Fire Within" web-app
//*
//* Promoting the fwMemoryVerseTranslation singleton object
//*
//*  - Holding ALL "memoryVerseTranslation" state
//*
//*  - Providing API to get/set this state
//*
//*  - Maintains persistance -AND- monitors/syncs external persistance changes
//*    * LocalStorage (for Guest users) ....... syncing multiple app instances on same device/browser
//*    * Firebase DB  (for signed-in users) ... syncing multiple app instances on ALL devices of same user
//*-------------------------------------------------------------------------------

import FWState from './FWState.js'; 

const validTranslations = [ // ?? do we need this here?
  'NLT',
  'NKJV',
  'ESV',
  'CSB',
  'KJV',
  'NIV',
];

const defaultTranslation = validTranslations[0]; // ?? do we need this?

/**
 * The FWMemoryVerseTranslation class ... internal to this module
 *
 * @class FWMemoryVerseTranslation
 */
class FWMemoryVerseTranslation {

  /**
   * Create a FWMemoryVerseTranslation object.  Based on our module usage, this
   * will be a singleton, promoted through this module.
   *
   * @constructor
   */
  constructor() {
    // define our ONE-AND-ONLY default semantics
    // - technically, memoryVerseTranslation default is simply an empty state
    const defaultSemantics = {};

    // create our internal FWState object
    // ... specific to our "memoryVerseTranslation" category
    // ... that does ALL our heavy lifting
    this._fwState = new FWState({
      defaultSemantics,
      category: 'memoryVerseTranslation',
    });
  }

  /**
   * Our worker FWState object that contains our "memoryVerseTranslation" state, 
   * and does all our heavy lifting of persistence, and reactivity.
   *
   * @type {FWState}
   * @private
   */
  _fwState;

  /**
   * Get the translation in affect for the supplied memoryVerse (defaulted when not set).
   *
   * @param {string} memoryVerseKey - The memoryVerse key (EX: 'luk_9_23-24')
   *
   * @returns {string} the translation in affect for the supplied memoryVerseKey (EX: 'NKJV')
   */
  getTranslation(memoryVerseKey) {
    // pass through to our worker object
    // ... default fallback (when NOT explicitly set)

    // ?? TRASH (temp diagnostic)
    //? const rawValue = this._fwState.getValue(memoryVerseKey);
    //? console.log(`?? in fwMemoryVerseTranslation.getTranslation('${memoryVerseKey}') ... rawValue from DB: ${rawValue}`);

    return this._fwState.getValue(memoryVerseKey) || defaultTranslation;
  }

  /**
   * Set the translation in affect for the supplied memoryVerseKey.
   *
   * Under the covers:
   * - our persistance store is maintained:
   *   * either device storage (for guest users)
   *   * or Firebase DB (for registered users)
   * - triggers change notifications to registered clients
   *   ... see: onChange()
   *
   * @param {string} memoryVerseKey - EX: 'luk_9_23-24'
   *
   * @param {string} translation - EX: 'NKJV'
   */
  setTranslation(memoryVerseKey, translation) {
    // pass through to our worker object
    // ?? validate please ?? example of exception to throw
    this._fwState.setValue(memoryVerseKey, translation);
  }

  /**
   * Register notificaiton monitors that are triggered when self's
   * state has changed.
   *
   * @param {onChangeHandlerFn} onChangeHandler - the client supplied listener.
   *        API:
   *          onChangeHandlerFn([key]): void
   *            WHERE:
   *              - key: optional key that changed (when omitted, it means ALL state changed)
   *                     ... currently key NOT used in our app!
   *            NOTE: The change is automatically reflected in self's object instance
   *                  (promoted as a singleton)
   *
   * @returns void
   *
   * @public
   */
  onChange(onChangeHandler) {
    // pass through to our worker object
    this._fwState.onChange(onChangeHandler);
  }

} // end of ... FWMemoryVerseTranslation class


//*--------------------------------------------------------------------
//* Create/Promote our singleton fwMemoryVerseTranslation state object
//*--------------------------------------------------------------------

/**
 * The FireWithin memoryVerseTranslation state object singleton.
 *
 *  - A one-and-only singleton, which ALWAYS represents the current
 *    memoryVerseTranslation state (i.e. it is morphed in-place)!  As a result,
 *    you can hold onto this (say in module scope) and know it is
 *    always accurate.
 *
 *  - It is a "real" object, with methods ... use exclusively
 *    to interact with the state.
 *
 * Usage:
 *   // our memoryVerseTranslation state singleton object (ALWAYS up-to-date)
 *   import {fwMemoryVerseTranslation} from './fwMemoryVerseTranslation.js';
 *
 *   // register reflective code that syncs our UI on changes
 *   fwMemoryVerseTranslation.onChange( (key) => {
 *     ... update UI ... snip snip ...
 *   });         
 *
 *   // update state (triggering persistence and change notifications)
 *   fwMemoryVerseTranslation.setTranslation('luk_9_23-24', 'NKJV');
 *
 *   // access state
 *   const translation = fwMemoryVerseTranslation.getTranslation('luk_9_23-24');
 *
 * API: see FWMemoryVerseTranslation class (above) for details
 *
 * @public
 */
export const fwMemoryVerseTranslation = new FWMemoryVerseTranslation();
