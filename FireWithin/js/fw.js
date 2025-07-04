//*-----------------------------------------------------------------------------
//* fw.js: the "core" module of the "Fire Within" web-app:
//*
//* - explicitly run at the start of every gitbook page
//*   * injected via our local gitbook plugin:
//*     ... see: FireWithin/gitbook-plugin-my-plugin/preProcessPage.js
//*              <script type="module" src="./js/fw.js"></script>
//*   * NOTE: Because this is an ES Module (type="module") 
//*           - it only expands ONE TIME
//*           - so the conditional logic with the IIFE (below) is technically NOT required
//*           - PREVIOUSLY: this was required (when it was a "non-module scoped" script)
//*           - HOWEVER: this logic was kept (it doesn't hurt anything)
//*
//* - this module provides a "bridge" between "module-scoped" and "non-module scoped" scripts
//*
//*   * KEY: some "non-module scoped" scripts are still used, 
//*          BECAUSE: in-line scripts are conceptually executed at the same time of the
//*                   surrounding html expansion (within the gitbook framework)
//*                   ... see USAGE (below)
//*
//*   * this "bridge" is promoted through the one-and-only "module scoped" window.fw object:
//*
//*       DEFINITIONS (below):
//*         INTERNAL FUNCTIONS ... simply:
//*            function myUtil() { ... }
//*         PUBLIC FUNCTIONS ... promoted via the fw qualifier
//*            fw.fooBar = function() { ... }
//*
//*       USAGE:
//*
//*         A "non-module scoped" script can access these functions as follows:
//*
//*           <script> fw.fooBar() </script> ... this is conceptual: keep reading (NOTE)
//*
//*         NOTE: To resolve timing issues between the co-existence of the two script types,
//*               any "non-module scoped" script that uses the fw object, 
//*               must use the withFW() function (introduced by the gitbook plugin - above):
//*
//*           <script> withFW( ()=>fw.fooBar() ) </script>
//*-----------------------------------------------------------------------------

// our active User singleton object (ALWAYS up-to-date)
import {fwUser} from './fwAuth.js';


// our completions state singleton object (ALWAYS up-to-date)
// ... state-related-completions
import {fwCompletions} from './fwCompletions.js';

// our memoryVerseTranslation state singleton object (ALWAYS up-to-date)
// ... state-related-completions
import {fwMemoryVerseTranslation} from './fwMemoryVerseTranslation.js';

// our settings state singleton object (ALWAYS up-to-date)
// ... state-related-settings
import {fwSettings} from './fwSettings.js';

import {handleSignInWithEmailPass,
        handleSignUpWithEmailPass,
        handlePasswordReset,
        requestSignOutConfirmation,
        cancelSignOutConfirmation,
        signOut} from './fwAuth.js';

import logger from './util/logger/index.js';
const  logPrefix = 'fw:core';
const  log = logger(`${logPrefix}`);

// NOTE: now that fw.js is expanded in a module-scope, we only see this log ONCE (see NOTE above)!
log('expanding fw.js module');

