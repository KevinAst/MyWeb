//*-----------------------------------------------------------------------------
//* Our Custom Tag Processors
//*-----------------------------------------------------------------------------

function processCustomTags(markdown) {

  // define our generic customTag regular expression matcher
  // ... a global matcher to find all occurances (see /g)
  // EX: M{ my-plugin:injectZoomableImage({id: 'Mark_BP'}) }M
  //console.log(`XX before customTagRegex`);
  const customTagRegex = /M{\s*my-plugin:\w*.*\s*}M/g;
//const customTagRegex = /\d+/g; // TEMP - used for TEST (two digits) ... "ONE:[22] ... TWO:[44] ... THREE[33]";

  // Process each match separately
  // NOTE: RegExp.exec() API: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec
  //console.log(`XX before match loop`);
  let match;
  while ((match = customTagRegex.exec(markdown)) !== null) {
    //console.log(`XX INSIDE match loop`);

    // the matched substring (customTag)
    const customTag = match[0];

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
  processCustomTags,
};



//***
//*** ALL registered customTag processors
//***

const customTagProcessors = {
  injectZoomableImage,
};

//***
//*** ENTRY POINT: resolve the dynamic content of the supplied customTag
//*** ... we glean the function to invoke -AND- the arg ... from the supplied customTag
function resolveDynamicContent(customTag) {
  //console.log(`XX DYNO for customTag: '${customTag}'`);

  // extract the function to call
  const fnNameMatch = customTag.match(/.*my-plugin:(\w*)\(.*/);
  const fnName      = fnNameMatch && fnNameMatch[1];
  const fn          = fnName && customTagProcessors[fnName];
  if (!fn) {
    throw new Error(`*** ERROR *** NO registered function for customTag: "${customTag}"`);
  }

  // extract the arg "{id: 'myid'}" part
  const argMatch = customTag.match(/.*\((.*?)\).*/);
  const argStr   = argMatch && argMatch[1];
  let   argObj;
  //console.log(`XX DYNO extracted: `, {fnName, argStr});
  // convert to a json object
  try {
    // NOTE: JSON.parse() requires a well formed JSON object (with double quotes for names, and values, etc.)
    //       This can be done, but it is a bit ugly in our markdown.
    //       To solve this we use eval(), which is typically a security risk (but I am in a closed environment here - so I trust the markdown)
    // argObj = JSON.parse(argStr);
    argObj = eval(`(${argStr})`); // ... the extra parans to help ensure the string is treated as an expression.
    //console.log(`XX DYNO argObj: `, {argObj});
  }
  catch (err) {
    throw new Error(`*** ERROR *** argument is NOT a valid JSON object, for customTag: "${customTag}" ... ${err.message}`);
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
//* injectZoomableImage({id})
//* 
//* Custom Tag:
//*   M{ my-plugin:injectZoomableImage({id: 'Mark_BP'}) }M
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

function injectZoomableImage({id}) {
  // AI: validate arg
  return `
?? Custom Tag: my-plugin:injectZoomableImage({id: '${id}'})

<!-- Custom Tag: my-plugin:injectZoomableImage({id: '${id}'}) -->
<center>
  <figure>
    <div id="${id}"></div>
    <figcaption>Hover to zoom, Click to open in new tab</figcaption>
  </figure>
</center>
<script>
  fw.addZoomableImage('${id}', '${id}.png', 75);
</script>
`;
}
