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
        createUserWithEmailAndPassword,
        sendPasswordResetEmail}          from './pkg/firebase/auth.js';

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
  log(`processing`);

  // prevent default form submission
  event.preventDefault();

  // obtain aspects of the sign-in form - including the user supplied email/pass
  const email   = document.getElementById('username').value.trim();
  const pass    = document.getElementById('current-password').value.trim();
  const msgElm  = document.getElementById('signInMsg');

  // clear any prior message - don't want it lingering when this function has success
  msgElm.textContent = "";

  // validate email/pass
  // ... email
  if (email.length === 0) {
    msgElm.textContent = "Email IS required.";
    return;
  }
  // ... password
  if (pass.length === 0) {
    msgElm.textContent = "Password IS required.";
    return;
  }
  // ... no more validations required
  //     - either the credentials exist or not (as determined by Firebase)

  // invoke Firebase email/pass SignIn
  if (pass === 'poop') { // ?? very temp (allowing us to enter code without executing)
    msgElm.textContent = "'poop' is NOT a valid password.";
    return;
  }
  log(`invoking FireBase signInWithEmailAndPassword( for '${email}')`);
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
        msgElm.textContent = "The Email/Password you entered are NOT valid credentials ... please correct and re-try.";
      }
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
export function handleSignUpWithEmailPass(event) {
  const log = logger(`${logPrefix}:handleSignUpWithEmailPass()`);
  log(`processing`);

  // prevent default form submission
  event.preventDefault();

  // obtain aspects of the sign-in form - including the user supplied email/pass
  const email   = document.getElementById('username').value.trim();
  const pass    = document.getElementById('current-password').value.trim();
  const msgElm  = document.getElementById('signInMsg');

  // clear any prior message - don't want it lingering when this function has success
  msgElm.textContent = "";

  // validate email/pass
  // ... email
  //     NOTE: actual email format is validated by html ... <input type="email">
  if (email.length === 0) {
    msgElm.textContent = "Email IS required.";
    return;
  }
  // ... password
  if (pass.length === 0) {
    msgElm.textContent = "Password IS required.";
    return;
  }
  // ... password strength
  if (!isPasswordStrong(pass)) {
    msgElm.innerHTML = "Password must be a minimum of 8 alpha-numeric characters, <br/>... with at least ONE lower-case, upper-case, number, and special-character.";
    return;
  }

  // invoke Firebase email/pass SignUp
  if (pass === 'poop') { // ?? very temp (allowing us to enter code without executing)
    msgElm.textContent = "'poop' is NOT a valid password.";
    return;
  }
  log(`invoking FireBase createUserWithEmailAndPassword( for '${email}')`);
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
                                              
      if (errCode === 'auth/weak-password') { // NOTE: Firebase has VERY MINIMAL REQUREMENTS: minimum of 6 chars
        msgElm.textContent = errMsg;          //       Should never get this, because I have more rigid pre-check (see "password strength" above)
      }
      else if (errCode === 'auth/email-already-in-use') {
        msgElm.innerHTML = `This email is already being used as an "account identifier".  <br/>... If this is you, "Sign In" with your existing password.  <br/>... If this is NOT you, someone else is using your email as an "account identifer" :-(`;
      }
      else { // unexpected error
        const msg = `UNEXPECTED ERROR: in firebase createUserWithEmailAndPassword().catch(err) ... ${err}`;
        log.f(`${msg}, err: `, {errCode, errMsg, err});
        msgElm.textContent = `Something went wrong in Sign Up ... see logs`;
      }
    });
}


/**
 * Verify the supplied password is of the proper strength.
 *
 * ... a minimum of 8 alpha-numeric characters, 
 *     with at least ONE lower-case, upper-case, number, and special-character
 *
 * @param {string} pass - the password to check.
 *
 * @returns {boolean} true: IS strong, false: is NOT strong.
 */
// ?? NEW NEW NEW NEW
function isPasswordStrong(pass) {
  // regular expression guide:
  // ^(?=.*[a-z]):          Asserts that there is at least one lowercase letter
  // (?=.*[A-Z]):           Asserts that there is at least one uppercase letter
  // (?=.*\d):              Asserts that there is at least one number
  // (?=.*[@$!%*?&]):       Asserts that there is at least one special character
  // [A-Za-z\d@$!%*?&]{8,}: Matches any combination of alphanumeric characters and special characters for a minimum of 8 characters
  const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passRegex.test(pass);
}


/**
 * Request my password to be reset.
 *
 * CURRENTLY: has tight integration to our UI sign-in form (found in settings.md).
 *
 * @param {FormEvent} event - the form event for this request.
 *
 * @public
 */
// ?? NEW NEW NEW NEW
export function handlePasswordReset(event) {
  const log = logger(`${logPrefix}:handlePasswordReset()`);
  log(`processing`);

  // prevent default form submission
  event.preventDefault();

  // obtain aspects of the sign-in form - including the user supplied email
  const email   = document.getElementById('username').value.trim();
  const msgElm  = document.getElementById('signInMsg');

  // clear any prior message - don't want it lingering when this function has success
  msgElm.textContent = "";

  // validate email
  // ... email
  //     NOTE: actual email format is validated by html ... <input type="email">
  if (email.length === 0) {
    msgElm.innerHTML = "Email IS required! <br/> - Supply the email used for your account. <br/> - We will send an email that facilitates the resetting of your password.";
    return;
  }

  // invoke Firebase reset password request
  log(`invoking FireBase sendPasswordResetEmail( for '${email}')`);
  sendPasswordResetEmail(auth, email)
    .then(() => {
      // email sent successfully
      log(`in sendPasswordResetEmail() .then() ... HAPPY PATH ... Email has been sent to facilitate password reset!`);
      msgElm.textContent = `An email has been sent to ${email} that facilitates the resetting of your password.`;
    })
    .catch((err) => {
      const errCode = err.code;
      const errMsg  = err.message;

      const msg = `UNEXPECTED ERROR: in firebase sendPasswordResetEmail().catch(err) ... ${err}`;
      log.f(`${msg}, err: `, {errCode, errMsg, err});
      msgElm.textContent = `Something went wrong in Sign Up ... see logs`;
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
