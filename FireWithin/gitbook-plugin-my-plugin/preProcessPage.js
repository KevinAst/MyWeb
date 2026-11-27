//***
//*** Pre Process the supplied GitBook page, adding local JavaScript
//*** contexts, processing customTags, etc.
//***
//*** This function should be registered to the GitBook 'page:before'
//*** hook, which is run before the templating engine is applied on the page.
//*** >>> IN OTHER WORDS: it is processing MarkDown
//***

const {processCustomTags, completedCheckBox} = require('./customTagsProcessor');

// The UI to quickly navigate to Current Sermon Series
// ... injected on almost ALL pages of FireWithin
const currentSermonSeries = `
<b>{{book.CurSermonSeries}}:</b>
<ul>
  <li>{{book.CurSermonSeries_Sundays}}</li>
  <li>{{book.CurSermonSeries_MidWeek}}</li>
</ul>`;

function preProcessPage(page) {

  // console.log(`***INFO*** preProcessPage() for page: ${page.path}`);

  // page: {                   // page content of interest
  //   path:     'Hosea.md',   // good for diagnostics
  //   content:  '# whatever', // raw MarkUp content for this page'
  //   title:    'Hosea',      // title gleaned from the MarkUp (ex: # Hosea)
  //   depth:    2,
  //   rawPath:  'C:\\dev\\MyWeb\\FireWithin\\Hosea.md',
  //   dir:      'ltr',
  //   type:     'markdown',
  //   progress: [Getter/Setter],
  //   sections: [Getter/Setter]
  // }


  // our Upper Right Content accumulation
  let upperRightContent = '';

  //***
  //*** Inject a "Book Completed" check-box control on ALL Books-of-the-Bible pages
  //***

  // NOTES:
  // 1. These pages uniquely contain an "NIV Intro" sub-string (see conditional logic below)
  // 2. This information is accumulated in OldTestament.md / NewTestament.md
  // 3. This process is accomplished BEFORE any customTag processing, because we inject customTags in this step!

  if ( page.content.includes('NIV Intro') ) { // ... see NOTE 1 (above)
    const bibleBook    = page.path.replace('.md', '');
    const checkBox     = completedCheckBox(`${bibleBook}@@ Book Completed`)
    upperRightContent += (upperRightContent ? `<br/>` : ``) + checkBox;
  }


  //***
  //*** Inject the currentSermonSeries on MOST pages
  //***

  // identify the pages that are ISOLATED from FireWithin (i.e. EXTERNAL)
  // ... which we excluded from this currentSermonSeries control
  // ... EX: pics.md, 25in25.md, TheChosenPromo.md
  const isolatedPage = page.content.includes('ISOLATED-PAGE');

  // identify pages we explicitly excluded from this currentSermonSeries control
  const excludedPage = page.path === 'intro.md'    || // Welcome
                       page.path === 'settings.md' || // Settings
                       page.path === 'start.md'    || // Getting Started
                       page.path === 'MyFaith.md'  || // My Faith
                       page.path === 'history.md';    // Revision History
  upperRightContent += (upperRightContent ? `<br/>` : ``) + currentSermonSeries;

  //***
  //*** Generate our Upper Right Content on select pages (when defined)
  //***

  if (upperRightContent) {
    // NOTE: <div> directive places content to the right
    page.content = `<div style="width: fit-content; margin-left: auto;">${upperRightContent}</div>\n\n${page.content}`;
  }


  //***
  //*** apply customTag processing
  //***

  page.content = processCustomTags(page.path,     // forPage
                                   page.content); // markdown


  //***
  //*** surround ALL pages with the necessary JavaScript constructs needed for our blog
  //***

  // NOTES:
  // - This MUST be done LAST, to insure these constructs "sandwich" the entire page

  // define our in-line withFW() function that: executes supplied fn in the context of when window.fw is available (delaying as needed via a que)
  // NOTE: We CANNOT use our sophisticated logger in this code snippet
  //       BECAUSE this code executes in a non-module script (by design)
  //       SO we do not have access to the logger :-(
  const withFW = `
<script>
  window.withFWQue = window.withFWQue || [];
  window.withFW    = window.withFW    || function(fn) {
    const fnName = fn.name || 'anonymous';
    if (window.fw) {
      // generate a VERBOSE logging probe
      // ... typically don't want to see
      //     BECAUSE will generate A LOT OF ENTRIES (the happy path)
      window.withFWLog.v(\`executing function '\$\{fnName\}' IMMEDIATELY ... fw.js HAS BEEN expanded\`);

      // process NOW
      fn();
    }
    else {
      // generate a FORCED logging probe
      // ... of interest to insure our cache is working
      //     AND FEW ENTRIES (during bootstrap of initial load of site)
      // ... NOTE: window.withFWLog has NOT YET BEEN DEFINED
      //           BUT because it is a FORCED probe, we mimic it with a console.log()
      //           HOWEVER, I subsequently took off the FORCE, so I am punting this (comment out the log)
      // console.log(\`fw:core:withFW() IMPORTANT: DELAYING function '\$\{fnName\}' execution ... to allow fw.js to be expanded\`);

      // process LATER
      window.withFWQue.push(fn);
    }
  }
</script>`;

  // start/end scripts needed for the proper activation/initialization of fw.js in our client pages
  const startScript = `<script type="module" src="./js/fw.js"></script>`; // inject fw.js script in every page
  const endScript   = `<script> withFW( ()=>fw.pageSetup() ) </script>`;  // auto run pageSetup() at end (when page is rendered)

  // surround the page with the necessary JavaScript constructs
  // ... utilize cr/lf (\n) to NOT conflict with various markdown constructs (like "### Title", etc.)
  //     for some reason, double cr/lf are needed (not sure why)
  page.content = `${withFW}\n\n${startScript}\n\n${page.content}\n\n${endScript}`;


  //***
  //*** process complete
  //***

  // per GitBook 'page:before' hook, we MUST return page
  // ... KJB: seems weird, as we are changing the content directly
  return page;
}

module.exports = {
  preProcessPage,
};
