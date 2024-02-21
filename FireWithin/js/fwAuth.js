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
        signInWithPhoneNumber} from './pkg/firebase/auth.js';

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
  // - no longer applicable
  // - at one point, this was on our form (for the purpose of registering enter key to action
  //   * and we needed to prevent form submition
  // - this is NO LONGER THE CASE
  if (event) {
    event.preventDefault();
  }

  // obtain aspects of the sign-in form - including the user supplied phone number (phoneInput)
  const phoneInput = document.getElementById('signInPhoneNum').value.trim();
  const msgElm     = document.getElementById('signInMsg');

  // format phone entry into an E.164 format
  // ... with limited local validation (on US entry only)
  // ... MOST validation occurs in Firebase (via signInWithPhoneNumber() below)
  let phoneE164 = phoneInput; // ... assume entry is already in E.164 format (when "+nnnnn")
  if ( ! phoneInput.startsWith('+') ) { // ... when NO "+", morph US phone entries into E.164 format
    // limited validation: (extract numbers only and insure 10 digits)
    const phoneNumeric = phoneInput.replace(/\D/g, "");
    if (phoneNumeric.length !== 10) {
      msgElm.textContent = "Invalid US phone number ... please enter a 10 digit entry (ex: nnn-nnn-nnnn).";
      return;
    }
    // format into US E.164 format
    // ... [+][country code][subscriber number including area code]
    // ... US: +19995551212
    phoneE164 = `+1${phoneNumeric}`;
  }

  // display the processed number (just for fun)
  msgElm.textContent = `Processeing phone: ${phoneE164}`;

  // setup our reCAPTCHA verifier widget (detecting bots and fraudulent access)
  // - this can be done late in our process
  //   ... this works!
  // - we use an 'invisible' reCAPTCHA widget
  //   ... the user will NOT see the "I'm not a robot" widget
  // - 'signInButton' is the id of the button that was clicked on the form
  //   ... checked by reCAPTCHA (in 'invisible' mode) to verify user is NOT a robot
  //   ... see settings.md (containing our sign-in screens)
  // - NOTE: This verifier IS REQUIRED by signInWithPhoneNumber()
  if (window.recaptchaVerifier) {
    // re-use existing verifier widget, by resetting it
    // - this occurs when handlePhoneSignIn() is invoked multiple times on a given page
    //   * EX: when user errors are involved
    //   * EX: when user signs-out and signs-in while staying on same page
    // - this is the official way to do the reset (from Firebase docs)
    //   * the Firebase docs are VERY CONFUSING in this area
    log(`re-use window.recaptchaVerifier ... reset it`);
    window.grecaptcha.reset( window.recaptchaVerifier.widgetId );
  }
  else {
    // create our verifier widget (the first time)
    // - NOTE: this resource is reset on page loads, 
    //         allowing us to start fresh on our sign-in page (found in settings.md)
    //         ... see: `window.recaptchaVerifier` reference in fw.js
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
  }

  // UI Step 1: Request SMS text message to be sent (containing the verificationCode)
  //            NOTE: This function is executed at the start, and interacts with window.recaptchaVerifier
  log(`111: invoking signInWithPhoneNumber('${phoneE164}')`);
  signInWithPhoneNumber(auth, phoneE164, window.recaptchaVerifier)
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
      fwUser.setVerifying(phoneE164);
    })
    .catch((err) => { // Error: SMS not sent
      // bad phone number - firebase does MORE extensive validation that what we do locally (above)
      if (err.code === 'auth/invalid-phone-number') {
        msgElm.textContent = "The phone Number you entered is invalid, please try again.";
      }
      // SMS Text Limit Exceeded ... Firebase Blaze Plan:
      //  - MY EXPERIENCE (Firebase is very elusive on this):
      //    * 6 txts in rapid sucecssion
      //    * additional texts allowed after 30 mins or so
      else if (err.code === 'auth/too-many-requests') {
        msgElm.textContent = "SMS Text Limit Exceeded.  Try again later ... see note (below)";
        
        // also dynamically enable the full description (giving user more info)
        // ... don't worry about taking this down (KISS: minimal impact to UI experience)
        const domExplainSmsExceeded  = document.getElementById('explain-sms-text-exceeded');
        domExplainSmsExceeded.style.display = 'block';
      }
      // unexpected error <<< KJB: can test this by clicking Sign-In button 2nd time (MUST enable all-three sections of the sign-in screen)
      else {
        const msg = `UNEXPECTED ERROR: in signInWithPhoneNumber().catch(err) ... ${err} ... SMS Text NOT sent`;
        log.f(`${msg}, err: `, {err});
        msgElm.textContent = `Something went wrong in sending the SMS Text ... see logs`;
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
export function handlePhoneVerify(event) {
  event.preventDefault(); // prevent default form submission
  const log = logger(`${logPrefix}:handlePhoneVerify()`);
  log(`verifing code entered by user`);

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

      // MESSAGE NOT NEEDED:
      // ... sign-in screen will morph into signed-in state
      // ... we don't want this message as a remnite, if user signs-out and back in again (on same page)
      // msgElm.textContent = "Welcome ... you are now successfully signed-in!!";
    })
    .catch((err) => {
      if (err.code === 'auth/invalid-verification-code') {
        msgElm.textContent = "The code you entered is NOT correct ... please enter the code you received from the verification text message.";
      }
      else if (err.code === 'auth/code-expired') {
        msgElm.textContent = "The verification time has expired ... please cancel and try again.";
      }
      else if (err.code === 'auth/credential-already-in-use') {
        msgElm.textContent = "This verification code has already been used.";
      }
      else { // unexpected error
        const msg = `UNEXPECTED ERROR: in confirmationResult.confirm().catch(err) ... ${err}`;
        log.f(`${msg}, err: `, {err});
        msgElm.textContent = `Something went wrong in verifying the code ... see logs`;
      }
    });
}


/**
 * Cancel the phone verification process.
 *
 * The user no longer wishes to continue this verification 
 * step of our sign-in process.
 *
 * @public
 */
export function verifyPhoneCancel() {
  const log = logger(`${logPrefix}:verifyPhoneCancel()`);
  log(`canceling phone verifiation request (where code is entered from SMS text msg)`);

  // the primary thing we do is sign-out the user
  // ... BECAUSE we are already in a signed-out mode
  //     just need to clear the phone number
  fwUser.setSignedOut();
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
