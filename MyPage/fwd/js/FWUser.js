// our settings state singleton object (ALWAYS up-to-date)
import {fwSettings} from './fwSettings.js';

import logger from './util/logger/index.js';
const logPrefix = `fw:user`;

/**
 * Represents a user in the FW system.
 *
 * NOTE: We do NOT use the "# private field" specification, in order
 *       to gain MUCH HIGHER browser compatability:
 *       - we pick up Safari Usage
 *       - and MUCH older Browser versions
 *       - SHOULD WE WANT to utilize "# private field":
 *         ... simply replace "_" with "#"
 *
 *                    Support For:   Support For:   Support For:
 *                    # syntax       Class Only     ES Module
 *                    -------------  -------------  -------------
 *           Browser  Ver  Released  Ver  Released  Ver  Released
 *           =======  ===  ========  ===  ========  ===  ========
 *           Chrome   94+  May 2022  49+  Mar 2016  61+  Sep 2017
 *           Firefox  98+  Dec 2022  45+  Sep 2016  60+  May 2018
 *           Edge     98+  Dec 2022  12+  Jul 2015  16+  Apr 2018
 *           Safari   No      -      9+   Sep 2015  10+  Jun 2017
 *           IE       No      -      9+   Mar 2011  No      -    
 *
 * @class FWUser
 */
export default class FWUser {

  /**
   * Create an FWUser object from the supplied parameters.
   *
   * @constructor
   */
  constructor() {
    // initial state
    // ... carve out the collector of registered observers to changes of self
    this._onChangeHandlers = [];
    // ... sign-out confirmation
    this._confirmSignOut = false;
    // ... always starts out as signed-out
    this.setSignedOut();

    // BECAUSE our userName abstraction depends on fwSettings.userName,
    // we monitor userName changes in fwSettings -and- mark self as changed
    fwSettings.onUserNameChange( () => {
      if (this.isSignedIn()) { // we ONLY use fwSettings.userName WHEN user is signed-in
        this.notifyChanged();
      }
    });
  }

  /**
   * The user's unique identifier (via Firebase), -or- '' for signed-out.
   * @private
   * @type {string}
   */
  _uid;

  /**
   * The user's email ... possibly verified depending on if _uid is defined.
   * @private
   * @type {string}
   */
  _email;

  /**
   * Return an indicator as to whether this user is signed-in or not.
   *
   * @returns {boolean} true: signed-in, false: signed-out.
   */
  isSignedIn() {
    return this._uid ? true : false; // ... signed-in when uid defined
  }

  /**
   * Return an indicator as to whether this user is signed-out or not.
   *
   * @returns {boolean} true: signed-out, false: signed-in.
   */
  isSignedOut() {
    return !this.isSignedIn(); // ... opposite of signed-in
  }

  /**
   * Return an indicator as to whether this user is in the process of
   * verifying their email (they have to be signed-out to do this).
   *
   * @returns {boolean} true: verifying their email -and- signed-out, false: NOT verifying their email.
   */
  //?$ TRASH
  //? isVerifying() {
  //?   return this.isSignedOut() && this._email;
  //? }

  /**
   * Return self's email (used as the authenticating authority).
   *
   * @returns {string} self's email.
   */
  getEmail() {
    return this._email;
  }

  /**
   * Return self's publicly consumable user name - somewhat
   * resembling a first name.
   *
   * This will be:
   * - 'Guest' for signed-out users
   * - for signed-in users
   *   * fwSettings.userName
   *   * fallback to the email account (content before the "@")
   *
   * @returns {string} self's publically consumable user name.
   */
  getUserName() {
    // signed-out users are ALWAYS 'Guest'
    if (this.isSignedOut()) {
      return 'Guest';
    }
    
    // for signed-in users, use our setting's userName (when defined)
    // ... fallback to the email account (content before the "@")
    const atIndx   = this._email.indexOf('@');
    const userName = atIndx === -1 ? '' : this._email.substring(0, atIndx);
    return fwSettings.getUserName() || userName;
  }

  // AI: toString() may be nice (for logs) SINCE our object is mutated
  // ... showing userName and email (when signed-in) ... NOT uid (too sensitive)

