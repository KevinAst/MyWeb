const {isArray, isBoolean, isPlainObject, isString, check} = require('./check');

// our plugin configuration (settable by client)
// ... retained via initCustomTags() below
let config = undefined;

// the active GitBook page being processed (for diagnostic purposes)
// ... because everything is synchronous (in our build process)
//     we can retain this context for all to use
let forPage = 'unknown';

// initCustomTags(): triggered after parsing the book, before generating output and pages
function initCustomTags(_config) {
  // expose our config in parent scope (for global access)
  config = _config;
  //console.log(`***INFO*** initCustomTags() XX retaining plugin config object: `, {config});
}

//*-----------------------------------------------------------------------------
//* Our Custom Tag Processors
//*-----------------------------------------------------------------------------
function processCustomTags(_forPage, markdown) {

  // retain our active forPage diagnostic
  forPage = _forPage;

  // define our generic customTag regular expression matcher
  // ... a global matcher to find all occurances (see /g)
  // EX: M{ zoomableImg('Mark_BP') }M
  //console.log(`XX before customTagRegex`);
  const customTagRegex = /M{\s*\w*.*\s*}M/g;
//const customTagRegex = /\d+/g; // TEMP - used for TEST (two digits) ... "ONE:[22] ... TWO:[44] ... THREE[33]";

  // Process each match separately
  // NOTE: RegExp.exec() API: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec
  //console.log(`XX before match loop`);
  let match;
  while ((match = customTagRegex.exec(markdown)) !== null) {
    //console.log(`XX INSIDE match loop`);

    // the matched substring (customTag)
    const customTag = match[0];
    //console.log(`XX in page ${forPage}, found customTag: ${customTag}`);

    // the starting index of the match
    const startIndex = match.index;

    //console.log(`XX found customTag match: `, {customTag, startIndex});

    // resolve the dynamic content
    // ... which varies by customTag (identifying the function, params, etc.)
    const dynamicContent = resolveDynamicContent(customTag);

    // replace the  customTag with our dynamicContent
    markdown = markdown.substring(0, startIndex) +
               dynamicContent +
               markdown.substring(startIndex + customTag.length);

    //console.log(`ITTERATE RESULT: ${markdown}`); // TOO BIG (entire page)
  }

  return markdown;
}

module.exports = {
  initCustomTags,
  processCustomTags,
};



//***
//*** ALL registered customTag processors
//***

const customTagProcessors = {
  zoomableImg,
  youTube,
};