if (!window.fw) { // only expand this module once (conditionally)

  //*************
  //* start IIFE -and- promotion of the "pseudo module scoped" fw obj
  //*************
  (function () {
    const log = logger(`${logPrefix}:defineFwIIFE()`);

    log('defining our one-and-only "module scoped" fw obj');

    const fw = {}; // our one-and-only "module scoped" fw object, promoted to the outside world (see return)

    // the current version of our blog (manually maintained on each publish)
    const CUR_VER = '24.9';


    //***************************************************************************
    //***************************************************************************
    //* Code Related to our completed checkboxes ... state-related-completions
    //***************************************************************************
    //***************************************************************************

    // register reflective code that syncs our UI on completion changes
    // ... state-related-completions
    fwCompletions.onChange(syncUICompletions);
    
    //*--------------------------------------------------------------------------
    //* INTERNAL: syncUICompletions()
    //* 
    //* Synchronize ALL the completions checkboxes on the current page 
    //* to reflect our current "completions" state.
    //* 
    //* This function is "poor mans" reflexive synchronization process
    //* ... a sledge hammer if you will.
    //* ... the overhead is still VERY LOW (responsiveness is excellent)
    //* 
    //* It is automatically invoked for:
    //*  - page navigation (GitBook page change) ... see: fw.pageSetup()
    //*  - completions state changes ... see: fwCompletions.onChange()
    //*--------------------------------------------------------------------------
    // ... state-related-completions
    function syncUICompletions(key) { // NOTE: `key` param NOT USED: we sync ALL refs on a page.
                                      //       There are some dupliate hidden check-boxes used in our responsive technique (screen size changes)
      const log = logger(`${logPrefix}:syncUICompletions()`);
      
      // fetch all checkbox input elements (representing completed sessions)
      const completionElms = document.querySelectorAll('input[type="checkbox"][data-completions]');
      log.enabled && log('completionElms: ', {completionElms});
      
      // initialize each completed checkbox from our state
      for (const completionElm of completionElms) {
        log.v(`processing completionElm.id: "${completionElm.id}"`);
      
        // sync our UI from our state
        // ... THIS IS IT
        completionElm.checked = fwCompletions.isComplete(completionElm.id);
      }

      // ALSO: sync any "Collapsable Sections"
      // ... BECAUSE we piggy back Collapsable Section state within the completion state

      // .. access all of our top-level collapsableSectionDivs
      const collapsableSectionDivs = document.querySelectorAll('div[data-initial-expansion]');
      // ... process them
      collapsableSectionDivs.forEach(section => {
        const id               = section.id;
        const content          = section.querySelector(".collapsible-content");
        const arrow            = section.querySelector(".collapsible-arrow");
        const initialExpansion = section.dataset.initialExpansion;

        // open/close is driven by what our state says we should be
        // ... this will sync our page from
        //     - BOTH the start of a page navigation
        //     - AND an reflective change by a user
        // ... falling back to our initialExpansion, when no state yet exists (defined in our html)
        const isOpen = fwCompletions.isOpen(id, initialExpansion);

        // make it so
        // NOTE: our expansion technique uses JavaScript
        //       BECAUSE: Our content is author controlled, and DOES NOT have a known/fixed height
        //       THEREFORE: We adjust the styling:
        //                  - maxHeighte (for visibility)
        //                  - opacity (for a fade effect - a smoother transition ... in some browsers)
        if (isOpen) { // ... open it
          content.style.maxHeight = `${content.scrollHeight}px`;
          content.style.opacity   = 1;
          arrow.style.transform   = "rotate(90deg)";  // arrow points down
        }
        else { // ... close it
          content.style.maxHeight = null;
          content.style.opacity   = 0;
          arrow.style.transform   = "rotate(0deg)";  // arrow points right
        }

      });

    }

    //*--------------------------------------------------------------------------
    //* PUBLIC: fw.handleCompletedCheckChange(completionElm)
    //* 
    //* Event handler that retains changes to our completions state
    //*--------------------------------------------------------------------------
    // ... state-related-completions:
    fw.handleCompletedCheckChange = function(completionElm) {
      const log = logger(`${logPrefix}:handleCompletedCheckChange()`);

      log(`completionElm changed ... id: "${completionElm.id}", checked: ${completionElm.checked}`);

      // retain this change in our state
      // ... handles persistance/reflection automatically
      fwCompletions.setComplete(completionElm.id, completionElm.checked);
    }


    //***************************************************************************
    //***************************************************************************
    //* Code Related to Collapsible Sections
    //***************************************************************************
    //***************************************************************************

    //*--------------------------------------------------------------------------
    //* PUBLIC: fw.toggleSection(id)
    //* 
    //* Event handler to toggle the Collapsible Section (open/close).
    //* 
    //* PARMS:
    //*   id: The id of the section to toggle.
    //*--------------------------------------------------------------------------
    fw.toggleSection = function(id) {
      var section = document.getElementById(id);
      const initialExpansion = section.dataset.initialExpansion;

      // toggle our state
      // ... taking into consideration our initialExpansion, when no state yet exists (defined in our html)
      // ... handles persistance/reflection automatically
      fwCompletions.toggleVisibility(id, initialExpansion);
    }

    
    //***************************************************************************
    //***************************************************************************
    //* Code Related to our memoryVerseTranslation selection ... state-related-memoryVerseTranslation
    //***************************************************************************
    //***************************************************************************
    
    // register reflective code that syncs our UI on memoryVerseTranslation changes
    // ... state-related-memoryVerseTranslation
    fwMemoryVerseTranslation.onChange(syncUIMemoryVerseTranslation);
    
    //*--------------------------------------------------------------------------
    //* INTERNAL: syncUIMemoryVerseTranslation()
    //* 
    //* Synchronize ALL the memoryVerseTranslation selections on the current page 
    //* to reflect our current "memoryVerseTranslations" state.
    //* 
    //* This function is "poor mans" reflexive synchronization process
    //* ... a sledge hammer if you will
    //* ... the overhead is still VERY LOW (responsiveness is excellent)
    //* 
    //* It is automatically invoked for:
    //*  - page navigation (GitBook page change) ... see: fw.pageSetup()
    //*  - memoryVerseTranslation state changes  ... see: fwMemoryVerseTranslation.onChange()
    //*--------------------------------------------------------------------------
    // ... state-related-memoryVerseTranslation
    function syncUIMemoryVerseTranslation(key) { // NOTE: `key` param NOT USED: we sync ALL refs on a page.
                                                 //       There are some dupliate hidden sections used in our responsive technique
      const log = logger(`${logPrefix}:syncUIMemoryVerseTranslation()`);

      // determine if this page containsReflectiveMemorizationData
      const containsReflectiveMemorizationData = document.getElementById("ContainsReflectiveMemorizationData") !== null;
      if (!containsReflectiveMemorizationData) {
        log(`this page DOES NOT containsReflectiveMemorizationData ... no-oping`);
        return;
      }
      log(`processing page that containsReflectiveMemorizationData`);

      // access all of our top-level memory-verse elements
      // ... <div> elements with the 'data-memory-verse' attribute
      const memoryVerseDivs = document.querySelectorAll('div[data-memory-verse]');

      // glean all MemoryVerse run-time state that is held in the MemoryVerse.md page
      // 
      // NOTE: This state is gathered ONE time only (on FIRST NAVIGATION to the Memorization.md page)
      //       BECAUSE this state WILL NOT CHANGE!
      // 
      //       As a general rule, this state is NOT used for overall page processing.
      //       BECAUSE: We need to access the <divs> each time we process this page
      //                Sooo we can gean any state we need from the data attributes
      //       KJB:     I'm NOT sure this is true - we may be using this state for general page processing.
      //
      //       HOWEVER: We do use this state for: Multi-Verse Audio Review
      // 
      if (!fw.memoryVerseState) { // ... VERIFIED: executed on FIRST NAVIGATION to the Memorization.md page (NOT subsequent navigations)
        log(`creating fw.memoryVerseState (only once)`);

        fw.memoryVerseState = {

          // NOTE: This is mostly documentation (i.e. comments), so you can easily see what the contents are.
          //       This structure is built in the code following this doc :-)

          // all verse references
          allRefs: [/*'luk.9.23-24', ...*/],

          // current multi-verse being played (within the multi-verse context)
          // EX: 'luk.9.23-24'
          // OR: '' for RESET (start from beginning)
          curMultiVerse: '',

          // one entry for each verse (a sample - for reference)
          // "luk_9_23-24": {      // indexed by: id
          //   ref: 'luk.9.23-24', // scripture reference
          //   activeTranslation: 'NLT', // maintained at run-time for convenience
          // },
          // ... repeat and rinse
        }
        
        // pull data out of our html and hold onto it
        // ... process each memory verse
        memoryVerseDivs.forEach(memoryVerseDiv => {
          const memoryVerseScriptRef          = memoryVerseDiv.dataset.memoryVerse;
          const memoryVerseScriptRefSanitized = memoryVerseDiv.id;

          // build up the structure documented above
          fw.memoryVerseState.allRefs.push(memoryVerseScriptRef);

          const mvEntry = fw.memoryVerseState[memoryVerseScriptRefSanitized] = {};
          mvEntry.ref = memoryVerseScriptRef;
        });

        log(`ONE TIME ONLY - built up fw.memoryVerseState: `, fw.memoryVerseState);
      }

      // process each memory verse
      memoryVerseDivs.forEach(memoryVerseDiv => {
        const memoryVerseScriptRef          = memoryVerseDiv.dataset.memoryVerse;
        const memoryVerseScriptRefSanitized = memoryVerseDiv.id;
        log(`processing memoryVerse: `, {memoryVerseScriptRef, memoryVerseScriptRefSanitized});

        // access all the translation divs for this memory verse
        const translationDivs = memoryVerseDiv.querySelectorAll('div[data-memory-verse-translation]');

        // glean all the translations available for this memoryVerse
        // ... EX: ['NLT', 'NKJV', ... ]
        // ... NOTE: the spread syntax below [...translationDivs] converts to an array, so we can use the map() method
        const memoryVerseTranslations = [...translationDivs].map(translationDiv => translationDiv.dataset.memoryVerseTranslation);

        // resolve the desired translation for this verse
        // ... FIRST from the persistent state for this verse
        //     IF ANY: will not exist on the FIRST TIME this verse is seen
        let activeTranslation = fwMemoryVerseTranslation.getTranslation(memoryVerseScriptRefSanitized);
        // ... when NO verse-specific translation has been explicity set
        if (!activeTranslation) {

          // fallback to the verse-specific default (optionally specified within the definition of this memory verse)
          activeTranslation = memoryVerseDiv.dataset.defaultTranslation;

          // if NO verse-specific default has been specified
          // ... fallback to User Settings Translation (which has it's OWN fallback default: ['NLT'])
          if (!activeTranslation) {
            activeTranslation = fwSettings.getBibleTranslation();
          }

          // insure the translation has been configured for this specific memory verse
          // ... if not: fallback fallback TO: the first translation available for this memory verse
          //     NOTE: this happenswhen the User Settings Translation has NOT been defined for the memory verse
          if (!memoryVerseTranslations.includes(activeTranslation)) { 
            activeTranslation = memoryVerseTranslations[0];
          }

          // persist the activeTranslation ... so the user will never see it oscillate
          // DO NOT DO THIS: CAUSING A LOT OF HAVOC THAT I CAN'T TOTALLY EXPLAIN
          // ... see: temp.analyze.autoPersistMemoryVerseTranslation.txt
          //          * when refreshing on the Memorization page
          //            - we get an initial page load (presumably from GitBook)
          //              WHERE we are getting FireBase retrievals of undefined
          //              BAD: setting the values here is BAD ... it is a false indicator
          //            - THEN there are subsequent page loads (again presumably from GitBook)
          //              WHERE Firebase retrievals are working
          //            - I suspect this is standard behavior, I just have never noticed it before
          //          * SOLUTION: PUNT, and DO NOT ATTEMPT TO persist the activeTranslation
          //            - Ramifications are NOT BIG: 
          //              * IN VERY RARE CASES: User may just see some oscillation
          //                - THEY WOULD HAVE TO BE CHANGING THEIR User Setting Translation
          //                - AND THEY WOULD HAVE NEVER EXPLICITLY SET THE VERSE TRANSLATION
       // fwMemoryVerseTranslation.setTranslation(memoryVerseScriptRefSanitized, activeTranslation);
        }

        // retain this active translation in our in-memory structure (for convenience)
        // ... currently used by our Audio Play
        fw.memoryVerseState[memoryVerseScriptRefSanitized].activeTranslation = activeTranslation;

        log(`our activeTranslation: ${activeTranslation}`);

        // force the <radio> to the desired translation (from our state)
        // ... obtain the radio under this memoryVerseDiv
        //                                  EX: querySelector('input[name="luk_9_23-24"][value="NLT"]').checked = true;
        const memoryVerseRadio = memoryVerseDiv.querySelector(`input[name="${memoryVerseScriptRefSanitized}"][value="${activeTranslation}"]`);
        // ... set it's value to the desired translation
        memoryVerseRadio.checked = true;

        // change scripture link to the desired translation
        // ... obtain the scripture link
        const memoryVerseLink = memoryVerseDiv.querySelector('a');
        // ... set it's href value
        memoryVerseLink.href = fwSettings.constructBibleURL(memoryVerseScriptRef, activeTranslation);

        // manage the visibility of the subordinate "translation" <div>'s
        // ... only one visible at a time (base on the verse's translation state
        translationDivs.forEach(translationDiv => {
          // obtain the translation of this translationDiv
          const divsTranslation = translationDiv.dataset.memoryVerseTranslation;

          log(`processing divsTranslation: ${divsTranslation}`);

          // show/hide div base on if it is our active translation
          if (divsTranslation === activeTranslation) {
            translationDiv.style.display = 'block'; // or 'flex', 'inline', etc., depending on your layout
            log(`SHOWING: ${divsTranslation}`);
          }
          else {
            translationDiv.style.display = 'none';
          }
        });

      });
    }
    
    //*--------------------------------------------------------------------------
    //* PUBLIC: fw.handleMemoryVerseTranslationChange(translationSelectionElm)
    //* 
    //* Event handler that retains changes to our memoryVerseTranslation state
    //*--------------------------------------------------------------------------
    // ... state-related-memoryVerseTranslation:
    fw.handleMemoryVerseTranslationChange = function(event) {
      const log = logger(`${logPrefix}:handleMemoryVerseTranslationChange()`);

      const radioElm       = event.target;
      const memoryVerseKey = radioElm.name;  // EX: "luk_9_23-24"
      const translation    = radioElm.value; // EX: "NLT"

      log(`retaining state for memory verse translation: `, {memoryVerseKey, translation});

      // retain this change in our state
      // ... handles persistance/reflection automatically
      fwMemoryVerseTranslation.setTranslation(memoryVerseKey, translation);

      // reactively reset our audio playback to reactively adapt to translation changes (when it is configured to play this verse)
      const verse = memoryVerseKey.replaceAll('_', '.'); // EX: "luk.9.23-24"
      audioResetOnVerseTranslationChange(verse);
    }

    
    //***************************************************************************
    //***************************************************************************
    //* Code Related to Audio Play (BOTH multi-verse and single-verse)
    //* ... NOTE: all encompassing logging filter: setLogFilters('*udio*') ... handles case-insensitive "Audio" found in all relevant functions
    //***************************************************************************
    //***************************************************************************

    // USE CONSISTENT TERMS for the audio being played:
    // > I KINDA GAVE UP ON THIS ... I think it is OK
    // - N: track ... generic term for an audio track (only used in a single comment)
    // - N: clip .... another generic term (current usage in startingMultiVerseAudioClip.m4a)
    // - Y: verse ... specific to our app domain (used BOTH in verse refs [e.g. 'jhn.3.16'], and audio file refs [e.g. 'Memorization/php.4.8.NIV.m4a'])

    // the starting track (a short intro 'blank', needed to activate/reset the audio controls)
    const startingMultiVerseAudioClip = 'Memorization/startingMultiVerseAudioClip.m4a';

    // audio context (what we are playing)
    // - INITIAL STATE:    'none' ... not used explicitly - simply triggers change in context state
    // - FOR MULTI  VERSE: 'multi-verse'
    // - FOR SINGLE VERSE: 'luk.9.23-24', 'php.4.8', etc.
    fw.audioContext = 'none';

    // is the current fw.audioContext multi-verse?
    function isAudioContext_multiVerse() {
      return fw.audioContext === 'multi-verse';
    }

    // is our current fw.audioContext single-verse?
    function isAudioContext_singleVerse() {
      return !isAudioContext_multiVerse();
    }

    // audio control "play" button
    fw.audio_play = function(audioContext) { // audioContext ... see: fw.audioContext (above)
      const log = logger(`${logPrefix}:audio_play()`);
      log(`application play button pressed - audioContext: '${audioContext}'`);

      // our <audio> control
      const audio = document.getElementById("audio_player");
      

      // NOTE: THINGS WE CAN DO WITH audio:
      //       - audio.play();     // playing <audio>
      //       - audio.pause();    // pause <audio>
      // 
      //       - audio.src = 'xx'; // load new src file
      //       - audio.load();     // activate the new audio src

      // clear any left-over user messages (for good measure)
      setMultiVerseUserMsg();

      // for same context, just play (pick up where we left off)
      if (audioContext === fw.audioContext) { 
        log(`same context ('${audioContext}') ... just re-activate <audio> play (pick up were we left off)`);
        audio.play();
      }
      // for change in context, reset and play new context
      else {
        // retain our new audioContext
        log(`new context: '${audioContext}' ... prior context: '${fw.audioContext}'`);
        fw.audioContext = audioContext;

        // reset our audio and start playing it
        // NOTE: because setAudioSrc() handles audioContext (in addiation to YouVersion verse)
        //       this logic is IDENTICAL to either single-verse or multi-verse :-)
        setAudioSrc(audioContext);
        audio.play();
      }
          
    }

    // audio control "pause" button
    fw.audio_pause = function() {
      const log = logger(`${logPrefix}:audio_pause()`);
      log(`application pause button pressed`);

      // our <audio> control
      const audio = document.getElementById("audio_player");

      // we simply pause the <audio>
      log(`activate <audio> pause`);
      audio.pause();
    }      

    // audio control "volume up"
    fw.audio_volumeUp = function () {
      const log = logger(`${logPrefix}:audio_volumeUp()`);
      const audio  = document.getElementById("audio_player");
      audio.volume = Math.min(1, audio.volume + 0.1);
      log(`volume set to: ${audio.volume}`);
    };

    // audio control "volume down"
    fw.audio_volumeDown = function () {
      const log = logger(`${logPrefix}:audio_volumeDown()`);
      const audio  = document.getElementById("audio_player");
      audio.volume = Math.max(0.1, audio.volume - 0.1); // KISS: since we do NOT have a mute indicator, our minimum volume is 0.1
      log(`volume set to: ${audio.volume}`);
    };

    // audio play has just ended
    // ... INVOKED FROM: implicitly - when the clip is complete (NOTE: there is ALWAYS a starting clip: startingMultiVerseAudioClip ... which allows the audio control to be active/enabled)
    fw.audio_ended = function() {
      const log = logger(`${logPrefix}:audio_ended()`);
      log(`audio ended ... loading next verse`);
      
      // our <audio> control
      const audio = document.getElementById("audio_player");

      // handle single-verse context
      // ... very simple process
      if ( isAudioContext_singleVerse() ) {
        log(`handle single-verse context ...`);

        // set/play same verse (possibly different translation)
        setAudioSrc(fw.audioContext);
        audio.play();

        return;
      }

      // handle multi-verse context
      // ... more involved
      log(`handle multi-verse context ...`);

      // programmatically advance to our next verse to play
      // ... EX: 'luk.9.23-24' -or- undefined for NOTHING to play
      const nextVerse = advanceAudioToNextMultiVerse();

      // display user error message, when there is NO nextVerse to play
      // ... user must select at least one verse to play
      if (!nextVerse) {
        log(`NO nextVerse to play - user must select at least one verse to play`);
        setAudioSrc('multi-verse'); // reset to start, so when user presses play, it won't re-play last verse played (when multi-play has succeeded previously)
        setMultiVerseUserMsg(`You must select at least one verse to play (from the audio checkboxes - far right of the TOC [above]).`);
        return;
      }

      // set/play next verse (with latest translation)
      setAudioSrc(nextVerse);
      audio.play();

      // scroll to verse being played (per user request)
      // NOTE 1: cell phone in sleep mode: STILL WORKS (I was supprised to see this)
      // NOTE 2: cell phone usage is intermedent
      //         - appears to be selected verses that SIMPLY DOES NOT navigate too :-(
      //         - CAN'T DETERMINE WHY (NO ERROR GENERATED)
      if (fwCompletions.isComplete('multiVerseView')) {
        const nextVerseSanitized = nextVerse.replaceAll('.', '_');
        const nextVerseElm = document.getElementById(nextVerseSanitized);
        nextVerseElm.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    // set <audio> src from supplied verse
    // PARAM: verse: 'luk.9.23-24' (YouVersion verse format) -or- 'multi-verse' (consistent with audioContext)
    // NOTES: - this is a flexible/re-usable function
    //          * it can be used for BOTH initialization, or next verse in multi-verse
    //        - also: it will insure current active translation is honored
    //          * so for single-verse, you can invoke it with the same verse (to pick up the active translation)
    function setAudioSrc(verse) {
      const log = logger(`${logPrefix}:setAudioSrc()`);
      log(`processing supplied verse: '${verse}'`);

      // our <audio> control
      const audio = document.getElementById("audio_player");

      let audioFile = '';

      // handle 'multi-verse' special case - initializing to the starting blank audio
      if (verse === 'multi-verse') {
        audioFile = startingMultiVerseAudioClip;
      }
      // handle normal verse (ex: 'luk.9.23-24')
      else {
        // we glean the translation from our cached memory state (derived from the html)
        // - it would be easier to pull it from our persistent state
        //   * BUT if the translation has never been explicitly selected, it will not be set in our persistent state!
        //   * By gleaning this from our cached memory state, we use what is displayed to the user (with the default semantics applied)
        const verseSanitized     = verse.replaceAll('.', '_');
        const activeTranslation  = fw.memoryVerseState[verseSanitized].activeTranslation;
        
        // format verse to the audio file entry
        // EX: src="Memorization/php.4.8.NIV.m4a"
        audioFile = `Memorization/${verse}.${activeTranslation}.m4a`;
      }

      // KEEP TRACK of the current verse being played within multi-verse
      // ... this is special case logic for multi-verse only
      if (isAudioContext_multiVerse()) {
        fw.memoryVerseState.curMultiVerse = verse;
      }
      
      // load the desired <audio> src
      log(`setting <audio> src to: '${audioFile}'`);
      audio.pause();         // pause audio play, if any ... for good measure, doesn't hurt
      audio.src = audioFile; // set the src
      audio.load();          // load the the src
      
      // NOTE: audio load errors are handled through 'error' event listener of the <audio> element
      //       ... invoking: fw.audio_loadError(event) ... see below
      // NOT THIS:
      // try {
      //   audio.src = audioFile; // set the src
      //   audio.load();          // load the the src
      // }
      // catch(e) {
      //   // NotSupportedError: Failed to load because no supported source was found
      //   const msg = `attempting to load audioFile: "${audioFile}" ... with problem: ${e}`;
      //   log.f(msg);
      //   alert(msg);
      // }
    }

    // handle async errors of <audio> load file
    fw.audio_loadError = function(event) {
      const log = logger(`${logPrefix}:audio_loadError()`);

      // SUSPECT ERROR:
      //   NotSupportedError: Failed to load because no supported source was found
      // HOWEVER: we don't actually have access to this error (through the event listener)

      // pull the diagnostics we can get, and report to user (and log)
      const audio = event.target;
      const code  = audio.error?.code;
      const messages = {
        1: 'MEDIA_ERR_ABORTED',
        2: 'MEDIA_ERR_NETWORK',
        3: 'MEDIA_ERR_DECODE',
        4: 'MEDIA_ERR_SRC_NOT_SUPPORTED'
      };
      const msg = `attempting to load audioFile: "${audio.src}" ... failed with code: ${code}: "${messages[code] || 'Unknown Error'}" ... suspect missing audio file`;
      log.f(msg);
      alert(msg); // NOTE: we can get by with an alert, as this problem is most likly developer error (missing audio file)

      // reset audio source, so an immediate re-play will trigger this same error
      setAudioSrc('multi-verse'); // ... we can get by with multi-verse, because the verse in error, will re-set it appropriatly
    }


    // utility to advance to the next multi-verse
    // NOTES:
    // - More intuitive for users who expect to continue from the next verse in sequence.
    // - No sudden jumps to the first verse unless necessary.
    // RETURNS: YouVersion verse format (ex: 'luk.9.23-24')
    function advanceAudioToNextMultiVerse() {
      const log = logger(`${logPrefix}:advanceAudioToNextMultiVerse()`);

      // the current verse that just played
      const curMultiVerse = fw.memoryVerseState.curMultiVerse;

      // convenient alias
      // ... EX: allRefs: ['luk.9.23-24', ...],
      const allRefs = fw.memoryVerseState.allRefs;

      // determine our "to play" verses from allRefs through our filter
      // NOTE: this filter is applied once (here)!
      const toPlayRefs = allRefs.filter( (scriptRef) => {
        // apply our various filters
        if (fwCompletions.isPlay(scriptRef)) { // ... is selected for Multi-Verse Audio Review
          return true;
        }
        // TODO: apply MORE criteria in the future ... such as - is the verse section filtere out
        return false;
      });
      log(`toPlayRefs: `, toPlayRefs);

      // no-op if no verses are selected
      // ... possibly the user NEVER selected any verses to play, or deselected all mid-play
      if (toPlayRefs.length === 0) {
        log(`nothing to play - user must select at least one verse to play`);
        return undefined; // NOTHING to play
      }

      // locate index of curMultiVerse from allRefs
      // ... -1 if NOT THERE (on a reset control, when nothing is being played)
      const curIndex = allRefs.indexOf(curMultiVerse);
      
      // iterate over allRefs, but use toPlayRefs for matching
      // ... see NOTE (in description)
      for (let i=1; i<=allRefs.length; i++) {
        const nextIndex = (curIndex + i) % allRefs.length;
        const nextVerse = allRefs[nextIndex];
        
        if (toPlayRefs.includes(nextVerse)) {
          log(`returning next verse to play: '${nextVerse}'`);
          return nextVerse; // located the next verse to play (within our `toPlay` filtered items)
        }
      }
      
      // for completeness
      // ... should never get here if at least one verse is available "toPlay" (see "NOTHING to play" above)
      log(`SHOULD NEVER GET HERE (per logic) ... nothing to play - user must select at least one verse to play`);
      return undefined;
    }

    // utility to display user message within the "Multi-Verse Audio Review" section
    // PARAM: msg - message to display to user (omit to clear message)
    function setMultiVerseUserMsg(msg='') {
      document.getElementById("multi-verse-user-msg").innerText = msg;
    }

    // reset our audio control when a verse translation changes
    // - ONLY WHEN it is configured to play the supplied memoryVerse
    // - retaining it's active play status (pause/play)
    // 
    // PARM: verse ... the memory verse that who's translation just changed (ex: "luk.9.23-24")
    function audioResetOnVerseTranslationChange(verse) {
      const log = logger(`${logPrefix}:audioResetOnVerseTranslationChange()`);
      log(`in audioResetOnVerseTranslationChange(verse: '${verse}')`);

      // our <audio> control
      const audio = document.getElementById("audio_player");

      // no-op if the audio control is NOT configured to play this verse
      if (!audio.src.includes(verse)) {
        log(`NO-OPing ... our audio control is NOT configured to play this verse ... audio.src: '${audio.src}'`);
        return;
      }

      // when the audio control is configured to play this verse ...
      log(`our audio control is configured to play this verse`);
      
      // determine if the audio is is activally playing
      // ... needed for subsequent reset
      const audioActivelyPlaying = isAudioPlaying();

      // re-configure the audio control to play the same verse, re-configured to the updated translation
      // ... this will automatically pause the playback (if it is currently playing)
      log(`re-configure the audio control to play the same verse, re-configured to the updated translation`);
      setAudioSrc(verse);

      // re-activate the audio play, when it was playing previously
      if (audioActivelyPlaying) {
        log(`re-activate the audio play, because it was playing previously`);
        audio.play();
      }
      else {
        log(`the audio play was previously NOT playing, so leave it in that state`);
      }

      // via ChatGPT ... simple inner function (for now)
      function isAudioPlaying() {
        // NOTE: this is rather involved, but it is accurate in all cases
        //       You may think you can simply interogate audio.paused, 
        //       but this can give false indicators due to the
        //       asynchronous nature of audio, and/or when buffering occurs, etc.
        return (audio.currentTime > 0 && // playback has started
                !audio.paused         && // is currently playing ... see NOTE (above)
                !audio.ended          && // playback has NOT ended
                audio.readyState >= 3);  // browser has enough data to play (HAVE_FUTURE_DATA or higher)
      }
    }


    //***************************************************************************
    //***************************************************************************
    //* Code Related to managing large images
    //***************************************************************************
    //***************************************************************************

    //*--------------------------------------------------------------------------
    //* PUBLIC: fw.addZoomableImage()
    //* 
    //* A Zoomable Image Utility
    //* 
    //* CREDIT: Modified Version of: https://www.cssscript.com/image-zoom-pan-hover-detail-view/
    //* USAGE:  follow this pattern:
    //*          <center>
    //*            <figure>
    //*              <div id="ActsOverview2"></div>
    //*              <figcaption>Hover to zoom, Click to open in new tab</figcaption>
    //*            </figure>
    //*          </center>
    //*          <script>
    //*            fw.addZoomableImage('ActsOverview2', 'Acts.png', 90);
    //*          </script>
    //*--------------------------------------------------------------------------
    fw.addZoomableImage = function(imageContainerId, imgSrc, widthPercent) {
      const log = logger(`${logPrefix}:addZoomableImage()`);

      log(`processing parms: `, {imageContainerId, imgSrc, widthPercent});

      const imageContainer = document.getElementById(imageContainerId);

      // obtain the width of our page container (used to compute image width from supplied widthPercent)
      // ... NOTE: this is specific to GitBook (so it will only work in that environemt)
      const gitbookContainer      = document.getElementById('book-search-results');
      let   gitbookContainerWidth = gitbookContainer.clientWidth; // ... offsetWidth INCLUDES border width -or- clientWidth which does not

      // obtain the image width/height calculate it's ratio
      // ... this is gleaned by creating a temporary Image object
      let   imgHeight = 100; // ... temporary defaults (changed below)
      let   imgWidth  = 100;
      let   ratio     = 1;
      const img = new Image();
      img.src = imgSrc;
      img.onload = () => {
        imgHeight = img.naturalHeight;
        imgWidth  = img.naturalWidth;
        ratio     = imgHeight / imgWidth;

        // apply baseline css style to render image as a background
        // ... we do this inside our temporary image on-load so as to have access to the updated ratio
        let widthInPx = widthPercent/100*gitbookContainerWidth;
        log(`img.onLoad() showing ${imgSrc} at ${widthPercent}% or ${widthInPx}px`);
        Object.assign(imageContainer.style, {
          // honor the desired width 
          width:      `${widthInPx}px`,
          height:     `${widthInPx*ratio}px`, // ... height is proportioned to display entire image

          // nice rounded border
          borderRadius: '8px',

          // display image as background
          background: `url("${imgSrc}")`,
          backgroundPosition: 'center',
          backgroundSize:     'cover',
        });
      }

      // monitor window size changes to adjust image percentage
      const ro = new ResizeObserver( entries => {
        for (let entry of entries) {
          gitbookContainerWidth = entry.target.clientWidth; // adjust width
          let widthInPx = widthPercent/100*gitbookContainerWidth;
          Object.assign(imageContainer.style, {
            width:      `${widthInPx}px`,
            height:     `${widthInPx*ratio}px`, // height is proportioned to display entire image
          });
        }
      });
      ro.observe(gitbookContainer);


      // register mouse move event (hover) to engage the zoom
      imageContainer.onmousemove = (e) => {
        const rect     = e.target.getBoundingClientRect();
        const xPos     = e.clientX - rect.left;
        const yPos     = e.clientY - rect.top;
        const xPercent = xPos / (imageContainer.clientWidth / 100) + "%";
        const yPercent = yPos / ((imageContainer.clientWidth * ratio) / 100) + "%";
        
        Object.assign(imageContainer.style, {
          backgroundPosition: xPercent + " " + yPercent,
          backgroundSize:     imgWidth + "px"
        });
      };

      // register mouse leave event to reset the zoom
      imageContainer.onmouseleave = (e) => {
        log(`imageContainer.onmouseleave() for ${imgSrc} ... resetting image`);
        Object.assign(imageContainer.style, {
          backgroundPosition: 'center',
          backgroundSize:     'cover'
        });
      };

      // register click event to open image in new tab/window
      imageContainer.onclick = (e) => {
        window.open(imgSrc, "_blank");
      };
    }



    //***************************************************************************
    //***************************************************************************
    //* Code Related to establishing non-spamable email links.
    //***************************************************************************
    //***************************************************************************

    //*--------------------------------------------------------------------------
    //* PUBLIC: fw.addInquire(subj)
    //* 
    //* Inject our email address using JS.
    //* 
    //*   Used in an attempt to avoid spam (since most crawlers process the server-side renered html)
    //*   NOT foolproof, but nothing is :-(
    //* 
    //* NOTES:
    //*  - assumes content injected in DOM ID: "inquire"
    //*    EX: <span id="inquire"></span>
    //*  - subj parameter should be suitable to be used in href mailto ref (i.e. NO SPACES)
    //*--------------------------------------------------------------------------
    fw.addInquire = function(subj='Saw%20Your%20WebPage') {
      const mailToContainer = document.getElementById('inquire');
      const me = 'inquire';
      const at = 'wiiBridges&#46;com';
      mailToContainer.innerHTML = `<a href="mailto:${me}&#64;${at}?Subject=${subj}" target="_top">${me}&#64;${at}</a>`;
    }

    //***************************************************************************
    //***************************************************************************
    //* Code Related to our settings (User Preferences)
    //* ... state-related-settings
    //***************************************************************************
    //***************************************************************************

    //***************************************************************************
    //* Code Related to syncDeviceStoreOnSignOut - Sync Device Storage From Cloud on Sign-Out
    //* ... state-related-settings
    //***************************************************************************

    //*--------------------------------------------------------------------------
    //* PUBLIC: fw.handleSetting_syncDeviceStoreOnSignOut(copyOptCheckBoxElm)
    //* 
    //* Event handler that retains changes to our settings state
    //*--------------------------------------------------------------------------
    // ... state-related-settings:
    fw.handleSetting_syncDeviceStoreOnSignOut = function(copyOptCheckBoxElm) {
      const log = logger(`${logPrefix}:handleSetting_syncDeviceStoreOnSignOut()`);

      log(`changed: ${copyOptCheckBoxElm.checked}`);

      // retain this change in our state
      // ... handles persistance/reflection automatically
      fwSettings.setSyncDeviceStoreOnSignOut(copyOptCheckBoxElm.checked);
    }
    
    // register reflective code that syncs our UI on syncDeviceStoreOnSignOut setting changes
    // ... state-related-settings
    fwSettings.onSyncDeviceStoreOnSignOutChange( syncSyncDeviceStoreOnSignOutChanges );

    //*--------------------------------------------------------------------------
    //* INTERNAL: syncSyncDeviceStoreOnSignOutChanges()
    //* 
    //* hmmmm - this fn name is a bit querky (syncSync...), but is a standard BECAUSE we are:
    //* Syncing our UI when syncDeviceStoreOnSignOut changes.
    //* 
    //* It is automatically invoked for:
    //*  - page navigation (GitBook page change) ... see: fw.pageSetup()
    //*  - syncDeviceStoreOnSignOut settings changes ... see: fwSettings.onSyncDeviceStoreOnSignOutChange()
    //*--------------------------------------------------------------------------
    // ... state-related-settings
    function syncSyncDeviceStoreOnSignOutChanges() {
      const log = logger(`${logPrefix}:syncSyncDeviceStoreOnSignOutChanges()`);

      // found on settings.md page (when active)
      const copyOptCheckBox = document.getElementById('setting_syncDeviceStoreOnSignOut');
      if (copyOptCheckBox) {
        const val = fwSettings.isSyncDeviceStoreOnSignOut();
        log(`syncing UI: ${val}`);
        copyOptCheckBox.checked = val;
      }  
      else {
        log(`nothing to sync in UI`);
      }
    }


    //***************************************************************************
    //* Code Related to Bible Translation (in support of dynamic selection)
    //* ... state-related-settings
    //***************************************************************************

    //*--------------------------------------------------------------------------
    //* PUBLIC: fw.alterBibleVerseLink(e, scriptureRef)
    //* 
    //* Alter the supplied <a> tag href to the supplied YouVersion
    //* scriptureRef, dynamically injecting the appropriate 
    //* Bible Translation (ex: NIV, KJV, etc.) from the user's preference.
    //*
    //* This event should be registered on a hover action (e.g. the mouseover event),
    //* allowing the the the browser status to correctly reflect the updated URL.
    //*
    //* PARMS:
    //*   e:            The event from the invoking <a> tag
    //*   scriptureRef: The YouVersion Bible App scripture reference (ex: 'mrk.1.2')
    //*
    //* This utility has the following advantages:
    //*  - The bible site URL is centralized.  Any changes by YouVersion Bible app
    //*    can be isolated in this routine.
    //*  - The Bible translation (ex: NIV, KJV, etc.) is dynamically determined
    //*    via a user preference.
    //* 
    //* USAGE: 
    //*   <a href="#" onmouseover="alterBibleVerseLink(event, 'mrk.1.2')" target="_blank">Mark 1:2</a>
    //*--------------------------------------------------------------------------
    fw.alterBibleVerseLink = function(e, scriptureRef) {
      const log = logger(`${logPrefix}:alterBibleVerseLink()`);

      // define the full URL
      const url = fwSettings.constructBibleURL(scriptureRef); // use translation defined in fwSettings (because 2nd param [translation] is NOT specified)

      // overwrite the href of the invoking <a> tag
      // NOTE: because e.preventDefault() is not used, the browser
      //       will open the link in a new tab based on the updated href
      log(`updating href with: ${url}`);
      e.currentTarget.href = url;
    }


    //*--------------------------------------------------------------------------
    //* PUBLIC: fw.genBibleTranslationsSelection(bibleTranslationsElmId)
    //* 
    //* Generate an html selection list for bibleTranslations
    //*
    //* USAGE: 
    //*   <select id="bibleTranslations"></select>
    //*   <script>
    //*     genBibleTranslationsSelection('bibleTranslations');
    //*   </script>
    //*--------------------------------------------------------------------------
    fw.genBibleTranslationsSelection = function(bibleTranslationsElmId) {
      const selectElm = document.getElementById(bibleTranslationsElmId);
      let   groupElm  = null; // running value
      const bibleTranslations = fwSettings.bibleTranslations;
      for (const bibleTranslationKey in bibleTranslations) {
        const bibleTranslation = bibleTranslations[bibleTranslationKey];
        if (bibleTranslation.code === 'GROUP') {
          groupElm = document.createElement('optgroup');
          groupElm.setAttribute('label', bibleTranslation.desc);
          selectElm.appendChild(groupElm);
        }
        else {
          const optionElm       = document.createElement('option');
          optionElm.textContent = `${bibleTranslationKey} (${bibleTranslation.desc})`;
          optionElm.value       = bibleTranslationKey;
          (groupElm || selectElm).appendChild(optionElm);
        }
      }

      // default the list selection to what is retained in our persistent settings
      // ... state-related-settings:
      selectElm.value = fwSettings.getBibleTranslation();

      // add an event handler to retain the current selection in localStorage  
      // ... state-related-settings:
      selectElm.addEventListener('change', function(e) {

        // retain the selected bibleTranslation in our active settings
        // ... handles persistance/reflection automatically
        fwSettings.setBibleTranslation(e.target.value);
      });

    }

    // register reflective code that syncs our UI on bibleTranslation setting changes
    // ... state-related-settings
    fwSettings.onBibleTranslationChange( syncBibleTranslationChanges );

    //*--------------------------------------------------------------------------
    //* INTERNAL: syncBibleTranslationChanges()
    //* 
    //* Syncs our UI when bibleTranslation changes.
    //* 
    //* It is automatically invoked for:
    //*  - page navigation (GitBook page change) ... see: fw.pageSetup()
    //*  - bibleTranslation settings changes ... see: fwSettings.onBibleTranslationChange()
    //*--------------------------------------------------------------------------
    // ... state-related-settings
    function syncBibleTranslationChanges() {
      const log = logger(`${logPrefix}:syncBibleTranslationChanges()`);

      // sync our GitBook LeftNav Header
      syncLeftNavHeader();

      // ALSO, sync the "Bible Translation" selection list
      // - when we are on the settings page
      // - this is needed for seperate app instances, that did NOT initiate the change
      const selectElm = document.getElementById('bibleTranslations'); // ... kinda bad that this id is simply globally known :-(
      if (selectElm) { // ... if NOT defined, then we are NOT on the settings page - NO WORRIES
        selectElm.value = fwSettings.getBibleTranslation();
      }
    }

    // synchronize our GitBook LeftNav Header
    // ... common to a couple of processes
    function syncLeftNavHeader() {
      const log = logger(`${logPrefix}:syncLeftNavHeader()`);

      // locate OUR well-known header (in GitBook'se LeftNav)
      // ... example:
      //       <div class="book-summary">
      //         ... snip snip
      //         <nav role="navigation">
      //           <ul class="summary">
      //             <li class="header">FW v18.0 • KJV • Guest</li>  <<< locates this
      //             ... snip snip
      const headerElm = document.querySelector('.book-summary nav ul li.header');
      if (!headerElm) {
        log.f(`**BAD** can't find well-known headerElm ... NO-OP synchronization :-(`);
        return;
      }

      // sync our UI LeftNav that contains the active bibleTranslation
      const bibleTranslation = fwSettings.getBibleTranslation();
      const userName         = fwUser.getUserName();
      log(`syncing our UI with: ${bibleTranslation} - ${userName}`);
      headerElm.textContent = `FW v${CUR_VER} • ${bibleTranslation} • ${userName}`;
    }

    //***************************************************************************
    //***************************************************************************
    //* Code Related to User Authentication Changes ... sign-in / sign-out
    //***************************************************************************
    //***************************************************************************

    // promote sign-in/sign-out utils
    fw.handleSignInWithEmailPass  = handleSignInWithEmailPass;
    fw.handleSignUpWithEmailPass  = handleSignUpWithEmailPass;
    fw.handlePasswordReset        = handlePasswordReset;
    fw.requestSignOutConfirmation = requestSignOutConfirmation;
    fw.cancelSignOutConfirmation  = cancelSignOutConfirmation;
    fw.signOut                    = signOut;
    fw.maintainUserName           = maintainUserName;

    // function to maintain userName for signed-in users
    function maintainUserName(e) {
      // fetch new value from our text box
      const newVal = e.target.value.trim();

      // validate it
      const msgElm = document.getElementById('maintainUserNameMsg');
      // ... must be signed-in (sanity check - UI already facilitates this)
      if (fwUser.isSignedOut()) {
        msgElm.textContent = 'user name can only be altered for signed-in users.';
        return;
      }
      // ... may NOT contain 'guest'
      if (newVal.toLowerCase().indexOf('guest') !== -1) {
        msgElm.textContent = `user name may NOT contain 'guest'.`;
        return;
      }

      // update userName in our persistent settings
      fwSettings.setUserName(newVal);
      msgElm.textContent = ''; // clear msg
    }

    // register reflective code that syncs our UI on changes in User Identity
    fwUser.onChange(syncUserChangeInUI);
    
    //*--------------------------------------------------------------------------
    //* INTERNAL: syncUserChangeInUI()
    //* 
    //* Syncs our UI for User Identity changes.
    //* 
    //* It is automatically invoked for:
    //*  - page navigation (GitBook page change) ... see: fw.pageSetup()
    //*  - User Identity changes ... see: fwUser.onChange()
    //*--------------------------------------------------------------------------
    function syncUserChangeInUI() {
      const log = logger(`${logPrefix}:syncUserChangeInUI()`);

      // sync our GitBook LeftNav Header (it contains userName)
      syncLeftNavHeader();

      // dynamically reflect the userName of the active user
      // ... auto synced on user identity change (because that is the controller we are in)
      const userName = fwUser.getUserName();
      // ... obtain all userName elements on this page (using dom element attribute: data-fw-user-name)
      const userNameElms = document.querySelectorAll('[data-fw-user-name]');
      // ... sync them
      userNameElms.forEach(elm => {
        elm.textContent = userName;
      });
      // ... also, the userName maintenance form (found in settings.md of a signed-in user)
      const maintainUserNameElm = document.getElementById('maintainUserName');
      if (maintainUserNameElm) {
        maintainUserNameElm.value = userName;
      }

      // dynamically reflect the userEmail of the active user
      // ... auto synced on user identity change (because that is the controller we are in)
      const userEmail = fwUser.getEmail();
      // ... obtain all userEmail elements on this page (using dom element attribute: data-fw-user-email)
      const userEmailElms = document.querySelectorAll('[data-fw-user-email]');
      // ... sync them
      userEmailElms.forEach(elm => {
        elm.textContent = userEmail;
      });

      // manage the quad-state visuals of our sign-in page (found in settings.md)
      const domGuest = document.getElementById('sign-in-form-guest');
      // ... process if we are ON the settings.md sign-in page
      //     ALL THREE are on the same page, so we just reason about the existance of the first
      if (domGuest) {
        const domSignedIn        = document.getElementById('sign-in-form-signed-in');
        const domConfirmSignOut  = document.getElementById('sign-out-confirmation');

        const showGuest          = fwUser.isSignedOut();
        const showSignedIn       = fwUser.isSignedIn()  && !fwUser.isSignOutBeingConfirmed();
        const showConfirmSignOut = fwUser.isSignedIn()  && fwUser.isSignOutBeingConfirmed();
        
        domGuest.style.display          = showGuest          ? 'block' : 'none';
        domSignedIn.style.display       = showSignedIn       ? 'block' : 'none';
        domConfirmSignOut.style.display = showConfirmSignOut ? 'block' : 'none';
      }

      // manage the state synchronization note, that dynamically changes,
      // based on whether the user is signed-in or signed-out.
      const domStateNoteSignedOut = document.getElementById('state-sync-note-signed-out');
      if (domStateNoteSignedOut) {
        const domStateNoteSignedIn = document.getElementById('state-sync-note-signed-in');

        domStateNoteSignedOut.style.display  = fwUser.isSignedOut() ? 'block' : 'none';
        domStateNoteSignedIn.style.display   = fwUser.isSignedIn() ? 'block' : 'none';
      }
    }


    //***************************************************************************
    //***************************************************************************
    //* Misc Code
    //***************************************************************************
    //***************************************************************************

    // toggle the visibility of supplied password input element
    fw.togglePasswordVisibility = function(passElmId) {
      const passElm    = document.getElementById(passElmId);
      const toggleType = passElm.type === 'password' ? 'text' : 'password';
      passElm.type     = toggleType;
    }

    // toggle display of length descriptions
    fw.toggleDesc = function() {
      const log = logger(`${logPrefix}:toggleDesc()`);

      // determine our target state: show/hide
      const buttons = document.querySelectorAll('[data-fw-desc-toggle]');
      const show = buttons.length > 0 && buttons[0].textContent.toLowerCase().includes('show');
      log(`toggle display of lengthy descriptions: ${show ? 'show' : 'hide'}`);

      // toggle any data-fw-desc-toggle button label (there can be many)
      buttons.forEach(buttonElm => {
        buttonElm.textContent = `${show ? 'Hide' : 'Show'} Descriptions`;
      });

      // apply directive to all data-fw-desc elements
      const descElms = document.querySelectorAll('[data-fw-desc]');
      descElms.forEach(elm => {
        elm.style.display = show ? 'block' : 'none';
      });
    }

    
    //***************************************************************************
    //***************************************************************************
    //* PUBLIC: fw.pageSetup() - perform setup of each page (once it is loaded)
    //***************************************************************************
    //***************************************************************************
    fw.pageSetup = function() {
      const log = logger(`${logPrefix}:pageSetup()`);

      log('performing common setup of each page (once it is loaded)');

      // sync User Identity related
      syncUserChangeInUI();

      // sync ALL completed checkboxes on the current page
      // ... state-related-completions
      syncUICompletions();

      // reflect the dynamic bibleTranslation on initial page load
      // ... state-related-settings
      syncBibleTranslationChanges();

      // reflect change on sign-out confirmation (settings.md)
      // ... state-related-settings
      syncSyncDeviceStoreOnSignOutChanges();

      // sync aspects of the Memorization page (Memorization.md)
      // ... state-related-memoryVerseTranslation
      syncUIMemoryVerseTranslation();
    }

    //*************************************
    //* promote our "module scoped" fw obj
    //*************************************

    // NOTE: we do this here (rather setting from the IIFE invoker)
    //       to allow our subsequent steps to operate (with this context in-place)
    window.fw = fw;


    //*******************************************************
    //* execute any queued functions that requires window.fw
    //*******************************************************

    // define a logger that is available to window.withFW() function
    // ... a non-module-scoped script
    // ... see definition in: MyWeb/FireWithin/gitbook-plugin-my-plugin/preProcessPage.js
    const withFWLog  = logger(`${logPrefix}:withFW()`);
    window.withFWLog = withFWLog;

    // process queued withFW() functions
    // ... now that window.fw is defined (via our fw.js expansion)
    window.withFWQue.forEach( (fn) => {
      const fnName = fn.name || 'anonymous';
      withFWLog(`executing DELAYED function: '${fnName}' ... now that window.fw is defined (via fw.js expansion)`);
      fn();
    });

    // clear the que
    window.withFWQue = [];

  })(); // IIFE end

} // ... end of ... if (!window.fw) {
