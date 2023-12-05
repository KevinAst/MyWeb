//***
//*** my-plugin: A "local" GitBook plugin that caters to the needs of
//***            this specific project
//***            ... see: README.md for more details :-)
//***

// console.log(`***my-plugin*** EXPANDING index.js (so our plugin IS ACTIVE!`);

const {init, preProcessPage} = require('./preProcessPage');

module.exports = {
  hooks: {
    // 'init': triggered after parsing the book, before generating output and pages
    'init': function() {
      // access the GitBook configuration object (can be overwritten by client)
      const book   = this;
      const config = book.config.get('pluginsConfig')['my-plugin'];
      //console.log(`***INFO*** XX init() here is our plugin config object: `, {config});

      // expose this to our preProcessPage module
      init(config);
    },

    // 'page:before': invoked before running the templating engine on the page ... preProcessPage(page)
    'page:before': preProcessPage,
  }
};