//***
//*** ENTRY POINT: resolve the dynamic content of the supplied customTag
//*** ... we glean the function to invoke -AND- the arg ... from the supplied customTag
function resolveDynamicContent(customTag) {

  // setup assertion utility
  const verify = check.prefix(`violation in page: ${forPage} ... `);

  //console.log(`XX DYNO for customTag: '${customTag}'`);

  // extract the function to call
  const fnNameMatch = customTag.match(/\s*(\w*)\(.*/);
  const fnName      = fnNameMatch && fnNameMatch[1];
  const fn          = fnName && customTagProcessors[fnName];
  verify(fn, `NO registered function: "${fnName}" for customTag: "${customTag}"`);

  // extract the arg "{id: 'myid'}" part
  const argMatch = customTag.match(/.*\((.*?)\).*/);
  const argStr   = argMatch && argMatch[1];
  let   argObj;
  //console.log(`XX in page ${forPage}, DYNO extracted: `, {fnName, argStr});

  // convert to a json object
  try {
    // NOTE: JSON.parse() requires a well formed JSON object (with double quotes for names, and values, etc.)
    //       This can be done, but it is a bit ugly in our markdown.
    //       To solve this we use eval(), which is typically a security risk (but I am in a closed environment here - so I trust the markdown)
    // argObj = JSON.parse(argStr);
    argObj = eval(`(${argStr})`); // ... the extra parans ensure the string is treated as an expression
    //console.log(`XX DYNO argObj: `, {argObj});
  }
  catch (err) {
    verify(false, `argument is NOT a valid JavaScript reference, for customTag: "${customTag}" ... ${err.message}`);
  }

  // invoke our registered customTagProcessor
  const dynamicContent = fn(argObj);

  // that's all folks :-)
  return dynamicContent;
}

// Sandbox Test: https://playcode.io/javascript
//   const inputStr    = "ONE:[22] ... TWO:[44] ... THREE[33]";
//   const resolvedStr = processMarkdown(inputStr);
//   console.log({inputStr, resolvedStr});
//
// OUTPUT:
//   DYNO for customTag: '22'
//   ITTERATE RESULT: ONE:[Dyno Content] ... TWO:[44] ... THREE[33]
//
//   DYNO for customTag: '44'
//   ITTERATE RESULT: ONE:[Dyno Content] ... TWO:[Dyno Content] ... THREE[33]
//
//   DYNO for customTag: '33'
//   ITTERATE RESULT: ONE:[Dyno Content] ... TWO:[Dyno Content] ... THREE[Dyno Content]
//
//   inputStr:    "ONE:[22] ... TWO:[44] ... THREE[33]"
//   resolvedStr: "ONE:[Dyno Content] ... TWO:[Dyno Content] ... THREE[Dyno Content]"



//*-----------------------------------------------------------------------------
//* zoomableImg(id)
//* 
//* Inject the html to render a "large" image that is "zoomable",
//* wiring up the needed JavaScript hooks that implements this.
//* 
//* Parms:
//*   - id - The base name of the .png img file ... {id}.png
//* 
//* Custom Tag:
//*   M{ zoomableImg('Mark_BP') }M
//* 
//* Replaced With:
//*   <center>
//*     <figure>
//*       <div id="Mark_BP"></div>
//*       <figcaption>Hover to zoom, Click to open in new tab</figcaption>
//*     </figure>
//*   </center>
//*   <script>
//*     fw.addZoomableImage('Mark_BP', 'Mark_BP.png', 75);
//*   </script>
//*-----------------------------------------------------------------------------
function zoomableImg(id) {

  // parameter validation
  const self = `zoomableImg('${id}')`;
  const checkParam = check.prefix(`${self} [in page: ${forPage}] parameter violation: `);
  // ... id
  checkParam(id,           'id is required');
  checkParam(isString(id), 'id must be a string (the base name of the .png img file)');

  // expand our customTag as follows
  // CRITICAL NOTE: The END html comment (below), STOPS all subsequent markdown interpretation
  //                UNLESS the cr/lf is placed BEFORE IT!
  //                ... I have NO IDEA WHY :-(
  //                ... BOTTOM LINE: KEEP the cr/lf in place!
  const diag = config.revealCustomTags ? `<mark>Custom Tag: ${self}</mark>` : '';
  return `${diag}
<!-- START Custom Tag: ${self} -->
<center>
  <figure>
    <div id="${id}"></div>
    <figcaption>Hover to zoom, Click to open in new tab</figcaption>
  </figure>
</center>
<script>
  fw.addZoomableImage('${id}', '${id}.png', 75);
</script>

<!-- END Custom Tag: ${self} -->
`;
}


//*-----------------------------------------------------------------------------
//* youTube(id)
//* 
//* Inject the html to render an in-line YouTube video.
//* 
//* Parms:
//*   - id - The YouTube video id to display.
//* 
//* Custom Tag:
//*   M{ youTube('ZBLKrNVffgo') }M
//* 
//* Replaced With:
//*   <p align="center">
//*     <iframe name="ZBLKrNVffgo"
//*             id="ZBLKrNVffgo"
//*             width="577"
//*             height="325"
//*             src="https://www.youtube.com/embed/ZBLKrNVffgo"
//*             frameborder="0"
//*             allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
//*             allowfullscreen></iframe>
//*   </p>
//*-----------------------------------------------------------------------------
function youTube(id) {

  // parameter validation
  const self = `youTube('${id}')`;
  const checkParam = check.prefix(`${self} [in page: ${forPage}] parameter violation: `);
  // ... id
  checkParam(id,           'id is required');
  checkParam(isString(id), 'id must be a string (the YouTube video id to display)');

  // expand our customTag as follows
  // CRITICAL NOTE: The END html comment (below), STOPS all subsequent markdown interpretation
  //                UNLESS the cr/lf is placed BEFORE IT!
  //                ... I have NO IDEA WHY :-(
  //                ... BOTTOM LINE: KEEP the cr/lf in place!
  const diag = config.revealCustomTags ? `<mark>Custom Tag: ${self}</mark>` : '';
  return `${diag}
<!-- START Custom Tag: ${self} -->
<p align="center">
  <iframe name="${id}"
          id="${id}"
          width="577"
          height="325"
          src="https://www.youtube.com/embed/${id}"
          frameborder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen></iframe>
</p>

<!-- END Custom Tag: ${self} -->
`;
}
