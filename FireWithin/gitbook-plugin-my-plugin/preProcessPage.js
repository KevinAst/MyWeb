//***
//*** Pre Process the supplied GitBook page, adding local JavaScript
//*** contexts, processing customeTags, etc.
//***
//*** This function should be registered to the GitBook 'page:before'
//*** hook, which is run before the templating engine is applied on the page.
//***

const {initCustomTags, processCustomTags} = require('./customTagsProcessor');

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
  //       {{book.cb1}}Mark{{book.cb2}} Book Completed{{book.cb3}}
  //     </div>
  if ( page.content.includes('Introduction**') ) {
    const bibleBookCompletedCntl = `<div style="text-align: right">{{book.cb1}}${page.path.replace('.md', '')}{{book.cb2}} Book Completed{{book.cb3}}</div>`;
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

  // start/end scripts needed for the proper activation/initialization of fw.js in our client pages
  const startScript = `<script src="fw.js"></script>`;      // inject fw.js script in every page
  const endScript   = `<script> fw.pageSetup(); </script>`; // auto run pageSetup() at end (when page is rendered)

  // surround the page with the necessary JavaScript constructs
  // ... utilize cr/lf (\n) to NOT conflict with various markdown constructs (like "### Title", etc.)
  //     for some reason, double cr/lf are needed (not sure why)
  page.content = `${startScript}\n\n${page.content}\n\n${endScript}`;


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
