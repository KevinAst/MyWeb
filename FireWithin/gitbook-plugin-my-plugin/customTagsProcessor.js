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
//*    
//* Regular Expressions
//* ===================
//* Here is some insight on the regular expressions found in this process:
//* 
//* The general format of our Custom Tag is as follows:
//* 
//*   M{ fn(arg) }M
//* 
//* - to keep the footprint small, we use cryptic identifier ('M' stands for Macro)
//* - fn:  is the Custom Tag function that emits the desired content (typically html)
//* - arg: is the argument passed into the function.  In our usage, this will always 
//*        be a literal ... either a string, or named arguments (via a JSON obj).
//* 
//*   Multi Line
//*   ==========
//* 
//*   We support these macro tags spanning multiple lines.  This is necessary in
//*   the case where the arg is large (a complex JSON structure), but it can also
//*   occur when you format the paragraphs of your MarkDown.
//* 
//*   This is where the regex becomes more complex (handling line breaks).
//*   Our process has 3 specific regex:
//*     1. the primary matcher  (see: customTagRegex)
//*     2. the function matcher (see: fnNameMatch)
//*     3. the argument matcher (see: argMatch)
//* 
//*   Before multi-line requirement, our regex were relatively straight forward.
//* 
//*   - The key quirky aspect of supporting multi-line is `.` regexp ... which 
//*     matches ANY char EXCEPT line break.
//* 
//*   - To address that, we REPLACE `.` WITH `[\w\W]` ... a set of word-char
//*     and non-word-char (INCLUDING line break).
//* 
//*   - When you apply the `?` qualifier to this (zero or more), we REPLACE
//*     `.*` WITH `[\w\W]*`.
//* 
//*   - The next problem, is this expression becomes to aggressive, swallowing
//*     up multiple customTags in one massive expression (NOT GOOD).
//* 
//*     To fix this we apply the `?` lazy qualifier, to pull back on this.
//* 
//* 
//*   BOTTOM LINE:
//*   ===========
//* 
//*     ANY `.*` expression is REPLACED with `[\w\W]*?`.
//* 
//*     Hope this gives you a better understanding :-)
//* 
//* 
//*   Multi Line (one more thing)
//*   ==========
//* 
//*    One last point on Multi Line custom tags.  This point is an
//*    instruction to the user of Custom Tags.  In the course of formatting
//*    your MarkDown, it is possible that a Custom Tag string argument could
//*    be re-formatted into multi lines.
//*    
//*    For example:
//*    
//*      M{ bibleLink('JHN.5.29@@John 5:29') }M
//*    
//*    Could be reformatted as follows (in the context of other text around it):
//*    
//*      M{ bibleLink('JHN.5.29@@John
//*      5:29') }M
//*    
//*    The problem with this, is the string argument is NOT valid.
//*    
//*    To fix this issue, the user should always use Template Literals for
//*    their string literals (i.e. THIS: ` NOT THIS: '); The reason for this
//*    is string template literals can span multiple lines.  Following this
//*    heuristic, the following macro is valid:
//*    
//*      M{ bibleLink(`JHN.5.29@@John
//*      5:29`) }M
//*   
//*-----------------------------------------------------------------------------
function processCustomTags(_forPage, markdown) {

  // retain our active forPage diagnostic
  forPage = _forPage;

  // define our generic customTag regular expression matcher
  // ... a global matcher to find all occurances (see /g)
  // EX: M{ zoomableImg(`Mark_BP`) }M
  //forPage==='WorkInProgress.md' && console.log(`XX before customTagRegex`);
//const customTagRegex = /M{\s*\w*.*\s*}M/g;       // ORIGINAL
  const customTagRegex = /M{\s*\w*[\w\W]*?\s*}M/g; // FIX: Multi Line (see "BOTTOM LINE" note above)

//const customTagRegex = /\d+/g; // TEMP - used for TEST (two digits) ... "ONE:[22] ... TWO:[44] ... THREE[33]";

  // Process each match separately
  // NOTE: RegExp.exec() API: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec
  //forPage==='WorkInProgress.md' && console.log(`XX before match loop`);
  let match;
  while ((match = customTagRegex.exec(markdown)) !== null) {
    //forPage==='WorkInProgress.md' && console.log(`XX INSIDE match loop`);

    // the matched substring (customTag)
    const customTag = match[0];
    //forPage==='WorkInProgress.md' && console.log(`\n\n\n\n\nXX in page ${forPage}, found customTag: ${customTag}`);

    // the starting index of the match
    const startIndex = match.index;

    // forPage==='WorkInProgress.md' && console.log(`XX found customTag match: `, {customTag, startIndex});

    // resolve the dynamic content
    // ... which varies by customTag (identifying the function, params, etc.)
    const dynamicContent = resolveDynamicContent(customTag);

    // replace the  customTag with our dynamicContent
    markdown = markdown.substring(0, startIndex) +
               dynamicContent +
               markdown.substring(startIndex + customTag.length);

    //forPage==='WorkInProgress.md' && console.log(`\n\n\nXX ITTERATE RESULT: ${markdown}`); // TOO BIG (entire page)
  }

  return markdown;
}

