//***
//*** Post Process the supplied GitBook page, processing customTags.
//***
//*** This function should be registered to the GitBook 'page'
//*** hook, which is run AFTER the templating engine is applied on the page.
//*** >>> IN OTHER WORDS: it is processing HTML
//***

const {processCustomTags} = require('./customTagsProcessor');

function postProcessPage(page) {

  // console.log(`***INFO*** postProcessPage() for page: ${page.path}`);

  // KJB: CONFIRMED this is the same as in preProcesser!
  //      IT'S just that the content is HTML!!!
  // page: {                   // page content of interest
  //   path:     'Hosea.md',   // good for diagnostics
  //   content:  '<p>xyz</p>', // raw HTML content for this page
  //   title:    'Hosea',      // title gleaned from the MarkUp (ex: # Hosea)
  //   depth:    2,
  //   rawPath:  'C:\\dev\\MyWeb\\FireWithin\\Hosea.md',
  //   dir:      'ltr',
  //   type:     'markdown',   // DOHHHH ... was hoping this said HTML (we could have used that) BUT ALAS ... it still says markdown
  //   progress: [Getter/Setter],
  //   sections: [Getter/Setter]
  // }

  //***
  //*** apply customTag processing
  //***

  // we use the SAME processCustomTags() as preProcessPage.js
  // ... just a different custTagDelim (the third param)
  //     - THIS:  P{ fn(arg) }P
  //     - NOT:   M{ fn(arg) }M
  page.content = processCustomTags(page.path,     // forPage
                                   page.content,  // html content of page
                                   'P');          // resolve Post Macro tags ... P{ fn(arg) }P

  //***
  //*** process complete
  //***

  // per GitBook 'page' hook, we MUST return page
  // ... KJB: seems weird, as we are changing the content directly
  return page;
}

module.exports = {
  postProcessPage,
};
