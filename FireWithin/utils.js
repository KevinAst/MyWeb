//console.log(`XX? EXPANDING utils.js module`);

// register all event handlers at end of page render
function pageSetup() {
  //console.log(`XX EXECUTING pageSetup() function ... registerImgClickFullScreenHandlers() & initializeCompletedChecks()`);
  registerImgClickFullScreenHandlers();
  initializeCompletedChecks();
}

// FullScreen Utility - OLD ... don't like much (currently NOT being used)
// CREDIT: https://code-boxx.com/image-zoom-css-javascript/
// KJB: to use, simply add "clickFullScreen" css class to your img tag
// EX:  <figure style="text-align: center;">
//        <img class="diagram clickFullScreen"
//             src="Acts.png"
//             alt="Acts"
//             width="85%">
//        <figcaption>Click image to expand into full-screen</figcaption>
//      </figure>
function registerImgClickFullScreenHandlers() {
  // obtain all img tags with "clickFullScreen" css class
  const all = document.getElementsByClassName("clickFullScreen");

  // console.log('XX in handler WITH following all: ', all);
  
  // register click handlers to enter/exit fullscreen
  for (const elm of all) {
    elm.onclick = () => {
      // exit fullscreen
      if (document.fullscreenElement != null || document.webkitFullscreenElement != null) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
        else {
          document.webkitCancelFullScreen();
        }
      }
      
      // enter fullscreen
      else {
        if (elm.requestFullscreen) {
          elm.requestFullscreen();
        }
        else {
          elm.webkitRequestFullScreen();
        }
      }
    };
  }
}

// Zoomable Image Utility - NEW ... use this one
// CREDITS: Modified Version of: https://www.cssscript.com/image-zoom-pan-hover-detail-view/
// KJB: to use, follow this pattern
// EX:  <center>
//        <figure>
//          <div id="ActsOverview2"></div>
//          <figcaption>Hover to zoom, Click to open in new tab</figcaption>
//        </figure>
//      </center>
//      <script>
//        addZoomableImage('ActsOverview2', 'Acts.png', 90);
//      </script>
function addZoomableImage(imageContainerId, imgSrc, widthPercent) {

  //console.log(`XX EXECUTING addZoomableImage( function ... for ${imgSrc}`);

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


// inject our email via JS
// ... in an attempt to avoid spam (since most crawlers process the server-side renered html)
//     NOT foolproof, but nothing is
// ... NOTES:
//       - assumes content injected in DOM ID: "inquire"
//         EX: <span id="inquire"></span>
//       - subj suitable to be used in href mailto ref (i.e. NO SPACES)
function addInquire(subj='Saw%20Your%20WebPage') {
  const mailToContainer = document.getElementById('inquire');
  const me = 'inquire';
  const at = 'wiiBridges&#46;com';
  mailToContainer.innerHTML = `<a href="mailto:${me}&#64;${at}?Subject=${subj}" target="_top">${me}&#64;${at}</a>`;
}


function initializeCompletedChecks() {
  // fetch all checkbox input elements (representing completed sessions)
  const completedElms = document.querySelectorAll('input[type="checkbox"]');
  // console.log('XX completedElms: ', completedElms);

  // initialize each completed checkbox from our persistent store (localStorage)
  const fireWithinCompletedObj = _fetchFireWithinCompletedObj();
  for (const completedElm of completedElms) {
    //console.log('XX processing completedElm: ', {completedElm, id: completedElm.id });

    // sync our UI state from our persistent store (localStorage)
    // ... THIS IS IT
    completedElm.checked = fireWithinCompletedObj[completedElm.id] === 'Y';
  }
}

function handleCompletedCheckChange(completedElm) {
  // console.log('XX completedElm changed: ', {completedElm, id: completedElm.id, checked: completedElm.checked });

  // retain this state change into our persistent store (localStorage)
  const fireWithinCompletedObj = _fetchFireWithinCompletedObj();
  fireWithinCompletedObj[completedElm.id] = completedElm.checked ? 'Y' : 'N';
  _storeFireWithinCompletedObj(fireWithinCompletedObj);

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


// fetch the persistent state of ALL completed items
function _fetchFireWithinCompletedObj() {
  const objStr = localStorage.getItem('fireWithinCompleted') || '{}';
  const obj    = JSON.parse(objStr);
  return obj;
}

// retain the persistent state for the supplied obj holding ALL completed items
function _storeFireWithinCompletedObj(obj) {
  const objStr = JSON.stringify(obj);
  localStorage.setItem('fireWithinCompleted', objStr);
}


//*-----------------------------------------------------------------------------
//* Code Related to our settings (User Preferences)
//*-----------------------------------------------------------------------------

// NOTE: We have to do some work-arounds on global state initialization, 
//       based on gitbook usage.  Basically, instead of clare/init a const,
//       we utilize the global window namespace.

// our default settings ... revealing our settings structure
window.settingsDEFAULT = {
  bibleTranslation: 'NLT',
};

// our current settings (persisted in localStorage):
window.settings = JSON.parse( localStorage.getItem('fireWithinSettings') ) || settingsDEFAULT;

// retain our settings in localStorage (invoked when settings change)
function persistSettings() {
  const settingsStr = JSON.stringify(settings);
  localStorage.setItem('fireWithinSettings', settingsStr);
}


//*-----------------------------------------------------------------------------
//* Code Related to Bible Translation (in support of dynamic selection)
//*-----------------------------------------------------------------------------

// Bible Translation Codes (as defined by YouVersion)
window.bibleTranslations = {
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


// Alter the supplied <a> tag href to the supplied YouVersion
// scriptureRef, dynamically injecting the appropriate 
// Bible Translation (ex: NIV, KJV, etc.) from the user's preference.
//
// This event should be registered on a hover action (e.g. the mouseover event),
// allowing the the the browser status to correctly reflect the updated URL.
//
// PARMS:
//   e:            The event from the invoking <a> tag
//   scriptureRef: The YouVersion Bible App scripture reference (ex: 'mrk.1.2')
//
// This utility has the following advantages:
//  - The bible site URL is centralized.  Any changes by YouVersion Bible app
//    can be isolated in this routine.
//  - The Bible translation (ex: NIV, KJV, etc.) is dynamically determined
//    via a user preference, persisted in localStorage.
// 
// USAGE: 
//   <a href="#" onmouseover="alterBibleVerseLink(event, 'mrk.1.2')" target="_blank">Mark 1:2</a>
function alterBibleVerseLink(e, scriptureRef) {
  
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

// Generate an html selection list for bibleTranslations
//
// USAGE: 
//   <select id="bibleTranslations"></select>
//   <script>
//     genBibleTranslationsSelection('bibleTranslations');
//   </script>
function genBibleTranslationsSelection(bibleTranslationsElmId) {
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
