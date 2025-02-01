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
//* ENHANCEMENT NOTE (2/12/2024)
//* ============================
//* Any of these Custom Tags can be applied:
//*    
//*  - "pre"  processor: to the markdown
//*           - using an 'M' Custom Tag Delimiter (standing for "Macro", per the original release)
//*             ... e.g. M{ fn(arg) }M
//*           - This is the "normal" usage pattern BY FAR!
//*    
//*  - "post" processor: to the HTML
//*           - using a 'P' Custom Tag Delimiter (standing for "Post Macro", a NEW enhancement)
//*             ... e.g. P{ fn(arg) }P
//*           - This option is NOT used very often.
//*           - However it is VERY useful to inject html containers to a large section of markdown,
//*             without disrupting MarkDown process (see: inject() custom tag below)
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
function processCustomTags(_forPage,  // ex: 'Hosea.md'
                           content,   // can be markdown -or- HTML (depending on when invoked: pre/post processor)
                           custTagDelim='M') { // either 'M' for preProcessor -or- 'P' for postProcessor (see: "ENHANCEMENT NOTE" above)

  // retain our active forPage diagnostic
  forPage = _forPage;

  // TEMP DIAG (for a single page of interest) to see what the html looks like BEFORE WE TOUCH IT
  // if (forPage === 'settings.md' && custTagDelim === 'P') {
  //   console.log(`HERE IS THE ENTIRE PAGE BEFORE PROCESSING: ${content}`);
  // }

  // define our generic customTag regular expression matcher
  // ... a global matcher to find all occurances (see /g)
  // EX: M{ zoomableImg(`Mark_BP`) }M
  //forPage==='MyFaith.md' && console.log(`XX before customTagRegex`);
//const customTagRegex = /M{\s*\w*.*\s*}M/g;       // ORIGINAL
  let   customTagRegex = /M{\s*\w*[\w\W]*?\s*}M/g; // FIX: Multi Line (see "BOTTOM LINE" note above)
//const customTagRegex = /\d+/g; // TEMP - used for TEST (two digits) ... "ONE:[22] ... TWO:[44] ... THREE[33]";

  // for postProcessor, use Post Macro tags ..........................    P{ fn(arg) }P     (see: "ENHANCEMENT NOTE" above)
  // ... we also SUCK UP the <p>...</p> tags injected by Markdown: ... <p>P{ fn(arg) }P</p> ... allowing us to place html containers across markdown processed code!
  if (custTagDelim !== 'M') {
//  customTagRegex = /P{\s*\w*[\w\W]*?\s*}P/g;         // SAME as above, just replace P for M
    customTagRegex = /<p>P{\s*\w*[\w\W]*?\s*}P<\/p>/g; // SUCK UP "extraneous paragraph tags too": <p>...</p>
  }

  // Process each match separately
  // NOTE: RegExp.exec() API: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec
  //forPage==='MyFaith.md' && console.log(`XX before match loop`);
  let match;
  while ((match = customTagRegex.exec(content)) !== null) {
    //forPage==='MyFaith.md' && console.log(`XX INSIDE match loop`);

    // the matched substring (customTag)
    const customTag = match[0];
    //forPage==='MyFaith.md' && console.log(`\n\n\n\n\nXX in page ${forPage}, found customTag: ${customTag}`);

    // the starting index of the match
    const startIndex = match.index;

    // forPage==='MyFaith.md' && console.log(`XX found customTag match: `, {customTag, startIndex});

    // resolve the dynamic content
    // ... which varies by customTag (identifying the function, params, etc.)
    const dynamicContent = resolveDynamicContent(customTag, custTagDelim);

    // replace the  customTag with our dynamicContent
    content = content.substring(0, startIndex) +
               dynamicContent +
               content.substring(startIndex + customTag.length);

    //forPage==='MyFaith.md' && console.log(`\n\n\nXX ITTERATE RESULT: ${content}`); // TOO BIG (entire page)
  }

  return content;
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
  studyGuideLink,
  bibleLink,
  sermonSeries,
  memorizeVerse,
  inject,
  userName,
  userEmail,
  injectSyncNote,
};

