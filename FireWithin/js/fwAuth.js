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
        RecaptchaVerifier, 
        signInWithPhoneNumber}    from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import FWUser from './FWUser.js';

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
//           - WHEN signed-in,  fbUser IS defined -AND- BOTH fbUser.uid/fbUser.phoneNumber are defined
//                                                      BECAUSE: we are using phone authentication exclusively
//   NOTE: there should only be ONE onAuthStateChanged listener in the entire app!
onAuthStateChanged(auth, (fbUser) => {
  const log = logger(`${logPrefix}:onAuthStateChanged()`);

  // define uid/phone from fbUser object (see: "fbUser parameter" NOTE - above)
  // ... with protection, insuring empty string ('') EVEN when fbUser.prop is null/undefined
  const uid   = fbUser ? fbUser.uid         : '' || '';
  const phone = fbUser ? fbUser.phoneNumber : '' || '';

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
    fwUser.morphIdentity(uid, phone);
  }
});


//********************************************************************************
//* Sign-In / Sign-Out Related
//********************************************************************************

// confirmationResult from signInWithPhoneNumber() callback
// ... used in Step 2: verifying the OTP code received from the text message
let _confirmationResult = null;

/**
 * Step 1 of our sign-in process.
 *
 * Request SMS text message to be sent, containing a verification code.
 *
 * CURRENTLY: has tight integration to our UI sign-in form.
 *
 * @param {FormEvent} event - the form event for this request.
 *
 * @public
 */
export function handlePhoneSignIn(event) {
  const log = logger(`${logPrefix}:handlePhoneSignIn()`);

  // prevent default form submission
  event.preventDefault();

  // obtain aspects of the sign-in form - including the user supplied phone number
  const phoneUser = document.getElementById('signInPhoneNum').value.trim();
  const msgElm    = document.getElementById('signInMsg');

  // ?? refine phone entry to support common US phone (as below), but also allow pass-through E.164 option for international use (begin with +)
  // validate/format the phoneUser
  // ... remove non-numeric characters: 9995551212
  const phoneNumeric = phoneUser.replace(/\D/g, "");
  // ... insure 10 digits
  if (phoneNumeric.length !== 10) {
    msgElm.textContent = "Invalid phone number. Please enter 10 digits.";
    return;
  }
  // ... format for human consumption: 999-555-1212
  const phoneFormattedUS = `${phoneNumeric.slice(0, 3)}-${phoneNumeric.slice(3, 6)}-${phoneNumeric.slice(6)}`;

  // signInWithPhoneNumber() requires an E.164 format
  // ... [+][country code][subscriber number including area code]
  // ... US: +19995551212
  const phoneE164 = `+1${phoneNumeric}`;

  // display the processed number (just for fun)
  msgElm.textContent = `Processeing phone: ${phoneFormattedUS}`;

  // setup our reCAPTCHA verifier widget (detecting bots and fraudulent access)
  // - this can be done late in our process
  //   ... this works!
  // - we use an 'invisible' reCAPTCHA widget
  //   ... the user will NOT see the "I'm not a robot" widget
  // - 'signInButton' is the id of the button that was clicked on the form
  //   ... checked by reCAPTCHA (in 'invisible' mode) to verify user is NOT a robot
  // - NOTE: This verifier IS REQUIRED by signInWithPhoneNumber()
  //         -and- must be created EACH TIME
  log(`defining window.recaptchaVerifier`);
  window.recaptchaVerifier = new RecaptchaVerifier(auth, 'signInButton', {
    'size': 'invisible',
    // NOTE: These callbacks are invoked FROM signInWithPhoneNumber()
    //       KJB: I think they are WORTHLESS,
    //            I am STRCITLY processing all logic paths via signInWithPhoneNumber()
    //            COMMENT OUT / DISABLE
    // 'callback': (response) => {  // ? the happy path ... it worked
    //   const msg = `222: in RecaptchaVerifier 'callback' ... what do I do? ... SUSPECT should just work with signInWithPhoneNumber() ... KEY: which will be subsequently called`;
    //   log(msg);
    //   msgElm.textContent = msg;
    // },
    // 'expired-callback': () => { // response expired ... ask user to solve reCAPTCHA again
    //   const msg = `222: in RecaptchaVerifier 'expired-callback' ... what do I do? ... SUSPECT should just work with signInWithPhoneNumber() ... KEY: which will be subsequently called`;
    //   log(msg);
    //   msgElm.textContent = msg;
    // },
  });

  // UI Step 1: Request SMS text message to be sent (containing the verificationCode)
  //            NOTE: This is initiated FIRST, and interacts with the appVerifier
  const appVerifier = window.recaptchaVerifier;
  log(`111: invoking signInWithPhoneNumber() `, {phoneUser, phoneNumeric, phoneFormattedUS, phoneE164});
  signInWithPhoneNumber(auth, phoneE164, appVerifier)
    .then((confirmationResult) => { // SMS Text has been sent

      log(`333: in signInWithPhoneNumber() .then() ... HAPPY PATH ... SMS Text SENT ... it worked!`);

      // update UI (just for fun)
      // ... NOT THIS, because the user will NOT see it, as the UI is morphed into Step 2
      // msgElm.textContent = `SMS Text has been sent`;
      // ... RATHER clear sign-in message to remove any residual residue (should we come back to this page)
      msgElm.textContent = '';

      // retain our confirmationResult for use in Step 2
      _confirmationResult = confirmationResult;

      // morph our user interface into a prompt for the user to enter the OTP code received from the text
      // ... this is accomplished via the responsive monitors of the change to our user
      fwUser.setVerifying(phoneFormattedUS);
    })
    .catch((err) => { // Error: SMS not sent
      if (err.code === 'auth/invalid-phone-number') { // bad phone number (something we didn't find in our local validation - above)
        msgElm.textContent = "The phone Number you entered is invalid, please try again.";
      }
      // SMS Text Limit Exceeded ... Firebase Blaze Plan:
      //  - 6 txts in rapid sucecssion
      //  - additional texts allowd after 30 mins or so
      else if (err.code === 'auth/too-many-requests') {
        msgElm.textContent = "SMS Text Limit Exceeded.  Try again later ... see note (below)";
        // ?? AI: also enable full description on screen
      }
      else { // unexpected error <<< KJB: can test this by clicking Sign-In button 2nd time (MUST enable all-three sections of the sign-in screen)
        const msg = `UNEXPECTED ERROR: in signInWithPhoneNumber().catch(err) ... ${err} ... SMS Text NOT sent`;
        log.f(`${msg}, err: `, {err});
        msgElm.textContent = `Something went wrong in sending the SMS Text ... see logs`;

        // reset the reCAPTCHA so the user can try again
        // ... KJB: WHAAA: have NO idea what this is <<< forget it
        // grecaptcha.reset(window.recaptchaWidgetId);
      }
    });

}

