// Module Scoped Firebase Initialization: DO EARLY to insure Firebase functionality is available
import './fwInit.js';

import {getDatabase,
        ref,
        get,
        set,
        update,
        onChildChanged}  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

import {showUnexpectedError} from './util/showUnexpectedError.js';

import logger from './util/logger/index.js';

// our one-and-only fwUser singleton
// - ALWAYS represents the active user (i.e. it is morphed in-place)
//   ... so it is safe to hold on to it in module scope
import {fwUser} from './fwAuth.js'; 

// our Firebase Database reference
const database = getDatabase();

// the default `context` parameter, for the setValue() method
// see: setValue() docs
const defaultContextParam = 'Master Source Originating from UI';

/**
 * The FWState class manages a "category" of state (e.g. "settings",
 * or "completions"), simplifying a number of integration points
 * (persistence, and reactivity).
 *
 * The characteristics of this class are:
 *
 *   - It holds a "category" of state (think "settings" or "completions").
 *
 *     A collection of key/value pairs are maintained, which
 *     constitutes the complete state for this given category.
 * 
 *     This provides the launch-point for the overall management and
 *     persistence of data in this category.
 *
 *   - A "basic" API is provided to get/set individual properties (key/value)
 *     of this category.
 *
 *     Typically, this API should be considered INTERNAL, as it is
 *     somewhat cryptic.  It is easy to provide a more specific API
 *     that is more tailored to this category (more on this later).
 *         
 *   - Persistence of state is automatically provided, triggered
 *     by changes made to individual properties.
 *
 *     Two types of persistence are supported, which automatically
 *     adjusts (based on User Authentication):
 *
 *       * LocalStorage (for Guest users)
 *       * Firebase DB  (for signed-in users)
 *
 *   - Reactivity is "built-in", supporting UI synchronization, 
 *     through emitted events, triggered by state changes.
 *                 
 *     The scope of this synchronization is as follows:
 *
 *       * LocalStorage (for Guest users):
 *         >>> Syncing multiple app instances on same device/browser
 *
 *       * Firebase DB (for signed-in users):
 *         >>> Syncing multiple app instances on ALL devices of the same user
 *
 * Usage patterns of this class are as follows:
 *                 
 *   - Please Note: You can see examples of this usage pattern in:
 *       * fwCompletions.js
 *       * fwSettings.js
 *                 
 *   - A unique FWState singleton instance should be created for a
 *     given state category.
 *
 *     The reason a single instance should be utilized is related to
 *     the various setup and registrations that are maintained for
 *     each category.  The FWState instance is mutated for state
 *     changes, so a single reference to this object will always have
 *     the most up-to-date content.
 *
 *   - Typically, a higher-level class instance is promoted to the
 *     client, providing the PUBLIC API.  This is more tailored to a
 *     specific category of state.  Remember, the FWState API is more
 *     basic (using key/value pairs).
 *
 *     In essence, this client class simply wraps the FWState instance
 *     as it's underlying state ... ultimately passing requests
 *     through to it for the underlying work.  Under the covers the
 *     internal FWState instance does the heavy lifting!
 *
 * @class FWState
 */
export default class FWState {

