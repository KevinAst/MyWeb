# gitbook-plugin-my-plugin

## At a Glance

- [Overview]
- [Features]
- [Custom Tags]
  - [zoomableImg()]
  - [youTube()]
  - [completedCheckBox()]
  - [sermonLink()]
  - [studyGuideLink()]
  - [bibleLink()]
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
   page, and greatly simplifies complex directives _(see next section)_.

## Custom Tags

This plugin promotes a set of Custom Tags that can be used in the
markdown of a page, and greatly simplifies complex directives.

**A NOTE on Multi Line:**

All our Custom Tags support spanning multiple lines.  This is
necessary in the case where the argument is large _(a complex array of
directives)_, but it can also occur when you format the paragraphs of
your MarkDown.

As a result, it is possible for a string literal to span multiple
lines.  Say, for example, that you formatted a MarkDown paragraph that
contains a Custom Tag ... the following could occur:

This tag:

```
M{ bibleLink(`'JHN.5.29@@John 5:29') }M
```

Could be reformatted as follows _(in the context of other text around it)_:

```
M{ bibleLink('JHN.5.29@@John
5:29') }M
```

The problem here is the string literal is invalid, because single-tick
strings cannot span multiple lines, and will generate an argument
error :-)

**<mark>Recomendation:</mark>**

> In order to allow string literals to span multiple lines, you should
> always use template literal expressions for all your string-based
> arguments (e.g back-tics: \` **NOT** single-tics: \'). This fixes
> the issue, because template literals can span multiple lines.  As a
> result, the following macro is valid:
> 
> ```
> M{ bibleLink(`JHN.5.29@@John
> 5:29`) }M
> ```

The following **Custom Tags** are available:

- [zoomableImg()]
- [youTube()]
- [completedCheckBox()]
- [sermonLink()]
- [studyGuideLink()]
- [bibleLink()]


### zoomableImg()

**API**: `zoomableImg(id)`

Inject the html to render a "large" image that is "zoomable",
wiring up the needed JavaScript hooks that implements this.

**Parms**:

* id - The base name of the .png img file ... {id}.png

**Custom Tag**

```
M{ zoomableImg(`Mark_BP`) }M
```



### youTube()

**API**: `youTube(id)`

Inject the html to render an in-line YouTube video.

**Parms**:

* id - The YouTube video id to display.

**Custom Tag**

```
M{ youTube(`ZBLKrNVffgo`) }M
```



### completedCheckBox()

**API**: `completedCheckBox(id)`

Inject the html to render a labeled input checkbox, specific to the
completed status of the blog.

**Parms**:

* id - the blog's completed status id, with an optional label (delimited with @@)
  ```
  EX: - 'Mark' ........... 'Mark' id with no label
      - '20100425@@1.' ... '20100425' id with '1.' label
  ```

**Custom Tag**

```
M{ completedCheckBox(`Mark@@Book Completed`) }M ... for book completed
M{ completedCheckBox(`Mark`) }M                 ... label is optional
M{ completedCheckBox(`20100425@@1.`) }M         ... for sermon series completed (in table)
```



### sermonLink()

**API**: `sermonLink(ref)`

Inject an html link (via the `<a>` tag) for a specific sermon.

**Parms**:

* ref: The sermon reference, with an optional title (delimited with @@).

  By default, the ref will generate a Cornerstone sermon link,
  UNLESS it begins with an 'http' - which is assumed to be a complete self-contained URL link.

  If NO title is specified, it will default to 'Teaching'.

  ```
  EXAMPLE:
    - '20210418@@Pray Like Jesus' ... A Cornerstone sermon, ref: '20210418', title: 'Pray Like Jesus'
    - '20131113' ... A Cornerstone sermon, ref: '20131113', with NO title (defaulted to: 'Teaching')
    - 'https://www.youtube.com/watch?v=otrqzITuSqE@@Oxford Mathematician Destroys Atheism'
      ... a self-contained URL link
  ```

**Custom Tag**

```
M{ sermonLink(`20210418@@Pray Like Jesus`) }M
```



### studyGuideLink()

**API**: `studyGuideLink(ref)`

Inject an html link (via the `<a>` tag) for the Study Guide of a specific sermon.

**Parms**:

* ref: The sermon reference, for this Study Guide.

**Custom Tag**

```
M{ studyGuideLink(`20210418`) }M
```



### bibleLink()

**API**: `bibleLink(ref)`

Inject a Bible html link (via the `<a>` tag) for a specific verse.

NOTE: This link dynamically adjusts to the User Preferences regarding
the desired Bible Translation.

**Parms**:

* ref: The Bible verse, consisting of BOTH the ref (per the YouVersion API)
       and title (delimited with @@).

  ```
  EXAMPLE:
    - 'rev.21.6-8@@Revelation 21:6-8'
  ```

**Custom Tag**

```
M{ bibleLink(`rev.21.6-8@@Revelation 21:6-8`) }M
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
[Custom Tags]:            #custom-tags
  [zoomableImg()]:        #zoomableimg
  [youTube()]:            #youtube
  [completedCheckBox()]:  #completedcheckbox
  [sermonLink()]:         #sermonlink
  [studyGuideLink()]:     #studyguidelink
  [bibleLink()]:          #biblelink
[Activation]:     #activation
[Local Plugin]:   #local-plugin
[GitBook Docs]:   #gitbook-docs

[GitBook]:        https://docs.gitbook.com/
[Docs]:           https://docs.gitbook.com
[Plugins]:        https://snowdreams1006.github.io/gitbook-official/en/plugins/
[Plugins Hooks]:  https://snowdreams1006.github.io/gitbook-official/en/plugins/hooks.html
[GitHub]:         https://github.com/GitbookIO/gitbook
[Community]:      https://github.com/GitbookIO/community