  //*----------------------------------------------------------------------------
  //* Various setters, changing the user identiy as follows:
  //* 
  //*                             _uid   _email
  //*                             ====    ====
  //*  - constructor()              ''      ''  ... via setSignedOut() ... always starts out as signed-out
  //*  - setSignedIn(uid, email)     Y       Y  ... technically NOT used (implicitly done by FireBase user identity changes (see: onAuthStateChanged() of fwAuth.js)
  //*  - setSignedOut()             ''      ''  ... technically NOT used (implicitly done by FireBase user identity changes (see: onAuthStateChanged() of fwAuth.js)
  //*  - morphIdentity()             Y       Y  ... via FireBase user identity changes (see: onAuthStateChanged() of fwAuth.js)
  //*                                               equivalent to either: setSignedIn() or setSignedOut()
  //*
  //* All these methods automatically trigger FWUser change notifications.
  //*
  //* NOTE: They should be considered private methods, only available
  //*       to the proper authority.
  //*----------------------------------------------------------------------------

  /**
   * Set self to a signed-in state.
   *
   * @param {string} uid   - The user's unique identifier (via Firebase)
   * @param {string} email - The user's verified email number ("sign-in with email"),.
   *
   * @private
   */
  setSignedIn(uid, email) {
    // ... with protection, insuring null/undefined is ''
    this._uid   = uid    || '';;
    this._email = email  || '';;
    this.notifyChanged();
  }

  /**
   * Set self to a signed-out state.
   *
   * @private
   */
  setSignedOut() {
    this._uid   = '';
    this._email = '';
    this.notifyChanged();
  }

  /**
   * Set self to an identity defined by FireBase user identity changes
   * (see: onAuthStateChanged() of fwAuth.js)
   *
   * This will either end up as a 
   *  - sign-in (with BOTH values), 
   *  - or sign-out (both values as '')
   *
   * @param {string} uid   - The user's unique identifier (via Firebase)
   * @param {string} email - The user's verified email ("sign-in with email"),.
   *
   * @private
   */
  morphIdentity(uid, email) {
    // change's user identity of self
    // ... with protection, insuring null/undefined is ''
    this._uid   = uid   || '';
    this._email = email || '';

    // trigger change notifications
    this.notifyChanged();
  }


  //********************************
  //* sign-out confirmation related
  //********************************

  /**
   * Indicate in self that we are requesting a sign-out verification.
   * @private
   */
  requestSignOutConfirmation() {
    // change our setting
    this._confirmSignOut = true;
    // trigger change notifications
    this.notifyChanged();
  }

  /**
   * Indicate in self that we are NOT requesting a sign-out verification.
   * @private
   */
  cancelSignOutConfirmation() {
    // change our setting
    this._confirmSignOut = false;
    // trigger change notifications
    this.notifyChanged();
  }

  /**
   * Return self's indicator as to whether we are requesting a sign-out verification.
   *
   * @returns {string} see description.
   */
  isSignOutBeingConfirmed() {
    return this._confirmSignOut;
  }


  //******************************************
  //* Promote Changes to Interested Observers
  //******************************************

  /**
   * Registered observers of self's change.
   *
   * @type {[onChangeHandlerFn]} 
   *
   * @private
   */
  _onChangeHandlers;
  
  /**
   * Register notificaiton monitors that are triggered when self
   * has changed.
   *
   * NOTE: These monitors are invoked ONLY when the identity of the
   *       fwUser has changed!
   *       In Other Words: a sign-in, or a sign-out, or a re-authentication.
   *
   * @param {onChangeHandlerFn} onChangeHandler - the client supplied monitor.
   *        API:
   *          onChangeHandlerFn(): void
   *            NOTE: The change is automatically reflected in self's object instance.
   *
   * @returns void
   *
   * @public
   */
  onChange(onChangeHandler) {
    this._onChangeHandlers.push(onChangeHandler);
  }

  /**
   * Trigger change notifiations on self.
   *
   * @returns void
   *
   * @private
   */
  notifyChanged() {
    const log = logger(`${logPrefix}:notifyChanged()`);
    log(`fwUser has changed: uid: '${this._uid}', email: '${this._email}'`);
    this._onChangeHandlers.forEach( (handler) => handler() );
  }
    
}