/**
 * Step 2 of our sign-in process.
 *
 * Confirm verificationCode entered from user.
 *
 * CURRENTLY: has tight integration to our UI sign-in form.
 *
 * @param {FormEvent} event - the form event for this request.
 *
 * @public
 */
export function handlePhoneVerification(event) {
  event.preventDefault(); // prevent default form submission
  const log = logger(`${logPrefix}:handlePhoneVerification()`);

  // obtain aspects of the verificaion form - including the user supplied code
  const verificationCode = document.getElementById('verifyCode').value.trim();
  const msgElm           = document.getElementById('verifyMsg');

  // validate the code
  // ... verify only digits
  if ( ! /^\d+$/.test(verificationCode) ) {
    msgElm.textContent = "The digit verification code must be all numeric.";
    return;
  }
  // ... insure 6 digits
  if (verificationCode.length !== 6) {
    msgElm.textContent = "Please enter a 6 digit verification code.";
    return;
  }

  // UI Step 2: Confirm verificationCode entered from user
  // ... sign-in the user with the verification code
  _confirmationResult.confirm(verificationCode)
    .then((userCredential) => {
      // user signed in successfully ... assume get notification from listener
      const fbUser = userCredential.user;

      // morph our user interface into a confirmation that the user is signed-in
      // ... this is accomplished via the responsive monitors of the change to our user
      // NOTE: this is NOT needed, as it is accomplished in the onAuthStateChanged() listener (above)
      // fwUser.setSignedIn(fbUser.uid, fbUser.phoneNumber);

      msgElm.textContent = "Welcome ... you are now successfully signed-in!!";
    })
    .catch((err) => {
      if (err.code === 'auth/invalid-verification-code') {
        msgElm.textContent = "The code you entered is NOT correct ... please enter the code you received from the verification text message.";
      }
      else { // unexpected error
        const msg = `UNEXPECTED ERROR: in confirmationResult.confirm().catch(err) ... ${err}`;
        log.f(`${msg}, err: `, {err});
        msgElm.textContent = `Something went wrong in verifying the code ... see logs`;
      }
    });
}

/**
 * sign-out of our account
 *
 * @public
 */
export function handleSignOut() {
  const log = logger(`${logPrefix}:handleSignOut()`);

  // this signs out user from a single device
  auth.signOut()
      .then(() => { // sign-out successful

        log(`sign-out successful`);

        // morph our user interface into a guest user
        // ... this is accomplished via the responsive monitors of the change to our user
        // NOTE: this is NOT needed, as it is accomplished in the onAuthStateChanged() listener (above)
        // fwUser.setSignedOut();
      })
      .catch((err) => {
        showUnexpectedError(log, 'sign-out user', err);
      });
}