  /**
   * Create a FWState object from the supplied "named" parameters.
   *
   * @param {JSONObj} defaultSemantics - the initial starting point of
   * our state ... used in the initial session as our defaults (ex:
   * default settings).  Internally, a copy of this is retained in
   * self so the client reference will NOT be mutated.  Even though
   * this is our starting point, it will ultimatly be overlayed with
   * any persistent state, retained from prior sessions.
   *
   * @param {string} category - the category of state managed by this
   * object instance (ex: "completions"/"settings").  This is used as
   * a persistence-qualifier, and a logging-identity.
   *
   * @constructor
   */
  constructor({defaultSemantics={}, category}={}) {
    this._logPrefix = `fw:state:${category}`; // inject the run-time category in our logging prefix
    const log = logger(`${this._logPrefix}:constructor()`);

    // initialize our basic core items
    this._onChangeHandlers = []; // registered observers of state change
    this._category         = category;
    this._deviceStateKey   = `fw_${category}`; // ... ex: fw_completions -or- fw_settings
    this._lastProcessedUid = 'NO-UID-ON-STARTUP';
    
    // initialize state with our "starting"/"default" state
    // ... make a copy so as to not polute our client's defaultSemantics
    //     CONSIDER: doing this at the setAllState() level ... NOT needed at this time
    this.setAllState( { ...defaultSemantics } );

    // register the StorageEvent listener that syncs LocalStorage changes to other app instances
    // Please Note: this is a global registration ... see: USER-SPECIFIC-REGISTRATION-NOT-REQUIRED
    window.addEventListener('storage', (e) => {
      this.syncChangesFromDevice(e);
    });

    // KEY: Define on-going initializations of our state
    //      TRIGGERED by User Identity Changes (i.e. Monitoring User Identity Changes)
    //      - The current active user DRIVES how our state is initialized (as well as how it is persisted)
    //        USING:
    //        * LocalStorage (for signed-out Guest users)
    //        * Firebase DB  (for signed-in users)
    //      - This callback is triggered ONLY when our user identity changes
    //        ... e.g. sign-in / sign-out / re-authentication
    // NOTE: There is a "start-up timing issue"
    //       ... stimulated by some circular dependancies (dohhh)
    //           EX: fwUser.getUserName() uses fwSettings.getUserName() in support of customizable userNames
    //               WHICH in turn monitors each other (fwUser <--> fwSettings ultimatly FWState)
    //       ReferenceError: Cannot access 'fwUser' before initialization
    //       EX: fwSettings.js is creating it's singleton in module scope
    //           which in turn instantiates an FWState (i.e. this constructor)
    //       FIX: Delay the registration and initial starting state of FWState (via a timer)
    //            allowing it to execute once the initialization has stabilized.
    //            Don't like this, but it works.
    //            Really NOT much different, because setupOnUserChange() is ALSO asynchronous (so timeout is not that big of a deal)
    setTimeout( () => {
      fwUser.onChange( () => {
        this.setupOnUserChange();
      });

      // KEY: Perform the first-time bootstrap initialization of our state
      //      - NOTE: The initialization from this process can be asynchronous
      //              ... for signed-in users (when Firebase is involved)
      //              ... THEREFORE: cannot log state here (rather IN setupOnUserChange())
      //      - NOTE: This invocation must ALSO be delayed, because the setupOnUserChange() method uses fwUser (see: "start-up timing issue" above)
      //              Don't like this, but it works.
      //              Really NOT much different, because setupOnUserChange() is ALSO asynchronous (so timeout is not that big of a deal)
      this.setupOnUserChange('initial-first-time-bootstrap');
    }, 10);

  }

  /**
   * Our logging prefix, that contains our category (derermined at run-time)
   *
   * @type {string} 
   *
   * @private
   */
  _logPrefix;

  /**
   * Self's category of state managed by this object instance (ex:
   * "completions"/"settings").  This is used as a
   * persistence-qualifier, and a logging-identity.
   *
   * @type {string}
   *
   * @private
   */
  _category;

  /**
   * The device browser key used to hold self's state in LocalStorage.
   *
   * EX:: fw_completions -or- fw_settings
   *
   * @type {string} 
   *
   * @private
   */
  _deviceStateKey;

  /**
   * Self's internal state - a simple property object.
   *
   * Structure (completions ex): {"20090419":"Y", "20090426":"Y", "Jonah":"Y", ...}
   *
   * @private
   * @type {JSONObj}
   */
  _state;


  /**
   * Provide a human-readable string representaiton of self.
   *
   * @returns {string} a human-readable string representaiton of self.
   */
  toString() {
    return `FWState for ${this._category}: ${JSON.stringify(this._state, undefined, 2)}`;
  }

  //*********************************************************************************
  //* Basic Getters/Setters
  //*********************************************************************************

  /**
   * Return the state value of the specified key.
   *
   * @param {string} key  - The key to return the value of.
   *
   * @returns {any} the value for the specified key (undefined if not there).
   */
  getValue(key) {
    return this._state[key];
  }

