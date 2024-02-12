//*-------------------------------------------------------------------------------
//* fwSettings.js: the "settings state" module of the "Fire Within" web-app
//*
//* Promoting the fwSettings singleton object
//*
//*  - Holding ALL "settings" state
//*
//*  - Providing API to get/set this state
//*
//*  - Maintains persistance -AND- monitors/syncs external persistance changes
//*    * LocalStorage (for Guest users) ....... syncing multiple app instances on same device/browser
//*    * Firebase DB  (for signed-in users) ... syncing multiple app instances on ALL devices of same user
//*-------------------------------------------------------------------------------

import FWState from './FWState.js'; 

/**
 * The FWSettings class ... internal to this module
 *
 * @class FWSettings
 */
class FWSettings {

  /**
   * Create a FWSettings object.  Based on our module usage, this
   * will be a singleton, promoted through this module.
   *
   * @constructor
   */
  constructor() {
    // define our ONE-AND-ONLY default semantics
    // - NOTE: mutation of this object is acceptable, 
    //         because it is always re-created within the context of this constructor function
    const defaultSemantics = {
      bibleTranslation: 'NLT',
      userName:         '',
    };

    // create our internal FWState object
    // ... specific to our "settings" category
    // ... that does ALL our heavy lifting
    this._fwState = new FWState({
      defaultSemantics,
      category:       'settings',
      deviceStateKey: 'fireWithinSettings', // ??## soon to be eliminated ... STANDARDIZE: deviceStateKey to use "category" <<< ENABLE THIS A BIT LATER (see migration utility AT BOTTOM)
    });
  }

  /**
   * Our worker FWState object that contains our "settings" state, 
   * and does all our heavy lifting of persistence, and reactivity.
   *
   * @type {FWState}
   * @private
   */
  _fwState;

  /**
   * Register notificaiton monitors that are triggered when ANY acpect of self's
   * setting state has changed.
   *
   * @param {onChangeHandlerFn} onChangeHandler - the client supplied listener.
   *        API:
   *          onChangeHandlerFn([key]): void
   *            WHERE:
   *              - key: optional key that changed (when omitted, it means ALL state changed)
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


  //*-----------------------------------------------------------------------------
  //* bibleTranslation
  //*-----------------------------------------------------------------------------

  /**
   * Bible Translation Codes (as defined by YouVersion)
   * 
   * NOTE: Technically, this is a static member, but since our fwSettings is a singleton, just "Keep it Simple"
   */
  bibleTranslations = {
    SEP1: { code: 'GROUP', desc: 'Paraphrased (everyday lang):' },
    MSG:  { code: '97',    desc: 'The Message' },
    GNT:  { code: '68',    desc: 'Good News Translation' },
    NLT:  { code: '116',   desc: 'New Living Translation' },

    SEP2: { code: 'GROUP', desc: 'Literal (some moderate):' },
    CSB:  { code: '1713',  desc: 'Christian Standard Bible' },
    NIV:  { code: '111',   desc: 'New International Ver' },
    ESV:  { code: '59',    desc: 'English Standard Ver 2016' },
    NET:  { code: '107',   desc: 'New English Translation' },

    SEP3: { code: 'GROUP', desc: 'Traditional:' },
    NKJV: { code: '114',   desc: 'New King James Ver' },
    KJV:  { code: '1',     desc: 'King James Ver' },

    SEP4: { code: 'GROUP', desc: 'Amplified:' },
    AMP:  { code: '1588',  desc: 'Amplified Bible' },
    AMPC: { code: '8',     desc: 'Amplified Bible Classic' },
  }

  /**
   * Get self's bibleTranslation property (ex: 'KJV').
   *
   * @returns {string} self's bibleTranslation property (ex: 'KJV').
   */
  getBibleTranslation() {
    // pass through to our worker object
    return this._fwState.getValue('bibleTranslation');
  }

  /**
   * Get self's bibleTranslationCode property (ex: '1') ... corresponding to our bibleTranslation property.
   *
   * @returns {string} self's bibleTranslationCode property (ex: '1').
   */
  getBibleTranslationCode() {
    return this.bibleTranslations[this.getBibleTranslation()].code;
  }