module.exports = {
  initCustomTags,
  processCustomTags,
  completedCheckBox, // extra export: needed by - preProcessPage.js
};



//***
//*** ALL registered customTag processors
//***

const customTagProcessors = {
  zoomableImg,
  youTube,
  completedCheckBox,
  sermonLink,
  bibleLink,
};

//***
//*** ENTRY POINT: resolve the dynamic content of the supplied customTag
//*** ... we glean the function to invoke -AND- the arg ... from the supplied customTag
function resolveDynamicContent(customTag) {

  // setup assertion utility
  const verify = check.prefix(`violation in page: ${forPage} ... `);

  //forPage==='WorkInProgress.md' && console.log(`XX DYNO for customTag: '${customTag}'`);

  // extract the function to call
  const fnNameMatch = customTag.match(/\s*(\w*)\(.*/); // ORIGINAL - is fine as fnName cannot span multi-lines (see "BOTTOM LINE" note above)
  const fnName      = fnNameMatch && fnNameMatch[1];
  const fn          = fnName && customTagProcessors[fnName];
  verify(fn, `NO registered function: "${fnName}" for customTag: "${customTag}"`);

  // extract the arg "{id: 'myid'}" part
//const argMatch = customTag.match(/.*\((.*?)\).*/);                  // ORIGINAL
  const argMatch = customTag.match(/[\w\W]*?\(([\w\W]*?)\)[\w\W]*?/); // FIX: Multi Line (see "BOTTOM LINE" note above)

  const argStr   = argMatch && argMatch[1];
  let   argObj;
  //forPage==='WorkInProgress.md' && console.log(`XX in page ${forPage}, DYNO extracted: `, {fnName, argStr});

  // convert to a json object
  if (argStr === null || argStr === undefined) { // something like a missmatch of string literal ... ('id`)
    verify(false, `argument is NOT a valid JavaScript reference, for customTag: "${customTag}"`);
  }
  else if (argStr.trim().length === 0) { // empty string is an undefined entry ... i.e. no argument
    argObj = undefined;
  }
  else { // otherwise, convert argStr into a JS object
    try {
      // NOTE: JSON.parse() requires a well formed JSON object (with double quotes for names, and values, etc.)
      //       This can be done, but it is a bit ugly in our markdown.
      //       To solve this we use eval(), which is typically a security risk (but I am in a closed environment here - so I trust the markdown)
      // argObj = JSON.parse(argStr);
      argObj = eval(`(${argStr})`); // ... the extra parans ensure the string is treated as an expression
      //forPage==='WorkInProgress.md' && console.log(`XX DYNO argObj: `, {argObj});
    }
    catch (err) {
      verify(false, `argument is NOT a valid JavaScript reference, for customTag: "${customTag}" ... ${err.message}`);
    }
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
//*   M{ zoomableImg(`Mark_BP`) }M
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
//*   M{ youTube(`ZBLKrNVffgo`) }M
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


//*-----------------------------------------------------------------------------
//* completedCheckBox(id)
//* 
//* Inject the html to render a labeled input checkbox, specific to the
//* completed status of the blog.
//* 
//* Parms:
//*   - id:    the blog's completed status id, with an optional label (delimited with @@)
//*            EX: - 'Mark' ........... 'Mark' id with no label
//*                - '20100425@@1.' ... '20100425' id with '1.' label
//* 
//* Custom Tag:
//*   M{ completedCheckBox(`Mark@@Book Completed`) }M ... for book completed
//*   M{ completedCheckBox(`Mark`) }M                 ... label is optional
//*   M{ completedCheckBox(`20100425@@1.`) }M         ... for sermon series completed (in table)
//* 
//* Replaced With:
//*   <label><input type="checkbox" onclick="fw.handleCompletedCheckChange(this);" id="Mark">Book Completed</label>
//*-----------------------------------------------------------------------------
function completedCheckBox(_id) {

  // parameter validation
  const tick       = isString(_id) ? "'" : "";
  const self       = `completedCheckBox(${tick}${_id}${tick})`;
  const checkParam = check.prefix(`${self} [in page: ${forPage}] parameter violation: `);

  // ... id
  checkParam(_id,           'id is required');
  checkParam(isString(_id), `id must be a string (the blog's completed status id)`);

  // ... split out the optional label
  const [id, label=''] = _id.split('@@');

  // expand our customTag as follows
  // NOTE: For customTags used in table processing, the diag/comments are JUST TOO MUCH!
  //       We simplify:
  //       - No HTML comment
  //       - diag: CCB ... for completedCheckBox
  // NOTE: To avoid problems intermizing MarkDown and HTML, we just in-line our insertion (i.e. NO cr/lf).
  //       EX USAGE:
  //          1. M{ completedCheckBox(`Genesis`) }M {{book.Genesis}} ........... example: OldTestament.md
  //          2. const checkBox = completedCheckBox(`${bibleBook}@@Book Completed`) ... see: FireWithin/gitbook-plugin-my-plugin/preProcessPage.js
  //          3. DIRECTLY invoked in sermonSeriesTable()
  const diag = config.revealCustomTags ? `<mark>CCB</mark>` : '';
  return `${diag}<label><input type="checkbox" onclick="fw.handleCompletedCheckChange(this);" id="${id}">${label}</label>`;
}


//*-----------------------------------------------------------------------------
//* sermonLink(ref)
//* 
//* Inject an html link (via the <a> tag) for a specific sermon.
//* 
//* Parms:
//*   - ref: The sermon reference, with an optional title (delimited with @@).
//* 
//*          By default, the ref will generate a Cornerstone sermon link,
//*          UNLESS it begins with an 'http' - which is assumed to be a complete self-contained URL link.
//* 
//*          If NO title is specified, it will default to 'Teaching'.
//* 
//*          EXAMPLE:
//*            - '20210418@@Pray Like Jesus' ... A Cornerstone sermon, ref: '20210418', title: 'Pray Like Jesus'
//*            - '20131113' ... A Cornerstone sermon, ref: '20131113', with NO title (defaulted to: 'Teaching')
//*            - 'https://www.youtube.com/watch?v=otrqzITuSqE@@Oxford Mathematician Destroys Atheism'
//*              ... a self-contained URL link
//* 
//* Custom Tag:
//*   M{ sermonLink(`20210418@@Pray Like Jesus`) }M
//* 
//* Replaced With:
//*   <a href="https://cornerstonechapel.net/teaching/20210418" target="_blank">Pray Like Jesus</a>
//*-----------------------------------------------------------------------------
function sermonLink(_ref) {

  // parameter validation
  const tick       = isString(_ref) ? "'" : "";
  const self       = `sermonLink(${tick}${_ref}${tick})`;
  const checkParam = check.prefix(`${self} [in page: ${forPage}] parameter violation: `);

  // ... ref
  checkParam(_ref,           'ref is required');
  checkParam(isString(_ref), `ref must be a string (the sermon reference)`);

  // ... split out the optional title
  const [ref, title='Teaching'] = _ref.split('@@');

  // ... devise our url, defaulting to a Cornerstone sermon
  const url = ref.startsWith('http') ? ref : `https://cornerstonechapel.net/teaching/${ref}`;

  // expand our customTag as follows
  // NOTE: For customTags used in table processing, the diag/comments are JUST TOO MUCH!
  //       We simplify:
  //       - No HTML comment
  //       - diag: SL ... for sermonLink
  // NOTE: To avoid problems intermizing MarkDown and HTML, we just in-line our insertion (i.e. NO cr/lf).
  //       EX USAGE:
  //          1. M{ sermonLink(`20210418@@Pray Like Jesus`) }M ........... in theory (not used outside of table series)
  //          2. DIRECTLY invoked in sermonSeriesTable()
  const diag = config.revealCustomTags ? `<mark>SL</mark>` : '';
  return `${diag}<a href="${url}" target="_blank">${title}</a>`;
}


//*-----------------------------------------------------------------------------
//* bibleLink(ref)
//* 
//* Inject a Bible html link (via the <a> tag) for a specific verse.
//* 
//* NOTE: This link dynamically adjusts to the User Preferences regarding
//*       the desired Bible Translation.
//* 
//* Parms:
//*   - ref: The Bible verse, consisting of BOTH the ref (per the YouVersion API)
//*          and title (delimited with @@).
//* 
//*          EXAMPLE:
//*            - 'rev.21.6-8@@Revelation 21:6-8'
//* 
//* Custom Tag:
//*   M{ bibleLink(`rev.21.6-8@@Revelation 21:6-8`) }M
//* 
//* Replaced With:
//*   <a href="#" onmouseover="fw.alterBibleVerseLink(event, 'rev.21.6-8')" target="_blank">Revelation 21:6-8</a>
//* 
//*   NOTE: This link interacts with fw.alterBibleVerseLink(), dynamically 
//*         adjusting the href - honoring the UserPref: Bible Translation.
//*-----------------------------------------------------------------------------
function bibleLink(_ref) {

  // parameter validation
  const tick       = isString(_ref) ? "'" : "";
  const self       = `bibleLink(${tick}${_ref}${tick})`;
  const checkParam = check.prefix(`${self} [in page: ${forPage}] parameter violation: `);

  // ... ref
  checkParam(_ref,           'ref is required');
  checkParam(isString(_ref), `ref must be a string (the Bible verse)`);

  // ... split out the title
  const [ref, title] = _ref.split('@@');

  // ... title
  checkParam(title, 'title is required (the second part of the ref string parameter, delimited with @@)');

  // expand our customTag as follows
  // NOTE: For customTags used in table processing, the diag/comments are JUST TOO MUCH!
  //       We simplify:
  //       - No HTML comment
  //       - diag: BL ... for bibleLink
  // NOTE: To avoid problems intermizing MarkDown and HTML, we just in-line our insertion (i.e. NO cr/lf).
  //       EX USAGE:
  //          1. M{ bibleLink(`rev.21.6-8@@Revelation 21:6-8`) }M
  //          2. DIRECTLY invoked in sermonSeriesTable()
  const diag = config.revealCustomTags ? `<mark>BL</mark>` : '';
  return `${diag}<a href="#" onmouseover="fw.alterBibleVerseLink(event, '${ref}')" target="_blank">${title}</a>`;
}