  /**
   * Set the state value of the supplied key.
   *
   * @param {string} key - The key to set.
   * 
   * @param {any} val - The value to set.
   * 
   * @param {string} [context] - PRIVATE (used by internal functions
   * only). Provide the context of internal operation being performed.
   * - When supplied, it is assumed the invoker is a synchronization
   *   from an external source, which DOES NOT have to be persisted
   *   (because it allready represents the store value).
   * - Otherwise, when NOT supplied, it is assumed the invoker is an
   *   "Originating UI Source", which NEEDS to be persisted.
   */
  setValue(key, val, context=defaultContextParam) {
    const log = logger(`${this._logPrefix}:setValue()`);
    
    // determine the source of this request (master-originating-source, or sync-from-external-source)
    const fromMaster = context === defaultContextParam;
    
    // update our state
    this._state[key] = val;
    log(`setting key: ${key}, val: ${val}, ... fromMaster: ${fromMaster}, context: ${context}`);
    
    // notify interested observers (within our app process) of this change
    // - this is a "poor mans" reactivity (kinda a signal)
    // - this setter is used by BOTH:
    //   * the synchronization of an external change (from our persistent-store)
    //     - in this case, there is NO QUESTION ... this notification is required, to reflect the hange in our UI
    //   * or the master originating source (initiated from our UI)
    //     - in this case, you may think that the UI already reflects this change
    //     - HOWEVER there are mitigating cirmstances where we do this regardless
    //         EX: - for completions, multiple check-boxes for the same completion (one for each responsive screen size)
    //             - for settings: updates required to central parts of the screen (ex: current translation)
    //             - for user change: sections of the screen that change (sign-in/sign-out)
    //     - SO: we invoke this UNCONDITIONALLY (a sledge-hammer - yes, but still light-weight)
    this.notifyChanged(key); // ... specific key changed
    
    // trigger persistence on this state change
    // ... ONLY WHEN coming from master-originating-source
    //     BECAUSE sync-from-external-source has already been persisted
    //             AND would cause an infinite recursion
    if (fromMaster) {
      this.persistChanges( {[key]: this._state[key]} );
    }
  }

  /**
   * Set ALL self's state from the supplied allState object.
   *
   * @private
   *
   * NOTE: This is an INTERNAL method that should ONLY be used within this module.
   *
   * @param {JSONObj} allState - The full state object.
   * Structure (completions ex): {"20090419":"Y", "20090426":"Y", "Jonah":"Y", ...}
   */
  setAllState(allState) {
    const log = logger(`${this._logPrefix}:setAllState()`);
    
    // update our state
    // NOTE: The supplied allState WILL be mutated,
    //       because we use this in our internal state.  As a result,
    //       the invoker must be aware of this, and make a copy when needed.
    //       - KEY: I have NOT documented this, because our current usage NEEDS NO COPY.
    this._state = allState;
    
    // notify interested observers (within our app instance) of this change
    // - this is a "poor mans" reactivity (kinda a signal)
    // - this setter is ONLY used INTERNALLY
    //   * the synchronization of an external change (from our persistent-store)
    //     - in this case, there is NO QUESTION:
    //       this notification is required, to reflect the change in our UI
    this.notifyChanged(); // ... no param: all keys changed
    
    // NOT: trigger persistence on this state change
    //      - WE DO "NOT" DO THIS HERE!
    //      - BECAUSE this setter is ONLY used INTERNALLY
    //        i.e. sync-from-external-source
    //      - SO we know it has already been persisted
    //        ... we don't want to cause an infinite recursion
    // if (fromMaster) {
    //   this.persistChanges( allState );
    // }
  }


  //*********************************************************************************
  //* Promote Self Changes to Interested Observers
  //* ... typically used to sync client UI
  //*********************************************************************************

  /**
   * Registered observers of self's state change.
   *
   * @type {[onChangeHandlerFn]} 
   *
   * @private
   */
  _onChangeHandlers;
  
  /**
   * Register notificaiton monitors that are triggered when self's
   * state has changed.
   *
   * @param {onChangeHandlerFn} onChangeHandler - the client supplied listener.
   *        API:
   *          onChangeHandlerFn([key]): void
   *            WHERE:
   *              - key: optional key that changed (when omitted, it means ALL state changed)
   *                     ... currently key NOT used in our app!
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
   * Trigger state change notifiations on self.
   *
   * @param {string} [key] - optional key of the state change (when omitted - ALL state has changed)
   *
   * @returns void
   *
   * @private
   */
  notifyChanged(key) {
    this._onChangeHandlers.forEach( (handler) => handler(key) );
  }

  
  //********************************************************************************
  //* Setup our in-memory-state for the current active user
  //********************************************************************************

