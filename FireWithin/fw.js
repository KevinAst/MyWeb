//*-----------------------------------------------------------------------------
//* fw.js - a pseudo plugin that is specific to the "Fire Within" blog,
//*         promoting a one-and-only "module scoped" fw obj.
//*
//*         INTERNAL FUNCTIONS ... simply:
//*            function fooBar() { ... }
//*
//*         PUBLIC FUNCTIONS ... promoted via one-and-only "module scoped" fw object
//*            fw.fooBar = function() { ... }
//*-----------------------------------------------------------------------------

console.log('***NOTE*** including fw.js module');

if (!window.fw) { // only expand this module once (conditionally)

  console.log('***NOTE*** expanding our one-and-only "module scoped" fw obj');

  //*************
  //* start IIFE -and- promotion of the "module scoped" fw obj
  //*************
  window.fw = (function () {
    const fw = {}; // our one-and-only "module scoped" fw object, promoted to the outside world (see return)


    //***************************************************************************
    //***************************************************************************
    //* Code Related to our completed checkboxes
    //***************************************************************************
    //***************************************************************************
    
    //*--------------------------------------------------------------------------
    //* INTERNAL: syncCompletedChecksOnPage()
    //* 
    //* Synchronize ALL completed checkboxes on the current page 
    //* with the current status, retained in localStorage.
    //* 
    //* This function is automatically invoked whenever a GitBook page changes.
    //*--------------------------------------------------------------------------
    function syncCompletedChecksOnPage() {
      // fetch all checkbox input elements (representing completed sessions)
      const completedElms = document.querySelectorAll('input[type="checkbox"]');
      // console.log('XX completedElms: ', completedElms);

      // initialize each completed checkbox from our persistent store (localStorage)
      const fireWithinCompletedObj = fetchFireWithinCompletedObj();
      for (const completedElm of completedElms) {
        //console.log('XX processing completedElm: ', {completedElm, id: completedElm.id });

        // sync our UI state from our persistent store (localStorage)
        // ... THIS IS IT
        completedElm.checked = fireWithinCompletedObj[completedElm.id] === 'Y';
      }
    }

    //*--------------------------------------------------------------------------
    //* PUBLIC: fw.handleCompletedCheckChange(completedElm)
    //* 
    //* Event handler that retain the status checkbox changes in localStorage.
    //*--------------------------------------------------------------------------
    fw.handleCompletedCheckChange = function(completedElm) {
      // console.log('XX completedElm changed: ', {completedElm, id: completedElm.id, checked: completedElm.checked });

      // retain this state change into our persistent store (localStorage)
      const fireWithinCompletedObj = fetchFireWithinCompletedObj();
      fireWithinCompletedObj[completedElm.id] = completedElm.checked ? 'Y' : 'N';
      storeFireWithinCompletedObj(fireWithinCompletedObj);

      // sync this state to duplicate checkboxes
      // ... duplicates exist because of the responsive web approach where we alter the layout for desktop/cell-phone
      const checkElms = document.querySelectorAll('input[type="checkbox"]');
      for (const checkElm of checkElms) {
        // sync any duplicate checkboxes (with same ID that is NOT the element we are servicing)
        if (checkElm !== completedElm && checkElm.id === completedElm.id) {
          checkElm.checked = completedElm.checked;
        }
      }
    }

    //*--------------------------------------------------------------------------
    //* INTERNAL: fetchFireWithinCompletedObj()
    //*
    //* Fetch the persistent state of ALL completed items
    //*--------------------------------------------------------------------------
    function fetchFireWithinCompletedObj() {
      const objStr = localStorage.getItem('fireWithinCompleted') || '{}';
      const obj    = JSON.parse(objStr);
      return obj;
    }

    //*--------------------------------------------------------------------------
    //* INTERNAL: storeFireWithinCompletedObj(obj)
    //*
    //* Retain the persistent state for the supplied obj holding ALL completed items
    //*--------------------------------------------------------------------------
    function storeFireWithinCompletedObj(obj) {
      const objStr = JSON.stringify(obj);
      localStorage.setItem('fireWithinCompleted', objStr);
    }


    //***************************************************************************
    //***************************************************************************
    //* Code Related to managing large images
    //***************************************************************************
    //***************************************************************************

    //*--------------------------------------------------------------------------
    //* INTERNAL: registerImgClickFullScreenHandlers()
    //* CREDIT: https://code-boxx.com/image-zoom-css-javascript/
    //* KJB: to use, simply add "clickFullScreen" css class to your img tag
    //* EX:  <figure style="text-align: center;">
    //*        <img class="diagram clickFullScreen"
    //*             src="Acts.png"
    //*             alt="Acts"
    //*             width="85%">
    //*        <figcaption>Click image to expand into full-screen</figcaption>
    //*      </figure>
    //* NO LIKE: currently NOT being used
    //*--------------------------------------------------------------------------
    // function registerImgClickFullScreenHandlers() {
    //   // obtain all img tags with "clickFullScreen" css class
    //   const all = document.getElementsByClassName("clickFullScreen");
    // 
    //   // console.log('XX in handler WITH following all: ', all);
    //   
    //   // register click handlers to enter/exit fullscreen
    //   for (const elm of all) {
    //     elm.onclick = () => {
    //       // exit fullscreen
    //       if (document.fullscreenElement != null || document.webkitFullscreenElement != null) {
    //         if (document.exitFullscreen) {
    //           document.exitFullscreen();
    //         }
    //         else {
    //           document.webkitCancelFullScreen();
    //         }
    //       }
    //       
    //       // enter fullscreen
    //       else {
    //         if (elm.requestFullscreen) {
    //           elm.requestFullscreen();
    //         }
    //         else {
    //           elm.webkitRequestFullScreen();
    //         }
    //       }
    //     };
    //   }
    // }


    //*--------------------------------------------------------------------------
    //* PUBLIC: fw.addZoomableImage()
    //* 
    //* A Zoomable Image Utility
    //* ... use this in lieu of registerImgClickFullScreenHandlers()
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

      //console.log(`XX EXECUTING fw.addZoomableImage( function ... for ${imgSrc}`);

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
        // console.log(`XX showing ${imgSrc} at ${widthPercent}% or ${widthInPx}px`);
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
          widthInPx = widthPercent/100*gitbookContainerWidth;
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
        // console.log(`XX mouse leave for ${imgSrc}`);
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
    //* INTERNAL: ALL
    //***************************************************************************
    //***************************************************************************

    // our default settings ... revealing our settings structure
    const settingsDEFAULT = {
      bibleTranslation: 'NLT',
    };

    // our current settings (persisted in localStorage):
    const settings = JSON.parse( localStorage.getItem('fireWithinSettings') ) || settingsDEFAULT;

    // retain our settings in localStorage (invoked when settings change)
    function persistSettings() {
      const settingsStr = JSON.stringify(settings);
      localStorage.setItem('fireWithinSettings', settingsStr);
    }


    //***************************************************************************
    //***************************************************************************
    //* Code Related to Bible Translation (in support of dynamic selection)
    //***************************************************************************
    //***************************************************************************

    // Bible Translation Codes (as defined by YouVersion)
    const bibleTranslations = {
      SEP1: { code: 'GROUP', desc: 'Paraphrased (everyday lang):' },
      MSG:  { code: '97',    desc: 'The Message' },
      GNT:  { code: '68',    desc: 'Good News Translation' },
      NLT:  { code: '116',   desc: 'New Living Translation' },

      SEP2: { code: 'GROUP', desc: 'Literal (some moderate):' },
      CSB:  { code: '1713',  desc: 'Christian Standard Bible' },
      NIV:  { code: '111',   desc: 'New International Ver' },
      ESV:  { code: '59',    desc: 'English Standard Ver 2016' },
      NET:  { code: '107',   desc: 'New English Translation' },

      SEP3: { code: 'GROUP', desc: 'Traditional:' },
      NKJV: { code: '114',   desc: 'New King James Ver' },
      KJV:  { code: '1',     desc: 'King James Ver' },

      SEP4: { code: 'GROUP', desc: 'Amplified:' },
      AMP:  { code: '1588',  desc: 'Amplified Bible' },
      AMPC: { code: '8',     desc: 'Amplified Bible Classic' },
    };


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
    //*    via a user preference, persisted in localStorage.
    //* 
    //* USAGE: 
    //*   <a href="#" onmouseover="alterBibleVerseLink(event, 'mrk.1.2')" target="_blank">Mark 1:2</a>
    //*--------------------------------------------------------------------------
    fw.alterBibleVerseLink = function(e, scriptureRef) {
      
      // extract the bibleTranslation from our settings (User Preferences)
      const bibleTranslation     = settings.bibleTranslation;                // ex: 'NLT'
      let   bibleTranslationCode = bibleTranslations[bibleTranslation].code; // ex: '116'
      
      // define the full URL
      // EX: https://bible.com/bible/111/mrk.1.2.NIV
      //     NOTE: it is believed that the bibleTranslation is optional in this URL (ex: .NIV)
      //           ... it is functionally redundent of the bibleTranslationCode
      const url = `https://bible.com/bible/${bibleTranslationCode}/${scriptureRef.trim()}.${bibleTranslation}`;
      
      // overwrite the href of the invoking <a> tag
      // NOTE: because e.preventDefault() is not used, the browser
      //       will open the link in a new tab based on the updated href
      // console.log(`XX updating href with: ${url}`);
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
      selectElm.value = settings.bibleTranslation;

      // add an event handler to retain the current selection in localStorage  
      selectElm.addEventListener('change', function() {
        settings.bibleTranslation = this.value;

        // retain our updated settings
        persistSettings();
      });

    }

    
    //***************************************************************************
    //***************************************************************************
    //* PUBLIC: fw.pageSetup() - perform setup of each page (once it is loaded)
    //***************************************************************************
    //***************************************************************************
    fw.pageSetup = function() {
      console.log('***NOTE*** perform common setup of each page (once it is loaded)');
      syncCompletedChecksOnPage();
   // registerImgClickFullScreenHandlers(); ... NOT being used
    }
    // FOLLOWING is NO LONGER NEEDED, and is COMMENTED OUT (left for posterity - for what it is worth)
    // This functionality is NOW addressed by our my-plugin GitBook plugin
    // - by injecting an in-line JS execution of fw.pageSetup() at the end of each page
    // - PRO:
    //   * this is more reliable
    //     - FOLLOWING seemed to have intermittent results, where completed checkboxes were NOT properly initialized
    //   * FOLLOWING is a bit of a HACK
    //? // register fw.pageSetup() to run on each page load
    //? // NOTE: Because GitBook does NOT actually reload the entire page when
    //? //       navigating to a new page (from the left nav), we cannot rely on
    //? //       the "onload" event.  
    //? //       As a work-around we attempted several things:
    //? //       - monitor various events:
    //? //         * onhashchange: not expected to work, because a real page change
    //? //                         is more than the URL hash changing
    //? //                         EX: window.addEventListener('hashchange', () => { ... }
    //? //         * onpopstate:   expected to work, because it is triggered by history.pushState()
    //? //                         used in updating the URL. HOWEVER does NOT work - NO IDEA WHY
    //? //                         EX: window.addEventListener('popstate', () => { ... }
    //? //         * onup:location:changed: expected to work. HOWEVER does NOT work - NO IDEA WHY
    //? //                         EX: window.addEventListener('up:location:changed', () => { ... }
    //? //       - as a DESPERATE work-around HACK, we monkey patch history.pushState().
    //? //         THIS WORKS ... but GEEEE WHIZZZZ!!!
    //? window.addEventListener('load', () => { // we also need to monitor the 'onload' event FOR the INITIAL gitbook document load
    //?   fw.pageSetup();
    //? });
    //? // also monitor GitBook page changes via monkey patch (see DESPERATE note - above)
    //? // console.log('XX monkey patching history.pushState()');
    //? const history_pushState_original = history.pushState;
    //? history.pushState = function() {
    //?   // invoke original pushState
    //?   // console.log('XX in monkey patched history.pushState() invoking original with arguments: ', arguments);
    //?   history_pushState_original.apply(history, [...arguments]);
    //? 
    //?   // value added behavior
    //?   // NOTE: we utilize a 1 mill timeout to push the process in the next "pseudo thread"
    //?   //       eliminating any race conditions
    //?   setTimeout(() => {
    //?     fw.pageSetup();
    //?   }, 100); // 1 mill works mostly, but I have seen some "very intermittent" checkboxes NOT sync ... go with 1/10 sec (100 mills)
    //? }

    //***********
    //* end IIFE -and- promotion of the "module scoped" fw obj
    //***********
    return fw;
  })(); // IIFE end

} // ... end of ... if (!window.fw) {