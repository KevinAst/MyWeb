//***
//*** Pre Process the supplied GitBook page, adding local JavaScript
//*** contexts, processing customeTags, etc.
//***
//*** This function should be registered to the GitBook 'page:before'
//*** hook, which is run before the templating engine is applied on the page.
//***

const {initCustomTags, processCustomTags, completedCheckBox} = require('./customTagsProcessor');

// init(): triggered after parsing the book, before generating output and pages
function init(config) {
  // expose this config to various modules
  initCustomTags(config);
}

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


  //***
  //*** conditionally add a "Book Completed" check-box control on ALL pages that represent a book of the Bible
  //***

  // NOTES:
  // - These pages uniquely contain an "Introduction**" sub-string (see conditional logic below)
  // - This is the same control that is accumulated in OldTestament.md / NewTestament.md
  // - This is accomplished BEFORE any customTag processing, because we inject customTags in this step!
  // - EXAMPLE:
  //     <div style="text-align: right">
  //       <label>
  //         <input type="checkbox" onclick="fw.handleCompletedCheckChange(this);" id="Mark">
  //           Book Completed
  //       </label>
  //     </div>
  if ( page.content.includes('Introduction**') ) {
    const bibleBook = page.path.replace('.md', '');
    const checkBox  = completedCheckBox(`${bibleBook}@@Book Completed`)
    const bibleBookCompletedCntl = `<div style="text-align: right">${checkBox}</div>`;
    page.content = `${bibleBookCompletedCntl}\n\n${page.content}`;
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
      console.log(\`fw:core:withFW() IMPORTANT: DELAYING function '\$\{fnName\}' execution ... to allow fw.js to be expanded\`);

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
  init,
  preProcessPage,
};