  /**
   * Setup our in-memory-state for the current active user.
   *
   * - This is invoked both for app start-up -AND- when the user identity 
   *   changes.
   *
   * - This process includes the necessary registrations that are
   *   required to synchronize our in-memory-state from external changes
   *   to the persistent-store.
   *
   * MORE CONTEXT ...
   *
   * Terminology:
   *   - in-memory-state:  the app's in-memory state representation 
   *                       ... i.e. JavaScript variables
   *   - persistent-store: a database that retains the active user's state
   *                       over multiple runs of the application.
   *                       * EITHER:
   *                         - the Central Cloud Firebase DB (for authorized users)
   *                         - or the Device's Browser LocalStorage (for guest users)
   *                       * the synchronization between these two persistent-stores
   *                         is very limited:
   *                         1. when a BRAND NEW user establishes their account (the first time they sign-in)
   *                            - the initial Firebase image is set from the Device Storage (see: "SideBar (Initial Firebase DB Image)")
   *                         2. when the user signs-out
   *                            - the Device Storage can be synced from the Firebase image, per user request (see: "SideBar (Sync Device Storage From Cloud on Sign-Out)")
   *
   * Invocation Context:
   *  - this function is invoked:
   *     1. once - on app start-up (with our default guest user - before user sign-in OR re-authentication occurs)
   *        ... via: direct invocation in our constructor
   *     2. whenever the user identity changes (i.e. sign-in, re-authentication, sign-out)
   *        ... via: fwUser.onChange() registration
   *
   * "Setup" involves the following things:
   *
   *   - registers processes that will synchronize in-memory-state, 
   *     from subsequent changes to the user's persistent-store
   *     ... ex: other devices signed-in with the same user
   *
   *   - initialize (or reset) our in-memory-state from the user's persistent-store
   *     * because the user identity has changed (see context above), their state will be different
   *     * for signed-in users, their in-memory-state is reflective of the Firebase DB
   *     * for signed-out users, their in-memory-state is reflective of the Device LocalStorage
   *
   *   > SideBar (Initial Firebase DB Image):
   *   - this process also detects a non-existent persistent-store (for a BRAND NEW user account),
   *     and establishes the persistent-store's initial state for that user
   *     * this is done ONE TIME (per user), for a BRAND NEW user
   *       ... the first time they establish their account
   *     * the initial state is defined from the current in-memory-state of a guest user
   *       - because sign-in always happens from a guest user state
   *       - KEY: if the guest user has been using MULTIPLE devices,
   *              their account creation (i.e. first-time sign-in)
   *              should be done on the device that has the most accurate state!
   *       - ultimately, first-time guest user state is initialized from default semantics
   *
   *   > SideBar (Sync Device Storage From Cloud on Sign-Out):
   *   - on sign-out, this process will conditionally sync the Device LocalStorage from the Firebase DB
   *     * per user request (in fwSettings)
   *
   * App start-up progression of in-memory-state (highlighting our default semantics):
   *   0. Our initial state ALWAYS contains the appropriate default semantics, as follows:
   *   1. Our in-memory-state is initialized with our default semantics:
   *      - the FWState class constructor accepts the ONE-AND-ONLY defaultSemantis param
   *      - NOTE: this step 1 is very short-lived, as step 2 happens immediately
   *   2. Once our app start-up initially invokes THIS function, our in-memory-state will be reset
   *      from the Device's Browser LocalStorage
   *      - because the initial user will be a guest user
   *      - see: fetchStateFromDevice()
   *             * invoked from THIS function's signed-out logic path
   *             * when NO localStorage exists, fetchStateFromDevice() falls back to our existing in-memory-state
   *               - WHICH HAS the default semantics built-in (see step 1)
   *   3. If and when authentication occurs (either a sign-in or re-authentication)
   *      our in-memory-state will be reset from the user's persistent-store.
   *      - which in-turn, has initially been defined from our in-memory-state (initialized from step 1/2)
   *        * WHICH HAS the default semantics built-in
   *
   * @param {string} [diagMsg] - optional diagnostic message to relay in our logs (used in our 'initial-first-time-bootstrap')
   */
  setupOnUserChange(diagMsg='') {
    const log = logger(`${this._logPrefix}:setupOnUserChange(${diagMsg})`);

    const runningInAppStartup = diagMsg === 'initial-first-time-bootstrap';
    
    // IMPORTANT: We NO-OP if our user identity HAS NOT CHANGED
    //            - Our original assumption did NOT last long
    //              * that this function ONLY executes on user identity changes (i.e. sign-in, re-authentication, sign-out)
    //              * EX: fwUser.getUserName() accesses fwSettings.userName, in support of customizable userName feature.
    //                    As a result, fwUser monitors fwSettings (indirectly FWState) and vice versa
    //            - IMPORTANT: Without this NO-OP check, an infinite loop occurs (cycling between fwUser change / fwState change
    //                         THAT INVOLVES MUCHO REDUNDANT Firebase DB retrievals (in an infinite loop)
    if (this._lastProcessedUid === fwUser._uid) {
      log(`NO-OP ... last processed user identity has NOT changed (from active user): '${this._lastProcessedUid}'`);
      return;
    }
    this._lastProcessedUid = fwUser._uid; // ... keep track of last processed (for no-op logic to work)

    // when user is signed-in ... our setup is from the Firebase DB Cloud
    if (fwUser.isSignedIn()) {
      
      // NOTE: Firebase API is an asynchronous process
      
      // N/A: un-register any state change LocalStorage monitors
      //      ... we are no longer interested in LocalStorage monitors
      //      ... RATHER Firebase monitors
      // THIS IS NOT REQUIRED!
      // ... see: USER-SPECIFIC-REGISTRATION-NOT-REQUIRED note
      
      // register state change firebase monitors
      // ... NOTE: - we monitor  `onChildChanged()` ... which communicates ONLY the value that changed
      //           - rather than `onValue()` .......... which communicates ENTIRE set
      const dbRef = ref(database, `users/${fwUser._uid}/${this._category}`);

      this._unsubscribe_syncChangesFromFirebaseDB = onChildChanged(dbRef, (snapshot) => {
        this.syncChangesFromFirebaseDB(snapshot);
      });
      
      // retrieve all category state from firebase, retaining this state in our app
      get(dbRef)
        .then( (stateSnapshot) => {
          
          // decode this Firebase data
          const state = stateSnapshot.val();
          
          // when Firebase data exists ...
          if (state) {
            // retain the Firebase data in our in-memory-state
            log(`setting in-memory-state from Firebase DB for authorized user ${fwUser.getPhone()}`, {state});
            this.setAllState(state);
          }
          
          // when NO firebase data exists, it represents a first-time account usage
          // ... initialize Firebase DB for the first-time
          else {
            // the initial persistent-store is defined from our current in-memory-state
            // ... initialized from LocalStorage
            // ... which in turn is guaranteed to be initialized with appropriate default semantics
            //     see: fetchStateFromDevice()
            
            // initialize Firebase DB (first time usage for this user)
            // ... NOTE: we should NOT see this propogate to other app instances (with same user)
            //           BECAUSE: this is the first-use of the user account
            //           SO: there are NO other app instances (with this user)
            log(`initializing Firebase DB for first time use by new user ${fwUser.getPhone()} ... ${this}`);
            set(dbRef, this._state)
              .then(() => {
                // NOTE: we can LEAVE our in-memory-state AS-IS (from LocalStorage) ... it has now been synced to Firebase
              })
              .catch((err) => {
                showUnexpectedError(log, `initialize Firebase DB (first time usage for user: ${fwUser.getPhone()})`, err);
              });

            // also, as a convenience of the Firebase DB console, retain the authorizing phone in a top-level 'auth' entry
            // ... this strictly makes it easier to correlate the account used within the DB entries
            if (this._category === 'settings') { // ... only need to do once - choose one (completions or settings)
              log(`retain the authorizing phone in a top-level 'auth' entry: '${fwUser.getPhone()}'`);
              const dbAuthRef = ref(database, `users/${fwUser._uid}/auth`);
              set(dbAuthRef, fwUser.getPhone())
                .then(() => {
                  // success
                })
                .catch((err) => {
                  showUnexpectedError(log, `initialize Firebase DB auth entry (first time usage for user: ${fwUser.getPhone()})`, err);
                });
            }
          }
          
        })
        .catch((err) => {
          showUnexpectedError(log, `retrieve user state from Firebase for user: ${fwUser.getPhone()}`, err);
        });
    }
    
    // when user signed-out ... initialize from Device LocalStorage
    // ... also handles starting state (on first-time use)
    else {
      
      // un-register any state change firebase monitors
      // ... we are no longer interested in firebase monitors
      // ... RATHER LocalStorage monitors
      if (this._unsubscribe_syncChangesFromFirebaseDB) {
        log(`unsubscribe to syncChangesFromFirebaseDB`);
        this._unsubscribe_syncChangesFromFirebaseDB();
        this._unsubscribe_syncChangesFromFirebaseDB = null;
      }
      
      // N/A: register state changes via LoalStorage monitors
      // THIS IS NOT REQUIRED!
      // ... see: USER-SPECIFIC-REGISTRATION-NOT-REQUIRED (note below)

      // conditionally, sync our device LocalStorage state from the Firebase cloud
      // ... pur user request, found in our fwSettings
      // ... critical to do BEFORE subsequent steps
      if (!runningInAppStartup) { // a true sign-out ... NOT a sign-out when we are running in our app startup initialization
        if (_syncDeviceStoreOnSignOut) {  // user has requested to sync Device LocalStorage from Firebase
          log(`SYNCING Device LocalStorage FROM Firebase Cloud -AT- Sign-Out Time (per user request)`);

          // copy current state to LocalStorage
          // ... our current in-memory-state is an image of our Firebase (because we are currently signed-in)
          this.storeStateToDevice(this._state);
        }
        else {
          log(`NOT SYNCING Device LocalStorage FROM Firebase Cloud -ON- Sign-Out Time (user did NOT request)`);
        }
      } 

      // retrieve all category state from LocalStorage, retaining this state in our app
      // ... pull from Device LocalStorage
      const state = this.fetchStateFromDevice();
      
      // ... retain the Device LocalStorage data in our in-memory-state
      log(`setting in-memory-state from Device LocalStorage for authorized 'guest' user`, {state});
      this.setAllState(state);
    }
    
  } // end of ... setupOnUserChange()


