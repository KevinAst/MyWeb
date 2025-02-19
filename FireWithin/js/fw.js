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
    const CUR_VER = '24.3';


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
    //* Code Related to Audio Controls
    //***************************************************************************
    //***************************************************************************

    //*--------------------------------------------------------------------------
    //* INTERNAL: stopAudioPlayback
    //* 
    //* Stop the supplied audioElm playback.
    //*
    //* PARMS:
    //*   audioElm: The <audio> element to stop playback on
    //* 
    //*--------------------------------------------------------------------------
    function stopAudioPlayback(audioElm) {
      const log = logger(`${logPrefix}:stopAudioPlayback()`);
      log(`stopping <audio> control from playing`);

      audioElm.pause();         // pause the audio
      audioElm.currentTime = 0; // reset playback to the start
    }

    //*--------------------------------------------------------------------------
    //* PUBLIC: fw.preventConcurrentAudioPlayback(currentAudioElm)
    //* 
    //* Event handler that stops ALL current page <audio> playback except the
    //* supplied currentAudioElm
    //* 
    //* PARMS:
    //*   currentAudioElm: The <audio> element that has just started to play it's audio.
    //*
    //*--------------------------------------------------------------------------
    fw.preventConcurrentAudioPlayback = function(currentAudioElm) {
      // get all <audio> elements on our page
      const audioElms = document.querySelectorAll('audio');

      // pause all other audio elements
      audioElms.forEach(audioElm => {
        if (audioElm !== currentAudioElm) {
          stopAudioPlayback(audioElm);
        }
      });
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
      // 
      //       HOWEVER: We do use this state for: MVAP: Multi-Verse Audio Play (mvap)
      // 
      if (!fw.memoryVerseState) { // ... VERIFIED: executed on FIRST NAVIGATION to the Memorization.md page (NOT subsequent navigations)
        log(`creating fw.memoryVerseState (only once)`);

        fw.memoryVerseState = {

          // NOTE: This is mostly documentation (i.e. comments), so you can easily see what the contents are.
          //       This structure is built in the code following this doc :-)

          // all verse references
          allRefs: [/*'luk.9.23-24', ...*/],

          // current verse being played
          // EX: 'luk.9.23-24'
          // OR: '' for RESET (start from beginning)
          curVerse: '',

          // one entry for each verse (a sample - for reference)
          // "luk_9_23-24": {      // indexed by: id
          //   ref: 'luk.9.23-24', // scripture reference
          //   activeTranlsation: 'NLT', // maintained at run-time for convenience
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

      // activate our audio control
      // - this loads it with our starting audio src
      //   * this is necessary to enable the controls (otherwise the controls are disabled)
      // - this is the right spot to activate the control
      //   * it is required for:
      //     - page refreshes .... otherwise the audio control is NOT active
      //     - page navigation ... ditto
      //   * HOWEVER: we do NOT "desire" it to be done on just normal translation-related state changes
      //              ... what this function is syncing
      //              ... such as a translation selection
      //              - BECAUSE: we want the Multi-Verse Audio Play to continue to play
      //                         and pick up these changes dynamically (during it's play)
      //                         ... very kook indeed
      //              - THEREFORE: we "conditionally" do this, when the audo has NO src
      const audio = document.getElementById("mvap_audio_player"); // audio player for our mvap control
      if (! audio.src) {
        fw.mvap_reset();
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
        // ... currently used by our Multi-Verse Audio Play
        fw.memoryVerseState[memoryVerseScriptRefSanitized].activeTranlsation = activeTranslation;

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

      // stop any audio playback within this scripture reference
      // BECAUSE a change of translation will hide all other translations (one of which may be playing)

      // ... locate the scriptureContainerElm (a great grandparent <div> of our radioElm)
      const scriptureContainerElm = radioElm.parentElement.parentElement.parentElement;

      // ... iterate over ALL <audio> elements within this scripture, stopping their playback
      const audioElements = scriptureContainerElm.querySelectorAll("audio");
      audioElements.forEach((audioElm) => {
        stopAudioPlayback(audioElm);
      });
    }

    
    //***************************************************************************
    //***************************************************************************
    //* Code Related to MVAP: Multi-Verse Audio Play (mvap)
    //* ... a specialized area of memoryVerseTranslation
    //***************************************************************************
    //***************************************************************************

    // USE CONSISTENT TERMS for the audio being played:
    // > I KINDA GAVE UP ON THIS ... I think it is OK
    // - N: track ... generic term for an audio track (only used in a single comment)
    // - N: clip .... another generic term (current usage in startingMultiVerseAudioClip.m4a)
    // - Y: verse ... specific to our app domain (used BOTH in verse refs [e.g. 'jhn.3.16'], and audio file refs [e.g. 'Memorization/php.4.8.NIV.m4a'])

    // the starting track (a short intro, needed to activate/reset the audio controls)
    const startingMultiVerseAudioClip = 'Memorization/startingMultiVerseAudioClip.m4a';

    // audio control "play" button
    // ... INVOKED FROM: user click -OR- programmatically indirectly via audio.play()
    // INTERESTING: Don't really need this code (it does nothing)
    fw.mvap_play = function(audioElm) {
      const log = logger(`${logPrefix}:mvap_play()`);
      log(`play button pressed`);

      // NOTE: We don't want to do anything here
      //       ... the user uses this to kick off the whole process
      //       ... programmatically, we use it kick of the next verse

      // we do however want to stop any other audio element from playing
      fw.preventConcurrentAudioPlayback(audioElm);

      // we also want to clear any left-over user message
      mvap_userMsg();
    }
        
        // audio control "pause" button (actually the play/pause controls toggle ... it's the same button but changes meaning)
    // ... INVOKED FROM: user click -OR- programmatically indirectly via audio.pause()
    // INTERESTING: Don't really need this code (it does nothing)
    fw.mvap_pause = function() {
      const log = logger(`${logPrefix}:mvap_pause()`);
      log(`audio paused`);

      // NOTE: We don't want to do anything here
      //       ... the user just wants to "pause" (i.e. stop the play)
    }

    // audio play has just ended
    // ... INVOKED FROM: implicitly - when the clip is complete (NOTE: there is ALWAYS a starting clip: startingMultiVerseAudioClip ... which allows the audio control to be active/enabled)
    fw.mvap_audioEnded = function() {
      const log = logger(`${logPrefix}:mvap_audioEnded()`);
      log(`audio ended ... loading next verse`);

      // this is where the action happens!!!
      // ... we programmatically advance to the next verse

      // advance to our next verse to play
      const nextVerse = advanceToNextVerse();

      // if there is NO nextVerse to play, we reset our control (with a user message)
      if (!nextVerse) {
        log(`NO nextVerse to play ... resetting control`);
        fw.mvap_reset();
        mvap_userMsg(`You must select at least one verse to play (from the audio checkboxes - far right of the TOC [above]).`);
        return;
      }

      // we glean the translation from our cached memory state (derived from the html)
      // - it would be easier to pull it from our persistent state
      //   * BUT if the translation has never been explicitly selected, it will not be set in our persistent state!
      //   * By gleaning this from our cached memory state, we use what is displayed to the user (with the default semantics applied)
      const nextVerseSanitized = nextVerse.replaceAll('.', '_');
      const activeTranslation  = fw.memoryVerseState[nextVerseSanitized].activeTranlsation;

      // format our verse to the audio file entry
      // EX: src="Memorization/php.4.8.NIV.m4a"
      const nextAudioFile = `Memorization/${nextVerse}.${activeTranslation}.m4a`;

      // our <audio> control
      const audio = document.getElementById("mvap_audio_player");

      // advance our active play to our next verse
      log(`setting the nextAudioFile: '${nextAudioFile}'`);
      fw.memoryVerseState.curVerse = nextVerse;
      audio.pause();    // pause audio ... not needed in this case, but doesn't hurt
      audio.src = nextAudioFile;
      audio.load();     // reload the new audio source
      audio.play();     // start playing the new file
    }


    // utility to advance to the next verse
    // NOTES:
    // - More intuitive for users who expect to continue from the next verse in sequence.
    // - No sudden jumps to the first verse unless necessary.
    function advanceToNextVerse() {
      const log = logger(`${logPrefix}:advanceToNextVerse()`);

      // the current verse that just played
      const curVerse = fw.memoryVerseState.curVerse;

      // convenient alias
      // ... EX: allRefs: ['luk.9.23-24', ...],
      const allRefs = fw.memoryVerseState.allRefs;

      // determine our "to play" verses from allRefs through our filter
      // NOTE: this filter is applied once (here)!
      const toPlayRefs = allRefs.filter( (scriptRef) => {
        // apply our various filters
        if (fwCompletions.isPlay(scriptRef)) { // ... is selected for Multi-Verse Audio Play
          return true;
        }
        // TODO: apply MORE criteria in the future ... such as - is the verse section filtere out
        return false;
      });

      // no-op if no verses are selected
      // ... possibly the user NEVER selected any verses to play, or deselected all mid-play
      if (toPlayRefs.length === 0) {
        return undefined; // NOTHING to play
      }

      // locate index of curVerse from allRefs
      // ... -1 if NOT THERE (on a reset control, when nothing is being played)
      const curIndex = allRefs.indexOf(curVerse);
      
      // iterate over allRefs, but use toPlayRefs for matching
      // ... see NOTE (in description)
      for (let i=1; i<=allRefs.length; i++) {
        const nextIndex = (curIndex + i) % allRefs.length;
        const nextVerse = allRefs[nextIndex];
        
        if (toPlayRefs.includes(nextVerse)) {
          return nextVerse; // located the next verse to play (within our `toPlay` filtered items)
        }
      }
      
      // for completeness
      // ... should never get here if at least one verse is available "toPlay" (see "NOTHING to play" above)
      return undefined;
    }
    
    // reset the audio control to the start
    // ... INVOKED FROM: user click (of "Reset" Button) -OR- programmatically in our initialization setup
    //                   CURRENTLY we do NOT believe the user (i.e. UI) needs this control
    //                   ... the button is commened out in Memorization.md
    fw.mvap_reset = function() {
      const log = logger(`${logPrefix}:mvap_reset()`);
      log(`resetting the audio control to the start`);
      
      // our <audio> control
      const audio = document.getElementById("mvap_audio_player");

      // STOP our playback, RESETTING it to the beginning
      fw.memoryVerseState.curVerse = ''; // reset to initial state (NOT playing anything)
      audio.pause();    // pause any previous audio ... necessary when the audio is currently playing
      audio.src = startingMultiVerseAudioClip;
      audio.load();     // load the starting audio source
   // audio.play();     // NOT: start playing the new file ... NOT in the context of reset() ... we want to STOP PLAY COMPLEXLY
    }

    // utility to display user message under the Multi-Verse Audio Play
    // PARAM: msg - message to display to user (omit to clear message)
    function mvap_userMsg(msg='') {
      document.getElementById("multi-verse-user-msg").innerText = msg;
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
