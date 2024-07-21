//*-----------------------------------------------------------------------------
//* fwAuth.js: the "authorization" module of the "Fire Within" web-app
//*
//*   - Create/Promote our one-and-only singleton fwUser object
//*   - Manages authentication changes to our fwUser object
//*   - Provides functionality to facilitate sign-in / sign-out
//*
//*-----------------------------------------------------------------------------

// Module Scoped Firebase Initialization: DO EARLY to insure Firebase functionality is available
import './fwInit.js';

import {getAuth, 
        onAuthStateChanged,
        signInWithEmailAndPassword,
        createUserWithEmailAndPassword} from './pkg/firebase/auth.js';

import FWUser from './FWUser.js';

import {fwSettings} from './fwSettings.js';
import {retain_syncDeviceStoreOnSignOut} from './FWState.js';

import {showUnexpectedError} from './util/showUnexpectedError.js';

import logger from './util/logger/index.js';
const  logPrefix = 'fw:auth';
const  log = logger(`${logPrefix}`);


//********************************************************************************
//* Authorization Related
//********************************************************************************

// retain our auth object
// NOTES:
//   - IT IS OK to retain in module scope (Firebase will auto-sync on change)
const auth = getAuth();

// Create/Promote our one-and-only singleton fwUser object
// NOTES:
//  - The returned fwUser represents the one-and-only singleton,
//    which ALWAYS represents the active user (i.e. it is morphed in-place)!
//    As a result, you can hold onto this (say in module scope) 
//    and know it is always accurate.
//  - initially, this object has our default representation of a signed-out user
//    HOWEVER, that will change once re-authentication takes place
export const fwUser = new FWUser();

// monitor Firebase authorization changes (via firebase observer)
//   Examples:
//     - a user sign-in ............ triggered when authentication is successfully completed
//     - a user re-authenticated ... can be many times, because an authenticated user is long-lived (per device)
//     - a user sign-out ........... triggered when sign-out is completed
//   NOTE: fbUser parameter:
//           - is the SAME as auth.currentUser
//             * is synced automatically by Firebase (under the covers)
//           - available properties: 
//             ... https://firebase.google.com/docs/reference/js/auth.user
//                 ex: auth.currentUser.uid
//           - WHEN signed-out, fbUser IS null
//           - WHEN signed-in,  fbUser IS defined -AND- BOTH fbUser.uid/fbUser.email are defined
//                                                      BECAUSE: we are using email authentication exclusively
//   NOTE: there should only be ONE onAuthStateChanged listener in the entire app!
onAuthStateChanged(auth, (fbUser) => {
  const log = logger(`${logPrefix}:onAuthStateChanged()`);

  // define uid/email from fbUser object (see: "fbUser parameter" NOTE - above)
  // ... with protection, insuring empty string ('') EVEN when fbUser.prop is null/undefined
  const uid   = fbUser ? fbUser.uid   : '' || '';
  const email = fbUser ? fbUser.email : '' || '';

  // NO-OP when the user identity has NOT changed
  // ... we are certainly NOT interested in this
  //     - unsure of what scenarios this may be
  //     - it could be this never happens (although check is OK ... just a sanity check)
  //       ... place log to be FORCED, to get a better feel (if it happens, what is the SCENARIO)
  if (fwUser._uid === uid) {
    log.f(`user identity (uid) has NOT changed ... NO-OPing`, {fwUser, fbUser});
  }
  // PROCESS the user identity changes
  else {
    log(`user identity (uid) HAS changed ... apply to fwUser -AND- notify observers of this change`, {fwUser, fbUser});

    // morph our fwUser into a representation of the current active user
    // ... this will automatically trigger FWUser change notifications
    fwUser.morphIdentity(uid, email);
  }
});


//********************************************************************************
//* Sign-In / Sign-Out Related
//********************************************************************************

/**
 * Sign-In existing user with email/pass (obtained from form elements).
 *
 * CURRENTLY: has tight integration to our UI sign-in form (found in settings.md).
 *
 * @param {FormEvent} event - the form event for this request.
 *
 * @public
 */
