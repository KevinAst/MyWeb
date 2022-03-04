// register all event handlers at end of page render
function pageSetup() {
  registerImgClickFullScreenHandlers();
  initializeCompletedChecks();
}

// FullScreen Utility
// CREDIT: https://code-boxx.com/image-zoom-css-javascript/
// KJB: to use, simply add "clickFullScreen" css class to your img tag
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