  //********************************************************************************
  //* persistent-store functionality BOTH sync changes "from", and persist changes "to"
  //********************************************************************************

  /**
   * Synchronize our in-memory-state FROM changes made to the Firebase
   * persistent-store (of the active user's account).
   * 
   * This method is triggered from the Firebase onChildChanged(...)
   * registration, when other app instances (external to this
   * one), persist changes to the Firebase DB.  
   * - This process (and registration) is specific to the the active
   *   signed-in user account.
   *   - as a result, the registration must be managed per user
   *   - hence the subscribe/unsubscribe logic, incurred when the user
   *     identity changes (see above).
   * 
   * Trigger Example: When other devices, signed-in with the same user
   * account, makes state changes, this app instance will receive notice
   * of this activity, to synchronize our state representation.
   *
   * @param {FirebaseSnapshot} snapshot - the snapshot of what has changed (a
   * single value)
   */
  syncChangesFromFirebaseDB(snapshot) {
    const log = logger(`${this._logPrefix}:syncChangesFromFirebaseDB()`);

    // CONFIRMED OBSERVATION:
    // - on incremental single value change - a single value is being sent!
    // - on initial regristration (of syncChangesFromFirebaseDB) - ALL values are sent via multiple invocations
    //   * YET-TO-CONFIRM: 
    //   * CANNOT HAPPEN: I think only scenerio here is when new user created DB entry (from localStorage)
    //                    - initial thoughts are: should invoke multiple times
    //                    - HOWEVER: - after some thought, THIS IS N/A (IT CANNOT HAPPEN)
    //                               - for this to happen, this new user would have to sign-in on multiple devices
    //                                 THAT CANNOT HAPPEN, RATHER:
    //                                 1. login first time (on device 1)
    //                                    ... where the DB entry is created from localStorage (with multiple values)
    //                                    ... at this point, no other user is monitoring this
    //                                 2. login second time (on device 2)
    //                                    ... at this point, we simply do a one-time retrieval
    
    // obtain the value from the Firebase snapshot
    const changedKey   = snapshot.key;
    const changedValue = snapshot.val();
    
    // update our in-memory-state from this Firebase change
    log(`setting in-memory-state from Firebase change ... key: '${changedKey}', value: '${changedValue}'`);
    this.setValue(changedKey, changedValue, 'Sync External Firebase Change');
  }

