# gitbook-plugin-my-plugin

## At a Glance

- [Overview]
- [Features]
- [Activation]
- [Local Plugin]
- [GitBook Docs]

## Overview

This a "local" [GitBook] plugin that caters to the needs of this
specific project.

## Features

This plugin is **very specific** to the needs of this project.

It does the following:

1. It surrounds ALL pages with the necessary JavaScript constructs needed for our blog:

   **At the START:**
   ... _inject fw.js script in every page_
   ```
   <script src="fw.js"></script>
   ```

   **At the END:**
   ... _auto run pageSetup() at end (when page is rendered)_
   ```
   <script> fw.pageSetup(); </script>
   ```

   This documentation blog utilizes JavaScript _(found in `fw.js`)_
   that provides utilities in support of various dynamic reactivities.
   This is a bit tricky in the MarkDown world _(the source types of
   GitBook)_.  Without this plugin automation, these scripts had to be
   duplicated **BY HAND** on EACH page.

2. It conditionally adds a "Book Completed" check-box control on ALL
   pages that represent a book of the Bible.

   This is the same control that is accumulated in
   OldTestament/NewTestament pages.

   **Example**
   ```
   <div style="text-align: right">
     <label>
       <input type="checkbox" onclick="fw.handleCompletedCheckChange(this);" id="Mark">
         Book Completed
     </label>
   </div>
   ```

3. It implements Custom Tags that can be used in the markdown of a
   page, and greatly simplifies complex directives.

   The following **Custom Tags** are available:

   - **zoomableImg(id)**

     Inject the html to render a "large" image that is "zoomable",
     wiring up the needed JavaScript hooks that implements this.

     **Parms**:

     * id - The base name of the .png img file ... {id}.png

     **Custom Tag**

     ```
     M{ zoomableImg('Mark_BP') }M
     ```

   - **youTube(id)**

     Inject the html to render an in-line YouTube video.

     **Parms**:

     * id - The YouTube video id to display.

     **Custom Tag**

     ```
     M{ youTube('ZBLKrNVffgo') }M
     ```

   - **completedCheckBox({id, label})**

     Inject the html to render a labeled input checkbox, specific to the
     completed status of the blog.

     **Named Parms**:

     * id    - the blog's completed status id
     * label - the blog's completed status label (optional)

     **Custom Tag**

     ```
     M{ completedCheckBox({id: 'Mark', label: 'Book Completed'}) }M ... for book completed
     M{ completedCheckBox({id: 'Mark'}) }M                          ... label is optional
     M{ completedCheckBox({id: '20100425', label: '1.'}) }M         ... for sermon series completed (in table)
     ```


## Activation

Like all GitBook plugins, this plugin is activated through the
following entry of the documentation's `book.json` file:

**book.json**
```
{
  "plugins": [
    "my-plugin",
    ... snip snip
  ],
}
```

## Local Plugin

This plugin is **very specific** to the needs of this project.  As a
result, it is a "local" plugin, in the sense that the plugin's npm
dependency comes from this local directory, and not from the NPM
registry.  The advantage of this approach is that we can change the
plugin directly in our project, and see the results immediately.

This is accomplished through a symbolic link that is manually
maintained in our `node_modules/` directory.
In windows, using the following DOS command:

```
$ cd c:/dev/MyWeb/FireWithin/node_modules

# make the hard link by referencing the master source (THIS IS A DOS command)
$ mklink /J gitbook-plugin-my-plugin ..\gitbook-plugin-my-plugin
```

**NOTE**: As long as our dependency is maintained in the
`node_modules/` directory, there is no need to run the `$ npx gitbook
install` command.  As long as our npm package is resolved, we are GOOD
_(however that is accomplished)_:

- `$ npx gitbook install my-plugin`
- `$ npm install --save-dev gitbook-plugin-my-plugin`
- resolve local package, either through:
  * package.json: "gitbook-plugin-my-plugin": "file:FireWithin/gitbook-plugin-my-plugin"
  * a symbolic link in the `node_modules/` directory

We chose this symbolic link technique, because all of our other
gitbook plugin dependencies are held in documentation's `node_modules/`
directory, using the `$ npx gitbook install` command.  **NOTE:** Our
project `package.json` file is in the parent directory _(from our
docs)_, and has it's own `node_modules/` directory.

An alternate approach to resolving this gitbook plugin, would be to
use a file-based "devDependencies" entry in our parent's
`package.json`.  I have no experience doing this and have NOT
attempted it.  It would require some additional research, for example:

- do we still need to run `$npm install`
- and if so, does npm create a symbolic link in `node_modules/`
  directory (NOT SURE)

**package.json**
```
{
  ... snip snip
  "devDependencies": {
    "gitbook-plugin-my-plugin": "file:FireWithin/gitbook-plugin-my-plugin",
    ... snip snip
  }
}
```



## GitBook Docs

- [Docs]
- [Plugins]
- [Plugins Hooks]
- [GitHub]
- [Community]






<!--- REFERENCE LINKS ---> 

[Overview]:       #overview
[Features]:       #features
[Activation]:     #activation
[Local Plugin]:   #local-plugin
[GitBook Docs]:   #gitbook-docs

[GitBook]:        https://docs.gitbook.com/
[Docs]:           https://docs.gitbook.com
[Plugins]:        https://snowdreams1006.github.io/gitbook-official/en/plugins/
[Plugins Hooks]:  https://snowdreams1006.github.io/gitbook-official/en/plugins/hooks.html
[GitHub]:         https://github.com/GitbookIO/gitbook
[Community]:      https://github.com/GitbookIO/community