// ?? NEW NEW NEW NEW
export function handleSignInWithEmailPass(event) {
  const log = logger(`${logPrefix}:handleSignInWithEmailPass()`);

  // prevent default form submission
  // - no longer applicable ?? verify if needed? ... I THINK I NEED IT when form submition
  // - at one point, this was on our form (for the purpose of registering enter key to action
  //   * and we needed to prevent form submition
  // - this is NO LONGER THE CASE
  if (event) {
    event.preventDefault();
  }

  log(`here we are in our new code that implements SignIn with email/pass`);

  // obtain aspects of the sign-in form - including the user supplied email/pass
  const email   = document.getElementById('username').value.trim();
  const pass    = document.getElementById('current-password').value.trim();
  const msgElm  = document.getElementById('signInMsg');

  // clear any prior message - don't want it lingering when this function has success
  msgElm.textContent = "";

  // validate email/pass
  if (email.length === 0) {
    msgElm.textContent = "Email IS required.";
    return;
  }
  if (pass.length === 0) {
    msgElm.textContent = "Password IS required.";
    return;
  }
  // ?? more validations ... does Firebase do further validations? ... possibly in creation of account

  // invoke Firebase email/pass SignIn
  log(`invoking FireBase signInWithEmailAndPassword( for '${email}')`);
  if (pass === 'poop') { // ?? very temp
    msgElm.textContent = "'poop' is NOT a valid password.";
    return;
  }
  signInWithEmailAndPassword(auth, email, pass)
    .then((userCredential) => {
      // user signed in successfully
      log(`in signInWithEmailAndPassword() .then() ... HAPPY PATH ... User Signed In ... it worked!`);

      // user signed in successfully ... assume get notification from listener
      const fbUser = userCredential.user;

      // morph our user interface into a confirmation that the user is signed-in
      // ... this is accomplished via the responsive monitors of the change to our user
      // NOTE: this is NOT needed, as it is accomplished in the onAuthStateChanged() listener (above)
      // fwUser.setSignedIn(fbUser.uid, fbUser.email);

      // MESSAGE NOT NEEDED:
      // ... sign-in screen will morph into signed-in state
      // ... we don't want this message as a remnite, if user signs-out and back in again (on same page)
      // msgElm.textContent = "Welcome ... you are now successfully signed-in!!";
    })
    .catch((err) => {
      const errCode = err.code;
      const errMsg  = err.message;

      if (errCode === 'auth/invalid-credential') {
        msgElm.textContent = "The email/password you entered are NOT valid credentials ... please correct and re-try.";
      }
      // ?? ARE THERE OTHER CODES TO CHECK?
      else { // unexpected error
        const msg = `UNEXPECTED ERROR: in firebase signInWithEmailAndPassword().catch(err) ... ${err}`;
        log.f(`${msg}, err: `, {errCode, errMsg, err});
        msgElm.textContent = `Something went wrong in Sign In ... see logs`;
      }
    });
}

/**
 * Sign-Up new user with email/pass (obtained from form elements).
 *
 * CURRENTLY: has tight integration to our UI sign-in form (found in settings.md).
 *
 * @param {FormEvent} event - the form event for this request.
 *
 * @public
 */