  /**
   * Synchronize our in-memory-state FROM changes made to our Device
   * (Browser LocalStorage).
   *
   * USER-SPECIFIC-REGISTRATION-NOT-REQUIRED:
   *   This functionality is GLOBALLY triggered from the StorageEvent
   *   listener (in constructor).  
   *   - UNLIKE the Firebase registration, which is specific to a
   *     signed-in user (see: syncChangesFromFirebaseDB), 
   *     - THIS registration can be accomplished GLOBALLY, and does NOT
   *       require any un-registration process.
   *     - THIS is because, when a user signs-in, ALL persistance moves to
   *       Firebase ... so this global StorageEvent listener, effectively
   *       no-ops (because no activity will be directed to LocalStorage).
   * 
   * Trigger Example: When other app instances, within the same
   * device/browser - of a signed-out user, makes state changes, this app
   * instance will receive notice of this activity, to synchronize our
   * state representation.  
   * 
   * PLEASE NOTE: that signed-out users have their own device-specific
   * state representation per the device they are running on.  In this
   * case, NO synchronization is performed across devices.  This is the
   * whole reason we introduced cloud storage - syncing state across
   * devices of the same user.
   *
   * @param {StorageEvent} e - see: https://developer.mozilla.org/en-US/docs/Web/API/StorageEvent
   */
  syncChangesFromDevice(e) {
    const log = logger(`${this._logPrefix}:syncChangesFromDevice()`);
    
    // no-op if this is NOT related to the  LocalStorage entry of our state "category"
    // ... we are only interested in LocalStorage entries from our "category"
    if (e.key !== this._deviceStateKey) {
      return;
    }
    
    // pull in the full set of our state
    // NOTE: We could seed this from e.newValue, but it has already been retained
    //       in LocalStorage, so fetchStateFromDevice() is more convenient
    //       ... it contains the string-to-obj conversion
    const allState = this.fetchStateFromDevice();

    // no-op if this is a signed-in user
    // ... this is a fail-safe sanity check
    //     - it SHOULD NEVER happen
    //     - BECAUSE: the app WILL NOT be saving to LocalStorage in this scenario
    //                ... rather it persists to FireBase
    //     - the only thing that could cause this is: a developer setting LocalStorage manually via DevTools
    //       ... KEY: if this happens, we CERTAINLY DO NOT want to overlay our in-memory-state
    if (fwUser.isSignedIn()) {
      log.f(`UNEXPECTED SCENARIO: LocalStorage change detected when user signed-in - suspect this was done manually via DevTools - IGNORE THIS (NO-OPing)`, {allState});
      return;
    }
    
    // update our in-memory-state from this LocalStorage change
    // NOTE: We DO NOT readily have access to the single state key that has changed
    //         - unless we meticulously compare e.oldValue/e.newValue
    //         - remember: our LocalStorage state entry is a blob of ALL items in this category
    //         - the simplest thing to do, is to pretend all state has changed
    //           - a sledge-hammer
    //           - but STILL low CPU
    log(`setting in-memory-state allState from LocalStorage change (unsure WHICH key changed):`, {allState});
    this.setAllState(allState);
  }

