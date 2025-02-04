//*-------------------------------------------------------------------------------
//* fwCompletions.js: the "completions state" module of the "Fire Within" web-app
//*
//* Promoting the fwCompletions singleton object
//*
//*  - Holding ALL "completions" state
//*
//*  - Providing API to get/set this state
//*
//*  - Maintains persistance -AND- monitors/syncs external persistance changes
//*    * LocalStorage (for Guest users) ....... syncing multiple app instances on same device/browser
//*    * Firebase DB  (for signed-in users) ... syncing multiple app instances on ALL devices of same user
//*-------------------------------------------------------------------------------

import FWState from './FWState.js'; 

/**
 * The FWCompletions class ... internal to this module
 *
 * @class FWCompletions
 */
class FWCompletions {

  /**
   * Create a FWCompletions object.  Based on our module usage, this
   * will be a singleton, promoted through this module.
   *
   * @constructor
   */
  constructor() {
    // define our ONE-AND-ONLY default semantics
    // - technically, completions default is simply an empty state
    const defaultSemantics = {};

    // create our internal FWState object
    // ... specific to our "completions" category
    // ... that does ALL our heavy lifting
    this._fwState = new FWState({
      defaultSemantics,
      category:       'completions',
    });
  }

  /**
   * Our worker FWState object that contains our "completions" state, 
   * and does all our heavy lifting of persistence, and reactivity.
   *
   * @type {FWState}
   * @private
   */
  _fwState;


  /**
   * Return an indicator as to whether the supplied key is complete.
   *
   * @param {string} key  - The completions key to determine complete status.
   *
   * @returns {boolean} true: key IS complete, false: key IS NOT complete.
   */
  isComplete(key) {
    // pass through to our worker object
    return this._fwState.getValue(key) === 'Y';
  }

  /**
   * Set the completion status of the supplied key.
   *
   * Under the covers:
   * - our persistance store is maintained:
   *   * either device storage (for guest users)
   *   * or Firebase DB (for registered users)
   * - triggers change notifications to registered clients
   *   ... see: onChange()
   *
   * @param {string} key - The completions key to set completion status.
   * 
   * @param {boolean} val - The completions status (true: complete, false: NOT complete).
   */
  setComplete(key, val) {
    // pass through to our worker object
    this._fwState.setValue(key, val ? 'Y' : 'N');
  }


  // internal utility
  qualifiedKey(key) {
    return `collapsibleSect_${key}`;
  }

  /**
   * Return an indicator as to whether the collapsibleSection is open.
   *
   * @param {string} key  - The collapsibleSection key
   * @param {string} initialExpansion - The initialExpansion to use when no state exists ('open'/'close').
   *
   * @returns {boolean} true: the collapsibleSection IS open, false: is closed
   */
  isOpen(key, initialExpansion) {

    const qualifiedKey = this.qualifiedKey(key);

    // pass through to our worker object
    let value = this._fwState.getValue(qualifiedKey);

    // apply default semantics (when NO state exists)
    if (value === undefined) {
      value = initialExpansion;
    }

    // this is it
    return value === 'open';
  }

  /**
   * Set the visibility (expansiont state) of the supplied collapsibleSection;
   *
   * Under the covers:
   * - our persistance store is maintained:
   *   * either device storage (for guest users)
   *   * or Firebase DB (for registered users)
   * - triggers change notifications to registered clients
   *   ... see: onChange()
   *
   * @param {string} key  - The collapsibleSection key
   * @param {boolean} val - The visibility (true: open, false: close).
   */
  setVisibility(key, val) {

    const qualifiedKey = this.qualifiedKey(key);

    // pass through to our worker object
    this._fwState.setValue(qualifiedKey, val ? 'open' : 'close');
  }

  /**
   * Toggle the visibility (expansiont state) of the supplied collapsibleSection;
   *
   * Under the covers:
   * - our persistance store is maintained:
   *   * either device storage (for guest users)
   *   * or Firebase DB (for registered users)
   * - triggers change notifications to registered clients
   *   ... see: onChange()
   *
   * @param {string} key  - The collapsibleSection key
   * @param {string} initialExpansion - The initialExpansion to use when no state exists ('open'/'close').
   */
  toggleVisibility(key, initialExpansion) {
    // simply negate our current state (i.e. toggle)
    this.setVisibility(key, ! this.isOpen(key, initialExpansion));
  }


  /**
   * Register notificaiton monitors that are triggered when self's
   * completion state has changed.
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

} // end of ... FWCompletions class


//*---------------------------------------------------------
//* Create/Promote our singleton fwCompletions state object
//*---------------------------------------------------------

/**
 * The FireWithin completions state object singleton.
 *
 *  - A one-and-only singleton, which ALWAYS represents the current
 *    completions state (i.e. it is morphed in-place)!  As a result,
 *    you can hold onto this (say in module scope) and know it is
 *    always accurate.
 *
 *  - It is a "real" object, with methods ... use exclusively
 *    to interact with the state.
 *
 * Usage:
 *   // our completions state singleton object (ALWAYS up-to-date)
 *   import {fwCompletions} from './fwCompletions.js';
 *
 *   // register reflective code that syncs our UI on completion changes
 *   fwCompletions.onChange( (key) => {
 *     ... update UI ... snip snip ...
 *   });         
 *
 *   // update state (triggering persistence and change notifications)
 *   fwCompletions.setComplete('Genesis', true);
 *
 *   // access state
 *   if (fwCompletions.isComplete('20090419')) { ... }
 *
 * API: see FWCompletions class (above) for details
 *
 * @public
 */
export const fwCompletions = new FWCompletions();
