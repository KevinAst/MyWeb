# Settings

The _**"Fire Within"**_ Bible Study Guide has a small number of **User
Preference** settings _(found here)_, which are retained between
sessions.  In other words, you can leave the site and come back, and
these settings will be remembered.

> Please Note that these settings ares retained in your local device.
> That means they will not follow you when you use multiple devices
> _(say a laptop and a cell phone)_.  In other words, it's really the
> settings of the device you are using.
> 
> This feature is merely meant to be a convenience, and was
> implemented using the simplest technique.


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

??$$ NEW User Account

P{ inject('<div id="sign-in-form-guest" style="color: red;">') }P

**guest**

The Fire Within page does NOT require an account to use it.  By
default, you are a "Guest" user.  In this case, your state is
maintained on your local device _(state consists of your completions
and settings)_.  The down-side of this is when you use multiple
devices _(say your laptop and your phone)_.  As a "Guest" user, you
must manually sync your state across all the devices you use.

To overcome this problem, you can establish a Fire Within user
account.  When you do this, your state is maintained in the cloud, and
automatically syncs across multiple devices _(for the same user)_.

Creating an account is easy.  We simply use your phone number as an
account identifier.  Your phone is "verified" by texting a short-lived
"verification code", which you use to sign-in.  It's very simple.
There is no need to remember "yet another password".  Because the
sign-in is "long lived", you only have to do this once _(per device)_,
unless you sign-out for some reason.

<!-- Our sign-in form, that gathers phone number.
     - A "submit" button type is used to facilitate auto submit on text-box enter
     - The id on the "submit" button IS REQUIRED to integrate with the invisible
       "reCAPTCHA verifier widget" ... see: js/fwAuth.js
 -->
<form id="signInForm" onsubmit="fw.handlePhoneSignIn(event)">
    <label for="signInPhoneNum">Phone Number:</label>
    <input type="tel" id="signInPhoneNum" name="signInPhoneNum" placeholder="nnn-nnn-nnnn">
    <button type="submit" id="signInButton">Sign In</button>
    <i>standard text rates apply</i>
    <p id="signInMsg" style="color: red;"></p>
</form>

<mark><b>SMS Text Limit Exceeded:</b></mark> ?? dynamically rendered
- Fire Within accounts use an entry-level service plan to persist it's data in the cloud
- This plan is limits the number of SMS Text messages allowed at a given time
- If you receive an **"SMS Text Limit Exceeded"** message, simply try again in a short time _(20-30 mins)_
- This **limitation should NOT be an issue** because sign-ins are **"long lived"** _(basically forever)_
  ... _sign-ins do not need to be repeated on a given device, unless you sign-out for some reason_

P{ inject('</div> <div id="sign-in-form-verifying" style="color: green;">') }P

**verifying**

Your sign-in request is in-progress.

A text message has been sent to your phone at: M{ userPhone() }M.

To complete your sign-in, please enter the verification code (from that text) and click "Verify".

<!-- Our verification form, that gathers the one-time-code.
     - A "submit" button type is used to facilitate auto submit on text-box enter
 -->
<form id="verifyForm" onsubmit="fw.handlePhoneVerification(event)">
    <label for="verifyCode">Code:</label>
    <input type="text" id="verifyCode" name="verifyCode">
    <button type="submit">Verify</button>
    <p id="verifyMsg" style="color: red;"></p>
</form>

P{ inject('</div> <div id="sign-in-form-verified" style="color: blue;">') }P

**verified**

Hello M{ userName() }M,

You have signed-in to your Fire Within account, using phone: M{ userPhone() }M.

As a result, your state _(completions and settings)_ is retained in a
cloud database, and automatically synced to all devices _(signed in to
this account)_.

As a signed-in user, you can specify your name here: ?? Text Box
pre-populated & implicitly executes fwSettings.setUserName(name)

Your sign-in is long lived, so you should not need to sign-in again
_(on this device)_, unless you sign-out for some reason.

If you do need to sign-out, remember:
- your state will revert back to your device storage
- ?? which will be reset to your existing state _(at sign-out time)_

<button onclick="fw.handleSignOut()">Sign Out</button>

P{ inject('</div>') }P