  /**
   * Fetch (retrieve) all state of this category, retained in our Device (Browser LocalStorage).
   * 
   * NOTE: This function handles starting state default semantics (on
   *       first-time use) ... always returning a valid state representation.
   *
   * @returns {JSONObj} the full set of items (key/value pairs) for this category
   * Example (from completions): {"20090419":"Y", "20090426":"Y", "Jonah":"Y", ...}
   */
  fetchStateFromDevice() {
    // fetch all state for this category from LocalStorage (a string representation)
    const objStr = localStorage.getItem(this._deviceStateKey);
    
    // convert the string represation to JSON
    // ... when NO localStorage exists, we fall back to our existing in-memory-state
    //     - WHICH HAS the default semantics built-in
    const  obj = objStr ? JSON.parse(objStr) : this._state;
    return obj;
  }
  
  /**
   * Store (retain) all state of self's category in our Device (Browser LocalStorage).
   * 
   * @param {JSONObj} allState - the full set of item's for self's category to store (key/value pairs).
   * Example (from completions): {"20090419":"Y", "20090426":"Y", "Jonah":"Y", ...}
   */
  storeStateToDevice(allState) {
    // convert the supplied allState (JSON) into a string (suitable for storage)
    const allStateStr = JSON.stringify(allState);
    // store away
    localStorage.setItem(this._deviceStateKey, allStateStr);
  }

