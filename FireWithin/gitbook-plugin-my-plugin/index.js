//***
//*** my-plugin: A "local" GitBook plugin that caters to the needs of
//***            this specific project
//***            ... see: README.md for more details :-)
//***

// console.log(`***my-plugin*** EXPANDING index.js (so our plugin IS ACTIVE!`);

module.exports = {
  hooks: {
    'page:before': function(page) {

   // console.log(`***my-plugin*** Handling 'page:before' event, adding content to page: ${page.path}`);

      // page: {                   // KJB: page content of interest
      //   path:     'Hosea.md',   // KJB: good for diagnostics
      //   content:  '# whatever', // KJB: raw MarkUp content for this page'
      //   title:    'Hosea',      // KJB: title gleaned from the MarkUp (ex: # Hosea)
      //   depth:    2,
      //   rawPath:  'C:\\dev\\MyWeb\\FireWithin\\Hosea.md',
      //   dir:      'ltr',
      //   type:     'markdown',
      //   progress: [Getter/Setter],
      //   sections: [Getter/Setter]
      // }

      //***
      //*** surround ALL pages with the necessary JavaScript constructs needed for our blog
      //***

      // start/end scripts needed for the proper activation/initialization of fw.js in our client pages
      const startScript = 'START (injected from gitbook-plugin-my-plugin)'; // ?? copy to README TOO (when real)
      const endScript   = 'END (injected from gitbook-plugin-my-plugin)';

      // conditionally add a "Book Completed" check-box control on ALL pages that represent a book of the Bible
      // - these pages uniquely contain an "Introduction**" sub-string
      // - this is the same control that is accumulated in OldTestament.md/NewTestament.md
      // - EXAMPLE:
      //     <div style="text-align: right">
      //       {{book.cb1}}Mark{{book.cb2}} Book Completed{{book.cb3}}
      //     </div>
      const bibleBookCompletedCntl = !page.content.includes('Introduction**') ? ''
                                     : `<div style="text-align: right">{{book.cb1}}${page.path.replace('.md', '')}{{book.cb2}} Book Completed{{book.cb3}}</div>`;

      // ... utilize cr/lf (\n) to NOT conflict with things like "### Title", etc.
      page.content = `${startScript}\n${bibleBookCompletedCntl}\n\n${page.content}\n${endScript}`;

      // KJB: return IS needed (seems weird, as we are changing the contend directly)
      return page;
    },
  },
};