// ?? NEW NEW NEW NEW
export function handleSignUpWithEmailPass(event) { // ?? SUSPECT event is NOT the form ... not really using this however
  const log = logger(`${logPrefix}:handleSignUpWithEmailPass()`);

  // prevent default form submission
  // - no longer applicable ?? verify if needed?
  // - at one point, this was on our form (for the purpose of registering enter key to action
  //   * and we needed to prevent form submition
  // - this is NO LONGER THE CASE
  if (event) {
    event.preventDefault();
  }

  log(`here we are in our new code that implements SignUp with email/pass`);

  // obtain aspects of the sign-in form - including the user supplied email/pass
  const email   = document.getElementById('username').value.trim();
  const pass    = document.getElementById('current-password').value.trim();
  const msgElm  = document.getElementById('signInMsg');

  // validate email/pass
  if (email.length === 0) {
    msgElm.textContent = "Email IS required.";
    return;
  }
  if (pass.length === 0) {
    msgElm.textContent = "Password IS required.";
    return;
  }
  // ?? more validations ... does Firebase do further validations? ... possibly in creation of account <<< HERE in SignUp

  // invoke Firebase email/pass SignUp
  log(`invoking FireBase createUserWithEmailAndPassword( for '${email}')`);
  if (pass === 'poop') { // ?? very temp
    msgElm.textContent = "'poop' is NOT a valid password.";
    return;
  }
  createUserWithEmailAndPassword(auth, email, pass)
    .then((userCredential) => {
      // user signed up / in successfully
      log(`in createUserWithEmailAndPassword() .then() ... HAPPY PATH ... User Signed Up / In ... it worked!`);

      // user signed in successfully ... assume get notification from listener
      const fbUser = userCredential.user;

      // morph our user interface into a confirmation that the user is signed-in
      // ... this is accomplished via the responsive monitors of the change to our user
      // NOTE: this is NOT needed, as it is accomplished in the onAuthStateChanged() listener (above)
      // fwUser.setSignedIn(fbUser.uid, fbUser.email);

      // MESSAGE NOT NEEDED:
      // ... sign-in screen will morph into signed-in state
      // ... we don't want this message as a remnite, if user signs-out and back in again (on same page)
      // msgElm.textContent = "Welcome ... you are now successfully signed-in!!";
    })
    .catch((err) => {
      const errCode = err.code;
      const errMsg  = err.message;

      if (errCode === 'auth/weak-password') { // NOTE: Firebase has VERY MINIMAL REQUREMENTS
        msgElm.textContent = errMsg;          //       EX: Password should be at least 6 characters (auth/weak-password).
      }
      // ??$$ CURRENT POINT ********************************************************************************
      // ?? any other codes to check?
      else { // unexpected error
        const msg = `UNEXPECTED ERROR: in firebase createUserWithEmailAndPassword().catch(err) ... ${err}`;
        log.f(`${msg}, err: `, {errCode, errMsg, err});
        msgElm.textContent = `Something went wrong in Sign Up ... see logs`;
      }
    });
}


/**
 * sign-out of our account
 *
 * @public
 */
export function signOut() {
  const log = logger(`${logPrefix}:signOut()`);

  // instruct FWState how to syncDeviceStoreOnSignOut
  retain_syncDeviceStoreOnSignOut( fwSettings.isSyncDeviceStoreOnSignOut() );

  // this signs out user from a single device
  auth.signOut()
      .then(() => { // sign-out successful

        log(`sign-out successful`);

        // we are signed-out so clear fWUser's sign-out confirmation setting
        fwUser.cancelSignOutConfirmation();

        // morph our user interface into a guest user
        // ... this is accomplished via the responsive monitors of the change to our user
        // NOTE: this is NOT needed, as it is accomplished in the onAuthStateChanged() listener (above)
        // fwUser.setSignedOut();
      })
      .catch((err) => {
       showUnexpectedError(log, 'sign-out user', err);
      });
}

/**
 * request sign-out confirmation of our account
 *
 * @public
 */
export function requestSignOutConfirmation() {
  const log = logger(`${logPrefix}:requestSignOutConfirmation()`);

  // simply update fWUser's sign-out confirmation setting
  // ... this will reflect appropriatly
  fwUser.requestSignOutConfirmation();
}

/**
 * cancel sign-out confirmation of our account
 *
 * @public
 */
export function cancelSignOutConfirmation() {
  const log = logger(`${logPrefix}:cancelSignOutConfirmation()`);

  // simply update fWUser's sign-out confirmation setting
  // ... this will reflect appropriatly
  fwUser.cancelSignOutConfirmation();
}
