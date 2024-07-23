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

For "Guest" users, your state is maintained on your local device.
**Your state consists of your _completions_ and _settings_.**. The
**only limitation** of this approach is when you use multiple devices
_(say your laptop and your phone)_ ... then you must manually sync
your state across all the devices you use _(because each device has
it's own copy of the state)_.

To overcome this limitation, you can **establish a Fire Within
account**.  When you do this, your state is maintained in the cloud,
and **automatically syncs across all devices** _(that are signed-in to
the same account)_.

**Establishing and using a Fire Within account is easy!**

<!-- Our sign-in form, that gathers email/pass.
     - A "submit" button type is used to facilitate auto submit on text-box enter
 -->

<div style="margin-left: 20px">  
  <form id="signInForm" onsubmit="fw.handleSignInWithEmailPass(event)">
  
    <label for="acctEmail"><b>Email:</b></label>
    <input type="email" id="acctEmail" name="acctEmail" autocomplete="email" placeholder="me@gmail.com">
  
    <label for="acctPass"><b>Password:</b></label>
    <input type="password" id="acctPass" name="acctPass" autocomplete="current-password">
    <span onclick="fw.togglePasswordVisibility('acctPass')" style=cursor:help>👁</span>

    <p id="signInMsg" style="color: red;"></p>

    <div style="margin-left: 20px">  
      <button type="submit">Sign In</button> <i>... for existing accounts</i>
      
      <br/>
      <button onclick="fw.handleSignUpWithEmailPass(event)">Sign Up</button> <i>... to create a new account <b>(first time only)</b></i>
      
      <br/>
      <button onclick="fw.handlePasswordReset(event)">Forgot Password</button> <i>... we'll send you an email to reset your password</i>
    </div>  
    <br/>
  </form>
</div>

- <mark><b>IMPORTANT:</b></mark> When your account is first created
  _(the first time you Sign Up)_, the state **from your device**
  _(i.e. completions and settings)_ will be **transferred to the
  cloud**.  As a result, your **initial Sign Up** should be done **on
  the device that has the most accurate state.**

  - Remember, for Guest users, each device has it's own copy of the
    state.

  - The state transfer _(from device to cloud)_ only happens one time:
    **the first time you Sign Up!**

  - For all subsequent Sign Ins, the cloud will have already been
    established _(from your first Sign Up)_, and is considered the
    master.


P{ inject('</div> <div id="sign-in-form-signed-in" style="color: blue;">') }P

Hello M{ userName() }M,

You have signed-in to your Fire Within account, using email: M{ userEmail() }M.

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
    <label><input type="checkbox" onclick="fw.handleSetting_syncDeviceStoreOnSignOut(this);" id="setting_syncDeviceStoreOnSignOut"> Sync Device Storage from the Cloud <i>(ON Sign-Out)</i></label>
- From that point forward, however, your device state will be an independent copy, held on this device.
  - **Which will NOT be synced to the cloud**

<button onclick="fw.signOut()">Confirm Sign Out</button>
<button onclick="fw.cancelSignOutConfirmation()">Cancel</button>

P{ inject('</div>') }P
