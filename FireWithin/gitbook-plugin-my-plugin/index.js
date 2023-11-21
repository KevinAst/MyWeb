//***
//*** my-plugin: A "local" GitBook plugin that caters to the needs of
//***            this specific project
//***            ... see: README.md for more details :-)
//***

// console.log(`***my-plugin*** EXPANDING index.js (so our plugin IS ACTIVE!`);

const {preProcessPage} = require('./preProcessPage');

module.exports = {
  hooks: {
    // 'page:before': invoked before running the templating engine on the page ... preProcessPage(page)
    'page:before': preProcessPage,
  }
};
