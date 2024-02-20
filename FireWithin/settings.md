# Settings

The _**"Fire Within"**_ Bible Study Guide has a small number of **User
Preference** settings _(found here)_, which are retained between
sessions.  In other words, you can leave the site and come back, and
these settings will be remembered.

M{ injectSyncNote(`settings`) }M

## Bible Translation

All scripture references within this site utilize the [YouVersion
Bible App](https://www.youversion.com/), which supports many different
Bible Translations.  You can specify which version you wish to use
through this setting:

<select id="bibleTranslations"></select>
<script>
  withFW( ()=>fw.genBibleTranslationsSelection('bibleTranslations') )
</script>

Your active Bible Translation is visible at the top of the LeftNav
Bar.

> Please Note that this list is just a few of the more popular
> translations.  If the one you wish to use is not in this list,
> please contact me and I will be glad to add it.
>
> You can reach me at
> <span id="inquire"></span>
> or Direct Message me on [Twitter](https://twitter.com/kevinast)

<script>
  withFW( ()=>fw.addInquire('Fire%20Within%20Bible%20Translation%20Request') )
</script>


## User Account

P{ inject('<div id="sign-in-form-guest">') }P

**You are a Guest User**

The Fire Within page does NOT require an account to use.  By default,
you are a "Guest" user.

For "Guest" users, we maintain your state on your local device.
**Your state consists of your _completions_ and _settings_.**. The
**only limitation** of this approach is when you use multiple devices
_(say your laptop and your phone)_ ... then you must manually sync
your state across all the devices you use _(because each device has
it's own copy of the state)_.

To overcome this limitation, you can **establish a Fire Within user
account**.  When you do this, your state is maintained in the cloud,
and **automatically syncs across all devices** _(that are signed-in to
the same account)_.

**Creating an account is easy**.  We simply use your phone number as
an account identifier.  Your phone is "verified" by texting a
temporary "verification code", which you use to sign-in.  **It's that
simple** _(no need to remember "yet another password")_.  Because the
sign-in is "long lived", you only have to do this once _(per device)_
... unless you sign-out for some reason.

<!-- Our sign-in form, that gathers phone number.
     - A "submit" button type is used to facilitate auto submit on text-box enter
     - The id on the "submit" button IS REQUIRED to integrate with the invisible
       "reCAPTCHA verifier widget" ... see: js/fwAuth.js
 -->
<form id="signInForm" onsubmit="fw.handlePhoneSignIn(event)">
    <label for="signInPhoneNum">Phone:</label>
    <input type="tel" id="signInPhoneNum" name="signInPhoneNum" placeholder="nnn-nnn-nnnn">
    <button type="submit" id="NOT_signInButton">Sign In</button>
    <i>standard text rates apply</i>
    <p id="signInMsg" style="color: red;"></p>
</form>

<!-- OK ... This is REALLY QUERKY ...
     - when the "signInButton" is registered to the submit button (above)
       * it works the first time
       * but it no-ops on subsequent attempts (when user errors/msgs are in the mix)
     - when the "signInButton" is registered outside the form, it works in ALL cases
       * and appariently it does NOT have to be on a button that is clicked
     - FYI: this is where the "invisible" reCAPTCHA verifier widget is rendered
 -->
<div id="signInButton"></div>

- **International Users:** use a direct E.164 format _(beginning with "+")_

- <mark><b>IMPORTANT:</b></mark> When your account is first created
  _(the first time you sign-in)_, the state **from your device** will be
  **transferred to the cloud**.  As a result, your **initial sign-in**
  should be done **on the device that has the most accurate state.**

  - Remember, for Guest users, each device has it's own copy of the
    state.

  - The state transfer _(from device to cloud)_ only happens one time:
    **the first time you sign-in!**

  - For all subsequent sign-ins, the cloud will have already been
    established _(from your first sign-in)_, and is considered the
    master.

P{ inject('<div id="explain-sms-text-exceeded" style="display: none;">') }P

<mark><b>SMS Text Limit Exceeded:</b></mark>
- Fire Within accounts use an entry-level service plan to persist it's data in the cloud
- This plan is limits the number of SMS Text messages allowed at a given time
- If you receive an **"SMS Text Limit Exceeded"** message, simply try again in a short time _(20-30 mins)_
- This **limitation should NOT be an issue** because sign-ins are **"long lived"** _(basically forever)_
  ... _in other words, sign-ins do not need to be repeated on a given device, unless you sign-out for some reason_

P{ inject('</div>') }P

P{ inject('</div> <div id="sign-in-form-verifying" style="color: green;">') }P

Your sign-in request is **in-progress**.

A text message has been sent to your phone at: M{ userPhone() }M.

To complete your sign-in, please enter the verification code _(from that text)_.

<!-- Our verification form, that gathers the one-time-code.
     - A "submit" button type is used to facilitate auto submit on text-box enter
 -->
<form id="verifyForm" onsubmit="fw.handlePhoneVerify(event)">
    <label for="verifyCode">Code:</label>
    <input type="text" id="verifyCode" name="verifyCode">
    <button type="submit">Verify</button>
    <button onclick="fw.verifyPhoneCancel(); return false;">Cancel</button>
    <p id="verifyMsg" style="color: red;"></p>
</form>


P{ inject('</div> <div id="sign-in-form-verified" style="color: blue;">') }P

Hello M{ userName() }M,

You have signed-in to your Fire Within account, using phone: M{ userPhone() }M.

As a result, your state _(i.e. completions and settings)_ are retained
in the cloud, and automatically synced to all devices _(that are
signed in to this account)_.

<div>
As a signed-in user, you may change your name here:
<input type="text" id="maintainUserName" maxlength="15" onblur="fw.maintainUserName(event)"/>
<p id="maintainUserNameMsg" style="color: red;"></p>
</div>

Your sign-in is **long lived**, so you do not need to sign-in again
_(on this device)_ ... _unless you sign-out for some reason_.

<button onclick="fw.requestSignOutConfirmation()">Sign Out</button>

P{ inject('</div> <div id="sign-out-confirmation" style="color: red;">') }P

**Please confirm your request to Sign-Out: **

<mark><b>Remember:</b></mark>

- Your state _(i.e. completions and settings)_ will revert back to your device storage.
  - Which can optionally be reset to the latest copy from the cloud, **per this option**:
    <label><input type="checkbox" onclick="fw.handleSetting_syncDeviceStoreOnSignOut(this);" id="setting_syncDeviceStoreOnSignOut"> Copy Device Storage from the Cloud <i>(ON Sign-Out)</i></label>
- From that point forward, however, your device state will be an independent copy, held on this device.
  - **Which will NOT be synced to the cloud**

<button onclick="fw.signOut()">Confirm Sign Out</button>
<button onclick="fw.cancelSignOutConfirmation()">Cancel</button>

P{ inject('</div>') }P