  /**
   * Persist completions changes FROM our in-memory-state TO the user's
   * persistent-store.  These represent changes initiated by this app
   * instance user (via our UI).
   *
   * This algorithm reasons about which store type to persist to, based
   * on the current user identity:
   *  - signed-in user: Firebase DB
   *  - guest user:     Device/Browser LocalStorage
   *
   * @param {JSON} changes - the changes that have been made to our in-memory-state: {key: val, ...}
   * (current usage is ONLY ONE entry ... keep this API just-in-case)
   */
  persistChanges(changes) {
    const log = logger(`${this._logPrefix}:persistChanges()`);
    
    // persist to Firebase when user signed-in
    if (fwUser.isSignedIn()) {
      // update Firebase
      const dbRef = ref(database, `users/${fwUser._uid}/${this._category}`);
      
      // update specific child node in our Firebase DB
      // ... update() avoids overwriting entire data set
      const contextMsg = `update Firebase DB with incremental change: ${JSON.stringify(changes)}`;
      update(dbRef, changes)
        .then(() => {
          log(`SUCCESS: ${contextMsg}`);
        })
        .catch((err) => {
          showUnexpectedError(log, contextMsg, err);
        });
    }
    
    // persist to LocalStorage when user signed-out
    // - NOT: consider ALWAYS syncing to LocalStorage
    //   * NO: DO NOT DO THIS
    //     - over complicates things
    //       * where is my master source
    //       * we would need to nix the monitor of LocalStorage when changed
    //       * KISS
    else {
      // NOTE: LocalStorage holds the entire data state in one value
      //       SO we use our full in-memory-state (rather that the supplied param)
      //       THIS assumes it has been changed PRIOR to invoking this function.
      this.storeStateToDevice(this._state);
    }
  }

} // end of ... FWState class definition


//********************************************************************************
//* syncDeviceStoreOnSignOut - Sync Device Storage From Cloud on Sign-Out
//* 
//* The determination of when to "Sync Device Storage From Cloud on
//* Sign-Out" is made in this module (see: usage in setupOnUserChange()
//* function).
//* 
//* Ultimately this is driven by an fwSetting property:
//* fwSetting.isSyncDeviceStoreOnSignOut().
//* 
//* HOWEVER there are two quirky aspects of why we cannot directly use
//* fwSetting to make this determination:
//* 
//* 1. This process occurs multiple times for a sign-out, because we have
//*    multiple state categories.
//* 
//*    In other words, there are separate instances of FWState, one for
//*    each state category (e.g. completions and settings).
//* 
//* 2. This process is actually changing the source of our settings (going
//*    from Firebase to Device LocalStorage), so it can be unstable.
//* 
//*    We want the Firebase rendition, but the settings may have already
//*    changed to the LocalStorage rendition - because of the multiple
//*    object instances highlighted in step 1.
//* 
//* As a result, the determination is made early in the sign-out process
//* (see: signOut() function in fwAuth.js), and retain it here using the
//* retain_syncDeviceStoreOnSignOut() function below.
//********************************************************************************

let _syncDeviceStoreOnSignOut = true;
export function retain_syncDeviceStoreOnSignOut(val) {
  _syncDeviceStoreOnSignOut = val;
}


//********************************************************************************
//* A migration patch (release V21): to standadarize LocalStorage state keys
//* to use "category" ... consistent with what is used in our Firebase DB
//* 
//* This performs a one-time localStorage converion with global knowledge
//* of old/new keys.
//********************************************************************************
function migrateToNewDeviceStateKeys() {
  const log = logger(`fw:state:migrateToNewDeviceStateKeys()`);

  // MIGRATE: 'fireWithinSettings' TO: 'fw_settings' ... for the well-known 'settings' category
  const settingsVal = localStorage.getItem('fireWithinSettings');
  if (settingsVal) {
    log.f(`V21 Migration: converting Device LocalStorage entry FROM: 'fireWithinSettings' TO: 'fw_settings'`);
    localStorage.setItem('fw_settings', settingsVal);
    localStorage.removeItem('fireWithinSettings');
  }

  // MIGRATE: 'fireWithinCompleted' TO: 'fw_completions' ... for the well-known 'settings' category
  const completionsVal = localStorage.getItem('fireWithinCompleted');
  if (completionsVal) {
    log.f(`V21 Migration: converting Device LocalStorage entry FROM: 'fireWithinCompleted' TO: 'fw_completions'`);
    localStorage.setItem('fw_completions', completionsVal);
    localStorage.removeItem('fireWithinCompleted');
  }
}

// AUTO EXECUTE
//   CONFIRMED via logs: executes at the very start of our app start-up
//     fw:init Firebase Initialized: {app: FirebaseAppImpl}
//     fw:state:migrateToNewDeviceStateKeys() IMPORTANT: V21 Migration: converting Device LocalStorage entry FROM: 'fireWithinSettings'  TO: 'fw_settings'
//     fw:state:migrateToNewDeviceStateKeys() IMPORTANT: V21 Migration: converting Device LocalStorage entry FROM: 'fireWithinCompleted' TO: 'fw_completions'
migrateToNewDeviceStateKeys();
