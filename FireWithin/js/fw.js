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

// our settings state singleton object (ALWAYS up-to-date)
// ... state-related-settings
import {fwSettings} from './fwSettings.js';

import {handlePhoneSignIn,
        handlePhoneVerification,
        handleSignOut}            from './fwAuth.js';

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
    const CUR_VER = '20.1';


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
      const completedElms = document.querySelectorAll('input[type="checkbox"]');
      log.enabled && log('completedElms: ', {completedElms});
      
      // initialize each completed checkbox from our state
      for (const completedElm of completedElms) {
        log.v(`processing completedElm.id: "${completedElm.id}"`);
      
        // sync our UI from our state
        // ... THIS IS IT
        completedElm.checked = fwCompletions.isComplete(completedElm.id);
      }
    }

    //*--------------------------------------------------------------------------
    //* PUBLIC: fw.handleCompletedCheckChange(completedElm)
    //* 
    //* Event handler that retains changes to our completions state
    //*--------------------------------------------------------------------------
    // ... state-related-completions:
    fw.handleCompletedCheckChange = function(completedElm) {
      const log = logger(`${logPrefix}:handleCompletedCheckChange()`);

      log(`completedElm changed ... id: "${completedElm.id}", checked: ${completedElm.checked}`);

      // retain this change in our state
      // ... handles persistance/reflection automatically
      fwCompletions.setComplete(completedElm.id, completedElm.checked);
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
    //* 
    //* ... state-related-settings: ... the ONLY settings we currently have is: bibleTranslation
    //***************************************************************************
    //***************************************************************************


    //***************************************************************************
    //***************************************************************************
    //* Code Related to Bible Translation (in support of dynamic selection)
    //* ... state-related-settings: ... the ONLY settings we currently have is: bibleTranslation
    //***************************************************************************
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
      
      // extract the bibleTranslation from our settings (User Preferences)
      // ... state-related-settings:
      const bibleTranslation     = fwSettings.getBibleTranslation();     // ex: 'NLT'
      const bibleTranslationCode = fwSettings.getBibleTranslationCode(); // ex: '116'
      
      // define the full URL
      // EX: https://bible.com/bible/111/mrk.1.2.NIV
      //     NOTE: it is believed that the bibleTranslation is optional in this URL (ex: .NIV)
      //           ... it is functionally redundent of the bibleTranslationCode
      const url = `https://bible.com/bible/${bibleTranslationCode}/${scriptureRef.trim()}.${bibleTranslation}`;
      
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
      //             <li class="header">Fire Within (18.0)</li>  <<< locates this
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
      headerElm.textContent = `FireWithin (v${CUR_VER} ${bibleTranslation} ${userName})`;
    }

    //***************************************************************************
    //***************************************************************************
    //* Code Related to User Authentication Changes ... sign-in / sign-out
    //***************************************************************************
    //***************************************************************************

    // promote sign-in/sign-out utils
    fw.handlePhoneSignIn       = handlePhoneSignIn;
    fw.handlePhoneVerification = handlePhoneVerification;
    fw.handleSignOut           = handleSignOut;
    fw.maintainUserName        = maintainUserName;

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

      // dynamically reflect the userPhone of the active user
      // ... auto synced on user identity change (because that is the controller we are in)
      const userPhone = fwUser.getPhone();
      // ... obtain all userPhone elements on this page (using dom element attribute: data-fw-user-phone)
      const userPhoneElms = document.querySelectorAll('[data-fw-user-phone]');
      // ... sync them
      userPhoneElms.forEach(elm => {
        elm.textContent = userPhone;
      });

      // manage the tri-state visuals of our sign-in page (found in settings.md)
      const domGuest = document.getElementById('sign-in-form-guest');
      // ... process if we are ON the settings.md sign-in page
      //     ALL THREE are on the same page, so we just reason about the existance of the first
      if (domGuest) {
        const domVerifying = document.getElementById('sign-in-form-verifying');
        const domVerified  = document.getElementById('sign-in-form-verified');

        let showGuest     = fwUser.isSignedOut() && !fwUser.isVerifying();
        let showVerifying = fwUser.isVerifying();
        let showVerified  = fwUser.isSignedIn();
        
        domGuest.style.display     = showGuest     ? 'block' : 'none';
        domVerifying.style.display = showVerifying ? 'block' : 'none';
        domVerified.style.display  = showVerified  ? 'block' : 'none';
      }
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
