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
  - [sermonSeries()]
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
   <script type="module" src="./js/fw.js"></script>
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
- [sermonSeries()]


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

  When the sermon reference is 'TXT', the cooresponding title is emitted as a text item only (i.e. NO link).

  If NO title is specified, it will default to 'Teaching'.

  ```
  EXAMPLE:
    - '20210418@@Pray Like Jesus' ... A Cornerstone sermon, ref: '20210418', title: 'Pray Like Jesus'
    - '20131113' ... A Cornerstone sermon, ref: '20131113', with NO title (defaulted to: 'Teaching')
    - 'TXT@@Sacrificed' ... a text item only (i.e. NO link)
    - 'https://www.youtube.com/watch?v=otrqzITuSqE@@Oxford Mathematician Destroys Atheism'
      ... a self-contained URL link
          NOTE: This can be used for any generic URL/Label (not really sermon specific)
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

  ALSO, this can be used to inject a completely different link (say a devotion)
  using the following format: `url@@label`

  ```
  EXAMPLE: 
    - `https://bible.com/reading-plans/snip.snip@@Devotion (Bible App)`
  ```

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

       Multiple Entries are supported (delimited with ##).
 
       Line breaks can be optionally requested (between entries), by starting the entry with 'CR:'

  ```
  EXAMPLE:
    - 'rev.21.6-8@@Rev 21:6-8'                        <<< single entry
    - 'rev.21.6-8@@Rev 21:6-8##rev.22.3@@Rev 22:3'    <<< multiple entries
    - 'rev.21.6-8@@Rev 21:6-8##rev.22.3@@CR:Rev 22:3' <<< multiple entries, with line breaks (cr/lf)
  ```

**Custom Tag**

```
M{ bibleLink(`rev.21.6-8@@Rev 21:6-8`) }M
```



### sermonSeries()

**API**: `sermonSeries(namedParams)`

A comprehensive and responsive table generator that details the full
content of an entire sermon series.

**Parms**:

* namedParams: a comprehensive structure that describes the complete sermon series.

  ```js
  {
    settings: { // settings impacting entire series (OPTIONAL)
      includeStudyGuide: boolean, // directive include/omit StudyGuide column (DEFAULT: true)
    },
    entries: [ // series entries (in order of display)
      { // individual entry
        id:        string,   // entry id (REQUIRED)
                             // - used to persist completion status
                             // - `20210418`: A CornerStone standard entry (`YYYYMMDD`)
                             //               specifies:
                             //               * both sermon and studyGuide ref
                             //               * date
                             // - `anything`: For NON-CornerStone entries
                             //               - anything you wish
                             //               - be careful NOT to conflict with a potential CornerStone entry
                             //                 EX: `B20210418` prefix a letter before the encoded date

        sermon:     string,  // sermon title (OPTIONAL - DEFAULT: `Teaching`)
                             // - OMITTED: defaults to `Teaching` (using id for sermon ref)
                             // - `Pray Like Jesus`: sermon title (using id for sermon ref)
                             // - `20210418@@Pray Like Jesus`: sermon ref and title (when ref varies from id - a CornerStone mismatch/bug)
                             // - `TXT@@A Title`: a text item only (i.e. NO link).
                             // - `https://www.youtube.com/...@@A Title`: a NON-CornerStone sermon
                             // - `NONE`: NO Sermon for this entry (unusual, but can happen)

        extraSermonLink:     // additional url link in the sermon cell (OPTIONAL)
                    string,  // - `https://www.youtube.com/...@@Label`: another URL link
                             // - OMITTED: nothing

        desc:       string,  // description (OPTIONAL - DEFAULT: ``)
                             // - by default, starts out hidden.
                             // - developer must supply user with toggle to show/hide
                             //   ... EX: <button data-fw-desc-toggle onclick="fw.toggleDesc()">Show Descriptions</button>
                             //   ... see: fw.js - fw.toggleDesc()

        scripture:  string,  // per bibleLink() API (OPTIONAL)
                             // - `mrk.1@@Mark 1`                   <<< single entry
                             // - `mrk.1@@Mark 1##mrk.2@@Mark 2`    <<< multiple entries
                             // - `mrk.1@@Mark 1##mrk.2@@CR:Mark 2` <<< multiple entries, with line breaks (cr/lf)
                             // - OMITTED: No Scripture for this entry

        extraLinkInScriptureCell:  // additional url link in the scripture cell (OPTIONAL)
                    string,  // - `https://www.youtube.com/...@@Label`: another URL link
                             // - OMITTED: nothing

        studyGuide: string,  // study guide ref (when ref varies from id - a CornerStone mismatch/bug) (OPTIONAL - DEFAULT: use entry id)
                             // - OMITTED: use entry id (per CornerStone standard)
                             // - `NONE`: NO Study Guide for this entry
                             // - `https://bible.com/reading-plans/snip.snip@@Devotion (Bible App)`: a devotion (not a standard Study Guide)
                             // NOTE: when settings.includeStudyGuide: false ... this directive is completely ignored

        date:       string,  // `MM/DD/YYYY` (OPTIONAL - DEFAULT: derivation of entry id)
                             // - `04/18/2021` - when entry id is either NOT accurate, or is in a NON-CornerStone format
      },
      ... repeat
    ]
  }
  ```js


**sermonSeries() Custom Tag Examples**
---

**Standard CornerStone Series with Study Guide**
```js
// see: New testament / Mark / 2021 Mark Series (Sundays)
M{ sermonSeries({
  entries: [
    { id: `20210418`,  sermon: `Pray Like Jesus`,                       scripture:`mrk.1@@Mark 1`         },
    { id: `20210425`,  sermon: `Patches and Wineskins`,                 scripture:`mrk.2@@Mark 2:18-22`   },
    { id: `20210502`,  sermon: `What Hinders Fruitfulness?`,            scripture:`mrk.4@@Mark 4`         },
    { id: `20210516`,  sermon: `Losing Your Head over a Grudge`,        scripture:`mrk.6@@Mark 6`         },
    { id: `20210523`,  sermon: `Mountains or Valleys, Jesus is There`,  scripture:`mrk.9@@Mark 9`         },
    { id: `20210530`,  sermon: `Opposition to Jesus and His Church`,    scripture:`mrk.12@@Mark 12`       },
    { id: `20210613`,  sermon: `What's the Cost?`,                      scripture:`mrk.12@@Mark 12:41-44` },
    { id: `20210620`,  sermon: `When God Tore a Curtain`,               scripture:`mrk.15@@Mark 15`       },
  ]
}) }M
```

**Standard CornerStone Series with NO Study Guide**
```js
// see: New testament / Mark / 2013-2014 Mark Series (Mid Week)
M{ sermonSeries({
  settings: {
  includeStudyGuide: false,
  },
  entries: [
    { id: `20131113`, scripture: `mrk.1@@Mark 1`,            },
    { id: `20131120`, scripture: `mrk.2@@Mark 2`,            },
    { id: `20131204`, scripture: `mrk.3@@Mark 3`,            },
    { id: `20131211`, scripture: `mrk.4@@Mark 4-5:20`,       },
    { id: `20131218`, scripture: `mrk.5@@Mark 5:21-6:13`,    },
    { id: `20140108`, scripture: `mrk.6@@Mark 6:13-7:23`,    },
    { id: `20140115`, scripture: `mrk.7@@Mark 7:23-8:38`,    },
    { id: `20140205`, scripture: `mrk.9@@Mark 9`,            },
    { id: `20140212`, scripture: `mrk.9@@Mark 9:33-50`,      },
    { id: `20140219`, scripture: `mrk.10@@Mark 10`,          },
    { id: `20140305`, scripture: `mrk.11@@Mark 11-12:17`,    },
    { id: `20140312`, scripture: `mrk.12@@Mark 12:18-13:37`, },
    { id: `20140319`, scripture: `mrk.14@@Mark 14:1-26`,     },
    { id: `20140326`, scripture: `mrk.14@@Mark 14:12-52`,    },
    { id: `20140402`, scripture: `mrk.14@@Mark 14:53-15:15`, },
    { id: `20140409`, scripture: `mrk.15@@Mark 15:16-16:20`, },
  ]
}) }M
```

**Standard CornerStone Series with selected Study Guide**
```js
// see: Specials / Current Events / lection Day Sermons
M{ sermonSeries({
  entries: [
    { id: `20121104`, sermon: `Election Day Sermon`,                                                                   studyGuide: `NONE`, },
    { id: `20140622`, sermon: `Making of a King, Journey of a Christian`,        scripture: `1sa.8@@1 Samuel 8-11`,                        },
    { id: `20161016`, sermon: `Election Day Sermon`,                             scripture: `psa.33@@Psalm 33`,        studyGuide: `NONE`, },
    { id: `20201018`, sermon: `Church in America, Wake Up!`,                     scripture: `jer.6@@Jeremiah 6:16-19`, studyGuide: `NONE`, },
    { id: `20201028`, sermon: `Night of Prayer for the Elections`,                                                     studyGuide: `NONE`, },
    { id: `20201101`, sermon: `Calm in the Storm: An Election Day Addendum`,     scripture: `mat.8@@Matthew 8:23-27`,                      },
    { id: `20201108`, sermon: `Sent Out Among Wolves: A Post-Election Reminder`, scripture: `mat.10@@Matthew 10`,                          },
  ]
}) }M
```

**Specialized Series with various options**
```js
// see: Specials / Current Events / LGBTQ
M{ sermonSeries({
  entries: [
    { id: `20120205`, sermon: `The Cost of Compromise`,                           scripture:`gen.18@@Genesis 18-19`, },
    { id: `20150705`, sermon: `America, Will You Stand?`,                         studyGuide: `NONE`, },
    { id: `20220727`, sermon: `Evening Special with Patti Height`,                studyGuide: `NONE`, extraLinkInScriptureCell: `https://outofegyptministries.org/@@Out of Egypt Ministries`, },
    { id: `20230604`, sermon: `A Biblical Response to the 'Transing' of America`, scripture:`rom.1@@Romans 1:18-28`, },
  ]
}) }M

// see: Specials / Current Events / Moral Decay
M{ sermonSeries({
  settings: {
    includeStudyGuide: false,
  },
  entries: [
    { id: `20121108`, sermon: `https://www.youtube.com/watch?v=otrqzITuSqE@@Oxford Mathematician Destroys Atheism`, extraLinkInScriptureCell: `https://www.johnlennox.org/@@John Lennox`, },
    { id: `20230521`, sermon: `Wanted: The Brave`,                                                                  extraLinkInScriptureCell: `https://www.kirkcameron.com/@@Kirk Cameron`, },
  ]
}) }M
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
  [sermonSeries()]:       #sermonseries
[Activation]:     #activation
[Local Plugin]:   #local-plugin
[GitBook Docs]:   #gitbook-docs

[GitBook]:        https://docs.gitbook.com/
[Docs]:           https://docs.gitbook.com
[Plugins]:        https://snowdreams1006.github.io/gitbook-official/en/plugins/
[Plugins Hooks]:  https://snowdreams1006.github.io/gitbook-official/en/plugins/hooks.html
[GitHub]:         https://github.com/GitbookIO/gitbook
[Community]:      https://github.com/GitbookIO/community