  /**
   * Set self's bibleTranslation property.
   *
   * Under the covers:
   * - our persistance store is maintained:
   *   * either device storage (for guest users)
   *   * or Firebase DB (for registered users)
   * - triggers change notifications to registered clients
   *   ... see: onChange()
   * 
   * @param {string} val - The bibleTranslation value to set (ex: 'KJV').
   */
  setBibleTranslation(val) {
    // pass through to our worker object
    this._fwState.setValue('bibleTranslation', val);
  }

  /**
   * Register notificaiton monitors that are triggered when the 
   * bibleTranslation property has changed.
   *
   * @param {onChangeHandlerFn} onChangeHandler - the client supplied listener
   *                            (see: onChange() documentation)
   *
   * @returns void
   *
   * @public
   */
  onBibleTranslationChange(onChangeHandler) {
    // utilize generic handler, filtering pass-through at run-time
    this.onChange( (key) => {
      // filter callbacks ofInterest
      //  - NO key supplied - ALL settings have hanged (our property is part of "all")
      //  - key supplied - only when it is our property interest
      const ofInterest = (!key) || (key === 'bibleTranslation');

      // pass through, when this change matches our filter
      if (ofInterest) {
        onChangeHandler(key);
      }
    });
  }


  //*-----------------------------------------------------------------------------
  //* userName
  //*-----------------------------------------------------------------------------

  /**
   * Get self's userName property ... only referenced for signed-in users (see fwUser).
   *
   * @returns {string} self's userName property (ex: 'KJV').
   */
  getUserName() {
    // pass through to our worker object
    return this._fwState.getValue('userName');
  }

  /**
   * Set self's userName property.
   *
   * Under the covers:
   * - our persistance store is maintained:
   *   * either device storage (for guest users)
   *   * or Firebase DB (for registered users)
   * - triggers change notifications to registered clients
   *   ... see: onChange()
   * 
   * @param {string} val - The userName value to set.
   */
  setUserName(val) {
    // pass through to our worker object
    this._fwState.setValue('userName', val);
  }

  /**
   * Register notificaiton monitors that are triggered when the 
   * userName property has changed.
   *
   * @param {onChangeHandlerFn} onChangeHandler - the client supplied listener
   *                            (see: onChange() documentation)
   */
  onUserNameChange(onChangeHandler) {
    // utilize generic handler, filtering pass-through at run-time
    this.onChange( (key) => {
      // filter callbacks ofInterest
      //  - NO key supplied - ALL settings have hanged (our property is part of "all")
      //  - key supplied - only when it is our property interest
      const ofInterest = (!key) || (key === 'userName');

      // pass through, when this change matches our filter
      if (ofInterest) {
        onChangeHandler(key);
      }
    });
  }

} // end of ... FWSettings class


//*---------------------------------------------------------
//* Create/Promote our singleton fwSettings state object
//*---------------------------------------------------------

/**
 * The FireWithin settings state object singleton.
 *
 *  - A one-and-only singleton, which ALWAYS represents the current
 *    settings state (i.e. it is morphed in-place)!  As a result,
 *    you can hold onto this (say in module scope) and know it is
 *    always accurate.
 *
 *  - It is a "real" object, with methods ... use exclusively
 *    to interact with the state.
 *
 * Usage:
 *   // our settings state singleton object (ALWAYS up-to-date)
 *   import {fwSettings} from './fwSettings.js';
 *
 *   // register reflective code that syncs our UI on ANY setting changes
 *   fwSettings.onChange( (key) => {
 *     ... update UI ... snip snip ...
 *   });         
 *
 *   // register reflective code that syncs bibleTranslation setting changes
 *   fwSettings.onBibleTranslationChange( () => {
 *     ... update UI ... snip snip ...
 *   });         
 *
 *   // update state (triggering persistence and change notifications)
 *   fwSettings.setBibleTranslation('KJV');
 *
 *   // access state
 *   const trans = fwSettings.getBibleTranslation();
 *   const code  = fwSettings.getBibleTranslationCode();
 *
 * API: see FWSettings class (above) for details
 *
 * @public
 */
export const fwSettings = new FWSettings();