//***
//*** ENTRY POINT: resolve the dynamic content of the supplied customTag
//*** ... we glean the function to invoke -AND- the arg ... from the supplied customTag
function resolveDynamicContent(customTag, custTagDelim) {

  // setup assertion utility
  const verify = check.prefix(`violation in page: ${forPage} ... `);

  //forPage==='MyFaith.md' && console.log(`XX DYNO for customTag: '${customTag}'`);

  // extract the function to call
  const fnNameMatch = customTag.match(/\s*(\w*)\(.*/); // ORIGINAL - is fine as fnName cannot span multi-lines (see "BOTTOM LINE" note above)
  const fnName      = fnNameMatch && fnNameMatch[1];
  const fn          = fnName && customTagProcessors[fnName];
  verify(fn, `NO registered function: "${fnName}" for customTag: "${customTag}"`);

  // extract the arg "{id: 'myid'}" part
//const argMatch = customTag.match(/.*\((.*?)\).*/);                  // ORIGINAL
//const argMatch = customTag.match(/[\w\W]*?\(([\w\W]*?)\)[\w\W]*?/); // FIX: Multi Line (see "BOTTOM LINE" note above), PROB: premature right paren
  let   argMatch = customTag.match(/[\w\W]*?\(([\w\W]*?)\)\s*}M/);    // FIX: Multi Line (see "BOTTOM LINE" note above), FIX:  premature right paren

  // for postProcessor, use Post Macro tags ... P{ fn(arg) }P  (see: "ENHANCEMENT NOTE" above)
  if (custTagDelim !== 'M') {
    argMatch = customTag.match(/[\w\W]*?\(([\w\W]*?)\)\s*}P/); // ... SAME as above, just replace P for M ... extraneous paragraph tags just work (because we are in the arg)
  }

  let argStr = argMatch && argMatch[1];
  let argObj;
  //forPage==='MyFaith.md' && console.log(`XX in page ${forPage}, DYNO extracted: `, {fnName, argStr});

  // NOTE: String Literals in "post" Processing
  // for "post" processing of HTML, we have to be careful of what the Markdown has done to our CustomTag
  //   1. We can't use template strings in the usage of our tags (the argument)
  //      THIS:    P{ inject(`<div id="sign-in-form-guest">`) }P
  //      BECOMES: P{ inject(<code>&lt;div id=&quot;sign-in-form-guest&quot;&gt;</code>) }P
  //      OUCH!!
  //      BOTTOM LINE: use single tics (not template strings)
  //                   P{ inject('<div id="sign-in-form-guest">') }P
  //   2. Even after using single tics for our argument, MarkDown does some stuff (less intrusive):
  //      THIS:    P{ inject('<div id="sign-in-form-guest">') }P
  //      BECOMES: P{ inject(&#39;<div id="sign-in-form-guest">&#39;) }P
  //      THIS IS SALVAGEABLE ... we simply replace "&#39;" with "'" <<< in the next expression!!!
  argStr = argStr.replace(/&#39;/g, "'");

  // ALSO:
  // CHANGE: &lt;  TO: <
  // CHANGE: &gt;  TO: >
  argStr = argStr.replace(/&lt;/g, '<');
  argStr = argStr.replace(/&gt;/g, '>');

  // TEMP DIAG: see what the argStr looks like (for a specific example) in both pre/post processing
  // if (argStr && argStr.includes('sign-in-form-guest')) {
  //   console.log(`xx DIAG: argStr: "${argStr}" in customTag: "${customTag}"`);
  // }

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
      //forPage==='MyFaith.md' && console.log(`XX DYNO argObj: `, {argObj});
    }
    catch (err) {
      verify(false, `argument is NOT a valid JavaScript reference, for argStr: "${argStr}" in customTag: "${customTag}" ... ${err.message}`);
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
  withFW( ()=>fw.addZoomableImage('${id}', '${id}.png', 75) )
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
//*   
//*   <div style="width: 100%; aspect-ratio: 21/9; text-align: center; ">
//*     <iframe name="${id}"
//*             id="${id}"
//*             style="width: 80%; height: 100%;"
//*             src="https://www.youtube.com/embed/${id}"
//*             frameborder="0"
//*             allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
//*             allowfullscreen></iframe>
//*   </div>
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

<div style="width: 100%; aspect-ratio: 21/9; text-align: center; ">
  <iframe name="${id}"
          id="${id}"
          style="width: 80%; height: 100%;"
          src="https://www.youtube.com/embed/${id}"
          frameborder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen></iframe>
</div>

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
//*   <label><input type="checkbox" data-completions onclick="fw.handleCompletedCheckChange(this);" id="Mark">Book Completed</label>
//*-----------------------------------------------------------------------------
function completedCheckBox(_id) {

  // parameter validation
  const tick       = isString(_id) ? "`" : "";
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
  return `${diag}<label><input type="checkbox" data-completions onclick="fw.handleCompletedCheckChange(this);" id="${id}">${label}</label>`;
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
//*          When the sermon reference is 'TXT', the cooresponding title is emitted as a text item only (i.e. NO link).
//*          EX:  'TXT@@Sacrificed'
//* 
//*          If NO title is specified, it will default to 'Teaching'.
//* 
//*          EXAMPLE:
//*            - '20210418@@Pray Like Jesus' ... A Cornerstone sermon, ref: '20210418', title: 'Pray Like Jesus'
//*            - '20131113' ... A Cornerstone sermon, ref: '20131113', with NO title (defaulted to: 'Teaching')
//*            - 'https://www.youtube.com/watch?v=otrqzITuSqE@@Oxford Mathematician Destroys Atheism'
//*              ... a self-contained URL link
//*                  NOTE: This can be used for any generic URL/Label (not really sermon specific)
//* 
//* Custom Tag:
//*   M{ sermonLink(`20210418@@Pray Like Jesus`) }M
//* 
//* Replaced With:
//*   <a href="https://cornerstonechapel.net/teaching/20210418" target="_blank">Pray Like Jesus</a>
//*-----------------------------------------------------------------------------
function sermonLink(_ref) {

  // parameter validation
  const tick       = isString(_ref) ? "`" : "";
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
  // ... TXT ref, generates a text item only (i.e. NO link)
  return ref==='TXT' ? title : `${diag}<a href="${url}" target="_blank">${title}</a>`;

}


//*-----------------------------------------------------------------------------
//* studyGuideLink(ref)
//* 
//* Inject an html link (via the <a> tag) for the Study Guide of a specific sermon.
//* 
//* Parms:
//*   - ref: The sermon reference, for this Study Guide.
//* 
//*     ALSO, this can be used to inject a completely different link (say a devotion)
//*     using the following format: `url@@label`
//*       EXAMPLE: `https://bible.com/reading-plans/snip.snip@@Devotion (Bible App)`
//* 
//* Custom Tag:
//*   M{ studyGuideLink(`20210418`) }M
//* 
//* Replaced With:
//*   <a href="https://assets01.cornerstonechapel.net/documents/studyguides/20210418.pdf" target="_blank">Study Guide</a>
//*-----------------------------------------------------------------------------
function studyGuideLink(ref) {

  // parameter validation
  const tick       = isString(ref) ? "`" : "";
  const self       = `studyGuideLink(${tick}${ref}${tick})`;
  const checkParam = check.prefix(`${self} [in page: ${forPage}] parameter violation: `);

  // ... ref
  checkParam(ref,           'ref is required');
  checkParam(isString(ref), `ref must be a string (the sermon reference for this Study Guide)`);

  // DEFAULT our url/link - to a Cornerstone sermon Study Guide
  let url  = `https://assets01.cornerstonechapel.net/documents/studyguides/${ref}.pdf`;
  let aTag = `<a href="${url}" target="_blank">Study Guide</a>`;
  // interpret independant link
  if (ref.includes('@@')) {
    const [ref2, title] = ref.split('@@');
    checkParam(isString(title), `expecting 'link@@title' for this Study Guide`);
    aTag = `<a href="${ref2}" target="_blank">${title}</a>`;
  }

  // expand our customTag as follows
  // NOTE: For customTags used in table processing, the diag/comments are JUST TOO MUCH!
  //       We simplify:
  //       - No HTML comment
  //       - diag: SGL ... for studyGuideLink
  // NOTE: To avoid problems intermizing MarkDown and HTML, we just in-line our insertion (i.e. NO cr/lf).
  //       EX USAGE:
  //          1. M{ studyGuideLink(`20210418`) }M ........... in theory (not used outside of table series)
  //          2. DIRECTLY invoked in sermonSeriesTable()
  const diag = config.revealCustomTags ? `<mark>SGL</mark>` : '';
  return `${diag}${aTag}`;
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
//*          Multiple Entries are supported (delimited with ##).
//* 
//*          Line breaks can be optionally requested (between entries), by starting the entry with 'CR:'
//* 
//*          EXAMPLE:
//*            - 'rev.21.6-8@@Rev 21:6-8'                        <<< single entry
//*            - 'rev.21.6-8@@Rev 21:6-8##rev.22.3@@Rev 22:3'    <<< multiple entries
//*            - 'rev.21.6-8@@Rev 21:6-8##rev.22.3@@CR:Rev 22:3' <<< multiple entries, with line breaks (cr/lf)
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
  const tick       = isString(_ref) ? "`" : "";
  const self       = `bibleLink(${tick}${_ref}${tick})`;
  const checkParam = check.prefix(`${self} [in page: ${forPage}] parameter violation: `);

  // ... ref
  checkParam(_ref,           'ref is required');
  checkParam(isString(_ref), `ref must be a string (the Bible verse)`);

  // our content to return
  let content = '';

  // expand our customTag as follows
  // ... iterate over all entries found in the supplied reference
  const entries      = _ref.split('##');
  let   isFirstEntry = true;
  entries.forEach( (entry) => {

    // split out the ref/title
    let [ref, title] = entry.split('@@');
    // ... validate title
    checkParam(title, 'title is required (the second part of the ref string parameter, delimited with @@)');

    // process optional cr/lf
    const isCR = title.startsWith('CR:');
    let   crLf = isFirstEntry ? '' : ', ';
    if (isCR) {
      title = title.slice(3);
      crLf  = '<br/>';
    }

    // update our content
    content += `${crLf}<a href="#" onmouseover="fw.alterBibleVerseLink(event, '${ref}')" target="_blank">${title}</a>`;

    // no longer first entry :-)
    isFirstEntry = false;
  });

  // that's all folks :-)
  // NOTE: For customTags used in table processing, the diag/comments are JUST TOO MUCH!
  //       We simplify:
  //       - No HTML comment
  //       - diag: BL ... for bibleLink
  // NOTE: To avoid problems intermizing MarkDown and HTML, we just in-line our insertion (i.e. NO cr/lf).
  //       EX USAGE:
  //          1. M{ bibleLink(`rev.21.6-8@@Revelation 21:6-8`) }M
  //          2. DIRECTLY invoked in sermonSeriesTable()
  const diag = config.revealCustomTags ? `<mark>BL</mark>` : '';
  return `${diag}${content}`;
}


//*-----------------------------------------------------------------------------
//* sermonSeries(namedParams)
//* 
//* A comprehensive and responsive table generator that details the full
//* content of an entire sermon series.
//* 
//* Parms:
//*   - namedParams: a comprehensive structure that describes the complete sermon series.
//*                  Please refer to the README for details.
//* 
//* Custom Tag:
//*   M{ sermonSeries(`{ ton-of-options-see-README }`) }M
//* 
//* Replaced With:
//*   <table> ... snip snip ... </table>
//*-----------------------------------------------------------------------------

const defaultSettings = {  // default settings - impacting the entire series
  includeStudyGuide: true, // directive to include/omit StudyGuide column (DEFAULT: true)
};

function sermonSeries(namedParams={}) {

  // parameter validation
  const self       = `sermonSeries(...)`;
  const checkParam = check.prefix(`${self} [in page: ${forPage}] parameter violation: `);

  // ... verify we are using named parameters
  checkParam(isPlainObject(namedParams), `uses named parameters (check the API)`);
  // extract each parameter
  const {entries, settings=defaultSettings, ...unknownNamedArgs} = namedParams;

  // ... entries
  checkParam(entries,          'entries is required');
  checkParam(isArray(entries), `entries must an array of sermon entry directives`);
  checkParam(entries.length>0, `entries array must have at least one entry`);

  // ... settings
  checkParam(settings,                'settings must either be supplied, or allowed to default');
  checkParam(isPlainObject(settings), 'settings (when supplied) must be a set of named properties (an object of settings)');

  // ... unrecognized named parameter
  const unknownArgKeys = Object.keys(unknownNamedArgs);
  checkParam(unknownArgKeys.length === 0,  `unrecognized named parameter(s): ${unknownArgKeys}`);
  // ... unrecognized positional parameter
  //     NOTE:  When defaulting entire struct, arguments.length is 0
  //     ISSUE: In our specific customTag case, our eval() [above] will return the last arg of positional params
  //            so we never get this error ... RATHER the last positional param is picked up as the namedParams :-(
  //            PUNT ON THIS - not all that big of a deal
  checkParam(arguments.length <= 1, `unrecognized positional parameters (only named parameters may be specified) ... ${arguments.length} positional parameters were found`);

  // extract -and- validate individual settings (defaulting as appropriate)
  // NOTE: We do this for validation purposes.
  //       Ultimately: we pass around the settings obj, which is refrehed (below) - to pick up the initialization done here.
  const {includeStudyGuide=defaultSettings.includeStudyGuide, ...unknownSettings} = settings;

  // ... includeStudyGuide
  checkParam(isBoolean(includeStudyGuide), 'settings.includeStudyGuide must be a boolean directive to include/omit StudyGuide column (DEFAULT: true)');

  // ... unrecognized settings
  const unknownSettingsKeys = Object.keys(unknownSettings);
  checkParam(unknownSettingsKeys.length === 0,  `unrecognized setting(s): ${unknownSettingsKeys}`);

  // refresh the supplied settings object (what we pass around), to pick up the initialization from the descructuring (above)
  settings.includeStudyGuide = includeStudyGuide;

  // expand our customTag as follows
  // CRITICAL NOTE: The END html comment (below), STOPS all subsequent markdown interpretation
  //                UNLESS the cr/lf is placed BEFORE IT!
  //                ... I have NO IDEA WHY :-(
  //                ... BOTTOM LINE: KEEP the cr/lf in place!
  const diag = config.revealCustomTags ? `<mark>Custom Tag: ${self}</mark>` : '';
  let content = ``;
  content += `${diag}\n<!-- START Custom Tag: ${self} -->\n`;
  ['phone', 'desktop'].forEach( (cssClass) => {
    content += expandSermonSeries(settings, entries, checkParam, cssClass);
  });
  content += `\n\n<!-- END Custom Tag: ${self} -->\n`;
  return content;
}

// internal helper: expand the entire <table> for the supplied entries
function expandSermonSeries(settings, entries, checkParam, styleClass) {

  //console.log(`XX expandSermonSeries() ... settings: `, settings);

  let content = ``;

  // open our html container (responsively styled to device size)
  content += `<div class="${styleClass}"><table>`;

  // iterrate over each entry, expanding it's content
  entries.forEach( (entry, indx) => {
    content += expandSermonEntry(settings, entry, indx+1, checkParam, styleClass);
  });

  // close our html container
  content += `</table></div>`; // ... close container

  // beam me up Scotty :-)
  return content;
}

// internal helper, emit a line-break (<br/>) when supplied truthy is significant
const lineBreakOnSignificant = (truthy) => truthy ? '<br/>' : '';

// internal helper: expand the <tr>/<td> items for the supplied entry
function expandSermonEntry(settings, entry, entryNum, checkParam, styleClass) { // styleClass: 'phone'/'desktop'

  const vertical = styleClass === 'phone';

  // validate our entry (the entry is from our client)
  // ... must be an object
  checkParam(isPlainObject(entry), `entry must be an object`);
  // extract each entry property
  const {id, sermon='Teaching', desc='', scripture, studyGuide, date, extraSermonLink, extraLinkInScriptureCell, ...unknownProps} = entry;

  // ... id <<< USE THIS
  checkParam(id,           'entry id is required');
  checkParam(isString(id), `entry id must be a string, NOT: ${id}`);

  const formattedDateStrFromId = formatDateFromId(id); // either: '11/03/2018' (for a valid date)  -or- '' (for anything else)
  const isCornerstoneEntry     = formattedDateStrFromId ? true : false;

  // ... sermon
  let sermonRef = ''; // ... derivation used in sermonLink(sermonRef) <<< USE THIS when supplied
  if (sermon.includes('@@')) { // self contained 'sermonRef@@Title'
    sermonRef = sermon;
  }
  else if (sermon === 'NONE') { // NO sermon for this entry
    sermonRef = '';
  }
  else { // OMMITED: 'Teaching', -OR- user supplied title ... generate a Cornerstone sermon
    checkParam(isCornerstoneEntry, `plain sermon title: '${sermon}' cannot be used for NON Cornerstone entry ... for entry id: '${id}'`)
    sermonRef = `${id}@@${sermon}`;
  }

  // ... scripture
  if (scripture) { // optional when there is NO scripture <<< USE THIS when supplied
    checkParam(scripture.includes('@@'), `scripture (when supplied) must contain the '@@' delimiter ... for entry id: '${id}'`);
  }
  
  // ... studyGuide
  let studyGuideRef = ''; // ... derivation used in studyGuideLink(studyGuideRef) <<< USE THIS when supplied
  // only applicable when enabled via global settings
  if (settings.includeStudyGuide) {
    if (studyGuide === 'NONE') { // NO studyGuide for this entry
      studyGuideRef = '';
    }
    else if (studyGuide) { // use supplied studyGuide
      studyGuideRef = studyGuide;
    }
    else { // NOT supplied ... use id
      checkParam(isCornerstoneEntry, `id cannot be used for studyGuide for NON Cornerstone entry ... for entry id: '${id}'`)
      studyGuideRef = id;
    }
  }

  // ... date
  let formattedDate = ''; // <<< USE THIS
  if (date) {
    formattedDate = processDateEntry(date); // use supplied date
  }
  else { 
    formattedDate = formattedDateStrFromId; // when NOT supplied, use derivation from id (may be blank)
  }
  checkParam(formattedDate, `a formatted date MUST be supplied EITHER via id prop (for Cornerstone entry), or date prop ... for entry id: '${id}'`)
  
  // ... extraSermonLink
  if (extraSermonLink) {
    checkParam(isString(extraSermonLink), `extraSermonLink (when supplied) must be a string, NOT: ${extraSermonLink}`);
    checkParam(extraSermonLink.startsWith('http'), `extraSermonLink (when supplied) must begin with 'http' ... for entry id: '${id}'`);
    checkParam(extraSermonLink.includes('@@'),     `extraSermonLink (when supplied) must contain the '@@' delimiter ... for entry id: '${id}'`);
  }
  // ... extraLinkInScriptureCell
  if (extraLinkInScriptureCell) {
    checkParam(isString(extraLinkInScriptureCell), `extraLinkInScriptureCell (when supplied) must be a string, NOT: ${extraLinkInScriptureCell}`);
    checkParam(extraLinkInScriptureCell.startsWith('http'), `extraLinkInScriptureCell (when supplied) must begin with 'http' ... for entry id: '${id}'`);
    checkParam(extraLinkInScriptureCell.includes('@@'),     `extraLinkInScriptureCell (when supplied) must contain the '@@' delimiter ... for entry id: '${id}'`);
  }

  // ... unrecognized entry properties
  const unknownPropKeys = Object.keys(unknownProps);
  checkParam(unknownPropKeys.length === 0, `unrecognized entry properties: ${unknownPropKeys}`);

  //***
  //*** THIS IS IT: Generate our Entry
  //***

  let content = ``;

  // entry start (table row)
  content += `<tr>`;

  // completed checkbox & entryNum
  content += `<td>`;
  content += completedCheckBox(`${id}@@ ${entryNum}.`);
  content += `</td><td>`;

  // sermon (when supplied)
  content += sermonRef ? sermonLink(sermonRef) : '';
  content += extraSermonLink ? `${lineBreakOnSignificant(sermonRef)}${sermonLink(extraSermonLink)}` : '';
  if (desc) { // add description WHEN defined ... typically LARGE - conditionally displayed at user request
    content += `<i data-fw-desc style="display: none;"><br/>${desc}</i>`;
  }
  content += vertical ? `<br/>` : `</td><td>`; // a vertical layout uses a simple line-feed (within the same cell)

  // scripture (when supplied)
  content += scripture ? bibleLink(scripture) : '';
  content += extraLinkInScriptureCell ? `${lineBreakOnSignificant(scripture)}${sermonLink(extraLinkInScriptureCell)}` : '';
  content += `</td><td>`;

  // date
  content += formattedDate;

  // study guide (when enabled via global settings)
  if (settings.includeStudyGuide) {
    // close prior cell and start new
    content += vertical ? `<br/>` : `</td><td>`; // a vertical layout uses a simple line-feed (within the same cell)

    // study guide (when supplied)
    content += studyGuideRef ? studyGuideLink(studyGuideRef) : '';
    content += `</td>`;
  }
  else { // study guide NOT enabled (via global settings)
    content += `</td>`; // close out prior cell
  }


  // entry end (table row)
  content += `</td>`;

  // beam me up Scotty :-)
  return content;

}

// internal helper
// return a formatted date ('MM/DD/YYYY') from an entry id ('YYYYMMDD'), or empty string ('') if id is NOT a valid date
// NOTE: Cornerstone id's conform to the 'YYYYMMDD' format
function formatDateFromId(id) {
  if (id.length !== 8) return false;

  const year  = parseInt(id.substring(0, 4));
  const month = parseInt(id.substring(4, 6));
  const day   = parseInt(id.substring(6, 8));

  if (isNaN(year) || isNaN(month) || isNaN(day))   return '';
  if (year < 1956 || year > 2040)                  return ''; // ... somewhat arbitrary year validation range
  if (month < 1 || month > 12)                     return '';
  if (day < 1 || day > 31)                         return '';
  if ([4, 6, 9, 11].includes(month) && day === 31) return '';
  if (month === 2 && day === 29 && !(year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0))) return '';
  return formatDate(year, month, day);
}

// internal helper
function formatDate(year, month, day) {
  const monthStr = month.toString().padStart(2, '0');
  const dayStr   = day.toString()  .padStart(2, '0');
  return `${monthStr}/${dayStr}/${year}`;
}

// internal helper
// extra processor of date entry
// ... supporting:
//     'DeepDive:ytHash@@desc[##ytHash@@desc...]'
function processDateEntry(date) {

  // use supplied date as-is (when NO special processing)
  if (!date.startsWith('DeepDive:')) {
    return date;
  }

  // OTHERWISE: interpret 'DeepDive:ytHash@@desc[##ytHash@@desc...]'

  // parameter validation
  const tick       = isString(date) ? "`" : "";
  const self       = `processDateEntry(${tick}${date}${tick})`;
  const checkParam = check.prefix(`${self} [in page: ${forPage}] parameter violation: `);

  // our content to return
  let content = '';

  const entries = date.slice(9).split('##'); // remove 'DeepDive:' and split by '##' entry delimiter
  let   crLf    = '';
  entries.forEach( (entry) => {
    // split out the ref/title
    let [ytHash, desc] = entry.split('@@');
    // ... validate desc
    checkParam(desc, 'desc is required (the second part of the date string parameter, delimited with @@)');

    // update our content with a YouTube linke
    content += `${crLf}<a href="https://www.youtube.com/watch?v=${ytHash}" target="_blank">DD:${desc}</a>`;

    crLf = '<br/>'; // subsequent entries have a cr/lf
  });

  return content;
}


//*-----------------------------------------------------------------------------
//* memorizeVerse(namedParams)
//* 
//* Inject the html to render a scripture verse to memorize, including
//* all the controls (completion checkbox, verse link, translation
//* selector, verse text, and audio playback controls).
//* 
//* Parms:
//*   - namedParams: a comprehensive structure that describes all aspects of the memory verse.
//*                  Please refer to the README for details.
//* 
//* Custom Tag: TODO: ?? eventually this will be a P{ tag
//*   M{ memorizeVerse(`{ ton-of-options-see-README }`) }M
//* 
//* Replaced With:
//*   <div data-memory-verse="luk.9.23-24" id="luk_9_23-24"> ... container (used as top-level entry, linkable by TOC)
//*     distinguishing visual section break (horizontal line)
//*     <p>
//*       completed checkbox
//*       verse link
//*       translation selector
//*     </p>
//*     <!-- many translation divs (under data-memory-verse div) ... only ONE visible at a time -->
//*     <div class="indent" data-memory-verse-translation="NLT" style="display: none;">`; ... NLT: sample translation
//*       verse text
//*       audio playback controls
//*     </div>
//*     ... snip snip: more translation divs
//*   </div>
//*-----------------------------------------------------------------------------
function memorizeVerse(namedParams={}) {

  // parameter validation
  const self       = `memorizeVerse(...)`;
  const checkParam = check.prefix(`${self} [in page: ${forPage}] parameter violation: `);

  // ... verify we are using named parameters
  checkParam(isPlainObject(namedParams), `uses named parameters (check the API)`);
  // extract each parameter
  const {ref:scriptRef, label, context, text, ...unknownNamedArgs} = namedParams;

  // ... ref
  checkParam(scriptRef,           'ref is required');
  checkParam(isString(scriptRef), 'ref must be a string (the scripture reference code [YouVersion format])');
  // ... must be alpha numeric with "." and "-"
  checkParam(/^[a-zA-Z0-9.-]+$/.test(scriptRef), `ref ('${scriptRef}') is NOT a valid YouVersion format (it can only contain alpha numeric characters, with a '.' and '-' ... EX: 'luk.9.23-24')`);

  // our internal "sanitized" scriptRef (translating "." <--> "_") making it suitable to be used in DB and DOM ids
  const scriptRefSanitized = scriptRef.replace(/\./g, "_");

  // ... label
  checkParam(label,           'label is required');
  checkParam(isString(label), 'label must be a string (the scripture label)');

  // ... context (optional)
  if (context) {
    checkParam(isString(context), 'context (when supplied) must be a string (a short context of the scripture)');
  }

  // ... text
  checkParam(text,                'text object is required');
  checkParam(isPlainObject(text), 'text must be an object object with scripture text for given translations (the object keys)');

  // ... unrecognized named parameter
  const unknownArgKeys = Object.keys(unknownNamedArgs);
  checkParam(unknownArgKeys.length === 0,  `unrecognized named parameter(s): ${unknownArgKeys}`);
  // ... unrecognized positional parameter
  //     NOTE:  When defaulting entire struct, arguments.length is 0
  //     ISSUE: In our specific customTag case, our eval() [above] will return the last arg of positional params
  //            so we never get this error ... RATHER the last positional param is picked up as the namedParams :-(
  //            PUNT ON THIS - not all that big of a deal
  checkParam(arguments.length <= 1, `unrecognized positional parameters (only named parameters may be specified) ... ${arguments.length} positional parameters were found`);

  // extract -and- validate individual translation keys (each key is the translation)
  const textKeys = Object.keys(text);

  // ... at minimum, must have one scripture text
  checkParam(textKeys.length > 0, `at least one translation scripture text must be supplied ... ex: text: { NLT: '... scripture text here' }`);

  const supportedTranslations = ['NLT', 'NKJV', 'ESV', 'CSB', 'KJV', 'NIV']; // ??## update for NEW ICB translation ... can we centralize this somewhere?

  // ... a DEFAULT translation (for this memory verse) can optionally be defined BY specifing by a "*" suffix
  //     NOTE: When NO DEFAULT is is specified
  //           - We fallback to FireWithin "Bible Translation" Settings (at runtime)
  //             NOTE: If the run-time setting is NOT included
  //                   in THIS Memory Verse, we use the FIRST Translation
  //                   defined in THIS definition (i.e. here)
  //                   ... done at runtime (in fw.js - syncUIMemoryVerseTranslation())
  let defaultTranslation = '';

  // ... validate the supplied translations (the textKeys) -AND- resolve the defaultTranslation (ending with a '*')
  const translationKeys = textKeys.map(key => {

    if (key.endsWith("*")) { // entry ending with '*' represents the defaultTranslation
      // prune the ending '*'
      key = key.slice(0, -1);
      // retain the defaultTranslation, after insuring multiple defaults ARE NOT defined
      checkParam(defaultTranslation === '', `you may only specify ONE default translation (by suffixing the text object key with a "*" ... you have multiple in: ${textKeys}`);
      defaultTranslation = key;
      // morph the key/value pair in text[] array to the real key (without the * default semantics)
      text[key] = text[`${key}*`]
    }

    // ... the translationKey must be a well known supported value
    checkParam(supportedTranslations.includes(key), `text.${key} is NOT a valid translation. Supported translations are: ${supportedTranslations}`);

    // ... the text entry must be supplied as a string
    const scriptureText = text[key];
    checkParam(scriptureText,           `the text.${key} value must be supplied`);
    checkParam(isString(scriptureText), `the text.${key} value must be a string (the scripture text for a given translation`);

    // continue iteration
    return key;
  });

  // expand our customTag as follows
  // CRITICAL NOTE: The END html comment (below), STOPS all subsequent markdown interpretation
  //                UNLESS the cr/lf is placed BEFORE IT!
  //                ... I have NO IDEA WHY :-(
  //                ... BOTTOM LINE: KEEP the cr/lf in place!
  const diag = config.revealCustomTags ? `<mark>Custom Tag: ${self}</mark>` : '';
  let content = ``;
  content += `${diag}\n<!-- START Custom Tag: ${self} -->\n`;

  // starting container (used as top-level entry, linkable by TOC)
  // NOTE: TOC links to this top-level item generates obsecure gitbook theme.js error (reading property of undefined (invoking split())
  //       - I have seen this before
  //       - unsure what it is, but I can't seem to fix
  //       - just live with it :-(
  content += `<div id="${scriptRefSanitized}" data-memory-verse="${scriptRef}" data-default-translation="${defaultTranslation}">`;

  // distinguishing visual section break (horizontal line) - solid grey centered (auto) 70% wide with rounded corners
  content += `<hr style="height: 9px; background-color: #616a6b; border: none; width: 70%; margin: 20px auto; border-radius: 5px;">`;

  // expose the context, when supplied (a short context of the scripture)
  if (context) {
    content += `<p class="indent" style="text-align: center;"><i>${context}</i></p>`;
  }

  // scripture paragraph
  content += `<p>`;

  // completed checkbox
  content += completedCheckBox(`verseMemorized-${scriptRefSanitized}`); // ... added "verseMemorized-" prefix, so as to NOT conflict with top-level ID

  // verse link
  // NOTE 1: We do NOT use bibleLink(ref) because THIS link is NOT controlled by the 
  //         dynamic behavior of bible translations directed from global user settings
  //         RATHER it is a specific translation
  // NOTE 2: The link href parameter is set at run-time (see: syncUIMemoryVerseTranslation() in fw.js)
  content += `&nbsp;&nbsp;<a href="#" target="_blank" style="font-size: 18px; font-weight: bold;">${label}</a>`;
  
  // translation selector
  content += `<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<select data-script-ref-sanitized="${scriptRefSanitized}" onchange="fw.handleMemoryVerseTranslationChange(event)">`;

  translationKeys.forEach(translationKey => {
    content += `<option value="${translationKey}">${translationKey}</option>`;
  });
  content += `</select>`;

  // end of initial paragraph
  content += `</p>`;

  // ?? quick-and-dirty test to see how much space is used (on cell phone) if the translation selector were buttons
  content += `<p class="indent" style="text-align: center;">`;
  translationKeys.forEach(translationKey => {
    content += `&nbsp;<button type="button">${translationKey}</button>`;
  });
  content += `</p>`;

  // generate all our translation divs
  content += `<!-- many translation divs (under memory-verse div) ... only ONE visible at a time -->`;
  translationKeys.forEach(translationKey => {
    content += `<div class="indent" data-memory-verse-translation="${translationKey}">`;
    content +=   `<blockquote><p style="font-size: 1.4em; font-weight: bold; font-style: italic;">${text[translationKey]}</p></blockquote>`; // verse text ... 1.4em - 40% larger than it's parent element
    content +=   `<audio controls loop onplay="fw.preventConcurrentAudioPlayback(this)">`; // audio playback controls
    content +=     `<source src="Memorization/${scriptRef}.${translationKey}.m4a" type="audio/mp4">`;
    content +=     `audio NOT supported by this browser :-(`;
    content +=   `</audio>`;
    content +=   `<p>&nbsp;</p>`;
    content += `</div>`;
  });

  // ending container
  content += `</div>`;

  content += `\n\n<!-- END Custom Tag: ${self} -->\n`;
  return content;
}


//*-----------------------------------------------------------------------------
//* inject(content)
//* 
//* Inject the supplied content in the page.
//* 
//* This is tag is very specialized.  It is useful in "post" processing HTML
//* (e.g. `P{ inject(...) }P`), to inject html containers to a large section
//*  of markdown, without disrupting MarkDown process.  If you inject these
//*  html directly in the markdown, mardown will stop interpreting anything 
//*  in that section.
//* 
//* NOTE: A "post" process requires the user to use a single tick (') for it's 
//*       string parameter ... see: "String Literals in "post" Processing" (above).
//* 
//* Example:
//* 
//*   - Without inject:
//*       <div id="whatever">
//*         Markdown interpretion **is disabled** _within an html block_ :-(
//*       </div>
//* 
//*   - WITH inject:
//*       P{ inject('<div id="whatever">') }P
//*         Can **continue** to _use_ MarkDown!
//*       P{ inject('</div>') }P
//* 
//* NOTE: The internals of this implementation is ONLY KNOWN to operate correctly 
//*       by placing this custom tag on it's own dedicated markdown paragraph/line.
//*       - This is because the post-processer has to remove the extrainous paragraph
//*         wrappers injected by the pre-processed MarkDown (e.g. <p>...</p>).
//*       - This allows us to introduce html fragments, surrounding a section of content.
//*       - The implementation of this is very crude (see: "extraneous paragraph tags" note above), 
//*         ... and is the reason it needs to be on a seperate line!
//* 
//* Parms:
//*   - content: The content to inject.
//* 
//* Custom Tag:
//*   P{ inject('<div id="123">') }P
//* 
//* Replaced With:
//*   <div id="123">
//*-----------------------------------------------------------------------------
function inject(content) {

  // parameter validation
  const tick       = isString(content) ? "'" : "";
  const self       = `inject(${tick}${content}${tick})`;
  const checkParam = check.prefix(`${self} [in page: ${forPage}] parameter violation: `);

  // ... content
  checkParam(content,           'content is required');
  checkParam(isString(content), `content must be a string (the content to inject)`);

  // expand our customTag as follows
  // NOTE: Regarding `diag`, in this case we have to be carful, as any html content is 
  //       interpreted as such in the `diag` insertion.
  //       - We could  "protect" this content and prevent it from rendering as actual html
  //       - We opted for a more simple ... just show: inject(see-embedded-html-comment)
  // CRITICAL NOTE: The END html comment (below), STOPS all subsequent markdown interpretation
  //                UNLESS the cr/lf is placed BEFORE IT!
  //                ... I have NO IDEA WHY :-(
  //                ... BOTTOM LINE: KEEP the cr/lf in place!
  const diag = config.revealCustomTags ? `<mark>Custom Tag: inject(see-embedded-html-comment)</mark>` : '';
  return `${diag}
<!-- START Custom Tag: ${self} -->
${content}

<!-- END Custom Tag: ${self} -->
`;
}


//*-----------------------------------------------------------------------------
//* userName()
//* 
//* Inject the html that will dynamically reflect the userName of the active user.
//* 
//* Parms:
//*   NONE
//* 
//* Custom Tag:
//*   M{ userName() }M
//* 
//* Replaced With:
//*   <b data-fw-user-name>sync-name</b>
//*-----------------------------------------------------------------------------
function userName(arg) {

  // parameter validation
  const tick       = isString(arg) ? "`" : "";
  const self       = `userName(${tick}${arg}${tick})`;
  const checkParam = check.prefix(`${self} [in page: ${forPage}] parameter violation: `);

  // ... arg
  checkParam(!arg, 'NO argument is expected');

  // ... devise our html to inject
  const html = '<b data-fw-user-name>sync-name</b>';

  // expand our customTag as follows
  // NOTE: For customTags used in table processing, the diag/comments are JUST TOO MUCH!
  //       We simplify:
  //       - No HTML comment
  //       - diag: UN ... for userName
  // NOTE: To avoid problems intermizing MarkDown and HTML, we just in-line our insertion (i.e. NO cr/lf).
  const diag = config.revealCustomTags ? `<mark>UN</mark>` : '';
  return `${diag}${html}`;
}


//*-----------------------------------------------------------------------------
//* userEmail()
//* 
//* Inject the html that will dynamically reflect the userEmail of the active user.
//* 
//* Parms:
//*   NONE
//* 
//* Custom Tag:
//*   M{ userEmail() }M
//* 
//* Replaced With:
//*   <b data-fw-user-email>sync-email</b>
//*-----------------------------------------------------------------------------
function userEmail(arg) {

  // parameter validation
  const tick       = isString(arg) ? "`" : "";
  const self       = `userEmail(${tick}${arg}${tick})`;
  const checkParam = check.prefix(`${self} [in page: ${forPage}] parameter violation: `);

  // ... arg
  checkParam(!arg, 'NO argument is expected');

  // ... devise our html to inject
  const html = '<b data-fw-user-email>sync-email</b>';

  // expand our customTag as follows
  // NOTE: For customTags used in table processing, the diag/comments are JUST TOO MUCH!
  //       We simplify:
  //       - No HTML comment
  //       - diag: UP ... for userEmail
  // NOTE: To avoid problems intermizing MarkDown and HTML, we just in-line our insertion (i.e. NO cr/lf).
  const diag = config.revealCustomTags ? `<mark>UP</mark>` : '';
  return `${diag}${html}`;
}


//*-----------------------------------------------------------------------------
//* injectSyncNote(ctx)
//* 
//* Inject a state synchronization note, that will dynamically change, based on
//* whether the user is signed-in or signed-out.
//* 
//* SO KOOL: This custom tag generates:
//*          - BOTH: post macros (that control note dynamics)
//*          - AND: markdown (for the note itself)
//* 
//* Parms:
//*   - ctx - The contextual variation of the note
//*           ... either: 'settings'
//*           ... or:     'completed checks'
//* 
//* Custom Tag:
//*   M{ injectSyncNote(`completed checks`) }M
//* 
//* Replaced With:
//*   P{ inject('<div id="state-sync-note-signed-out">') }P
//*     ... signed-out note WITH markdown AND ctx param
//*   P{ inject('</div><div id="state-sync-note-signed-in">') }P
//*     ... signed-in note WITH markdown AND ctx param
//*   P{ inject('</div>') }P
//*-----------------------------------------------------------------------------
function injectSyncNote(ctx) {

  // parameter validation
  const self       = `injectSyncNote('${ctx}')`;
  const checkParam = check.prefix(`${self} [in page: ${forPage}] parameter violation: `);
  // ... ctx
  checkParam(ctx,           'ctx is required');
  checkParam(isString(ctx), 'ctx must be a string (the context of the note)');

  // expand our customTag as follows
  // CRITICAL NOTE: The END html comment (below), STOPS all subsequent markdown interpretation
  //                UNLESS the cr/lf is placed BEFORE IT!
  //                ... I have NO IDEA WHY :-(
  //                ... BOTTOM LINE: KEEP the cr/lf in place!
  const diag = config.revealCustomTags ? `<mark>Custom Tag: ${self}</mark>` : '';
  return `${diag}
<!-- START Custom Tag: ${self} -->

P{ inject('<div id="state-sync-note-signed-out">') }P

> **Please Note** that because you are a "Guest" user, these ${ctx}
> are retained on your local device.  That means they will not follow
> you when you use multiple devices _(say a laptop and a cell
> phone)_. In other words, it's really the state of the device you are
> using.
> 
> You can overcome this limitation by **establishing a Fire Within user
> account**.  When you do this, your state is maintained in the cloud,
> and **automatically syncs across all devices** _(that are signed-in to
> the same account)_.
> 
> For more information on this topic, go to the {{book.UserAccount}} section
> of the {{book.Settings}} page.

P{ inject('</div><div id="state-sync-note-signed-in">') }P

> **Please Note** that because you have signed-in to the Fire Within site, these ${ctx}
> will **automatically sync to all of your devices**  _(that are signed-in to
> the same account)_ ... **life is good!**.

P{ inject('</div>') }P

<!-- END Custom Tag: ${self} -->
`;
}
