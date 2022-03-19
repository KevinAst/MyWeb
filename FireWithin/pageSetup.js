//console.log(`XX? EXPANDING pageSetup.js module`);

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
