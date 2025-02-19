//*-----------------------------------------------------------------------------
//* gAnalytics.js: apply google analytics to our website.
//*
//* This script must be included on each the pages of our site.
//*  - manually:  in the small number of pages of wiiBridges.com  
//*  - automatic: in ALL the pages of FireWithin (gitbook), via postProcessPage.js
//*               ... FireWithin/gitbook-plugin-my-plugin/postProcessPage.js
//*
//* NOTE: This module is ONE CENTRAL spot to tweak/disable Analytics for our ENTIRE web-site!
//*
//* ```html
//* <head>
//*   <script src="./gAnalytics.js"></script>
//*   ... snip snip
//* </head>
//* ```
//*-----------------------------------------------------------------------------

// NOTE: I wanted to use ES Modules (via type="module") 
//       but could not get this to work for GitBook :-(
//       HENCE: This `window.gAnalytics` work-around.
//              As it turns out, this is very close to just doing everything in-line
//              ... I had some trouble with the `const` that this solved.
if (!window.gAnalytics) {
  window.gAnalytics = {};

  // My "FireWithin" Google Analytics Measurement ID
  const MEASUREMENT_ID = 'G-5D46PP7FVC';

  // simulated "real" logger (that can be enabled/disabled)
  const LOG_ANALYTICS = 'logAnalytics';
  window.logAnalytics = function() {
    localStorage.setItem(LOG_ANALYTICS, 'YES');
  };
  window.logAnalyticsStop = function() {
    localStorage.setItem(LOG_ANALYTICS, 'NO');
  };
  console.log(`**Google Analytics** IMPORTANT: you can use logAnalytics()/logAnalyticsStop() in your dev console`); // UNSURE if we want this or not?
  function isAnalyticsLogged() {
    return localStorage.getItem(LOG_ANALYTICS) === 'YES';
  }
  function logger(prefix) {
    if (isAnalyticsLogged()) {
      return function () {
        console.log(prefix, ...arguments);
      };
    }
    else { // function that no-ops
      return function () {};
    }
  }

  window.gAnalytics.initializeAnalytics = function() {
    const log = logger('**Google Analytics** ');

    // NO-OP Analytics when in development (i.e. localhost)
    if (window.location.hostname === 'localhost') { // ... DISABLE THIS CHECK to test analytics in dev
      log(`NO-OP Analytics when in development (i.e. localhost)`);
      return;
    }

    // load the Google Analytics script dynamically
    // ... work-around since it is NOT designed for ES Modules
    const script = document.createElement("script");
    script.async = true;
    script.src   = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    document.head.appendChild(script);
    log(`importing Google Analytics script`);
    
    // initialize gtag when the script loads
    // ... per Google Analytics instruction
    script.onload = () => {
      const pathname = window.location.pathname;
      log(`gtag()s from change in pathname: '${pathname}'`);

      // per googles original instructions:
      window.dataLayer = window.dataLayer || [];
      function gtag() { window.dataLayer.push(arguments); }
      window.gtag = gtag; // expose gtag globally
      gtag('js', new Date());
      log(`gtag('config', MEASUREMENT_ID);`);
      gtag('config', MEASUREMENT_ID);

      // because GitBook navigation (LeftNav, or just inner links) DO NOT do a full page reload,
      // we must manually tell Google Analytics about the new page :-)

      // OPTION 1: we trigger from: all our gitbook pages begin with '/FireWithin'
      //           VERY SIMPLE (compared to GitBook event listeners
      //           RESULT: 
      //             - FireWithin/gitbook PAGE REFRESH     <<< DOUBLED - not a big deal (people don't do this normally - just developers)
      //             - FireWithin/gitbook ENTRY POINT      <<< DOUBLED - hmmm (just happens one time per session)
      //             - FireWithin/gitbook normal navigate  <<< WORKS
      //             - wiiBridges.com PAGE REFRESH         <<< WORKS
      //             - wiiBridges.com PAGE CHANGE          <<< WORKS
      if (pathname.startsWith('/FireWithin')) {
        log(`ADDITIONAL GitBook navigation notice: gtag("event", "page_view", { page_path: '${pathname}'}`)
        gtag("event", "page_view", { page_path: pathname });
      }

      // OPTION 2: handle GitBook navigation THE RIGHT WAY - GitBook event handlers
      //           RESULT: WAY TOO MANY HITS - NIX THIS
      //? function trackPageView() { // this is still being fired by my HOME page "/" but NOT "presentations/ResponseveSvelte" .... weird?
      //?   log(`ADDITIONAL GitBook navigation notice: gtag("event", "page_view", { page_path: '${pathname}'}`)
      //?   gtag("event", "page_view", { page_path: pathname });
      //? }
      //? window.addEventListener("popstate", trackPageView);
      //? document.addEventListener("DOMContentLoaded", () => {
      //?   // MutationObserver detects content changes from GitBook's navigation system
      //?   const observer = new MutationObserver(trackPageView);
      //?   observer.observe(document.body, { childList: true, subtree: true });
      //? });
    };
  }
}

// auto-execute on module load
window.gAnalytics.initializeAnalytics();
