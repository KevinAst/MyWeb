# MyWeb

## At a Glance

- [Overview]
- [Internal Notes]
- [Author Fire Within Blog]
- [Publish Web Content]
- [Revision History]

## Overview

This project contains the master source for my personal web page, used
to promote my open source projects.

## Internal Notes

The baseline style of this page was taken from [Bootstrap Templates]
... specifically [grayscale].  Other themes considered were [resume],
[creative], and [agency] (the latter from which the timeline was
gleaned ... see timeline entries in `MyPage/css/myStyle.css`).


The project file structure holds all web-page content in the `MyPage/`
directory.  This directory is published to gh-pages
(https://kevinast.github.io/MyWeb/), from which my various domains are
forwarded.

The [grayscale] run-time assets were pruned to include only needed
run-time references.  These assets can be found in the following
directories.

**run-time assets ... NOT project specific**:
```
MyPage/
  css/     ... also includes project resource: mystyle.css
  js/
  vendor/
    bootstrap/
    fontawesome-free/
    jquery/
    jquery-easing/
```

**Note**: an attempt was made to consolidate these items in an
`assets\` directory, but nixed due to some internal references
requiring this directory structure. **All other files are project
specific web page content!**


## Author Fire Within Blog

The "Fire Within" blog is compiled using [GitBook].  The master source
is found in `MyWeb/FireWithin/`.

To run the dev process (that will re-compile on any change):

```shell
$ cd MyWeb
$ npm run blog:dev
```

And run your web-server, pointing to: `MyWeb/MyPage/`.


## Publish Web Content

To publish the content, simply:

```shell
$ cd MyWeb
$ npm run publish:web
```

TEST: https://wiibridges.com/

**Notes:**
- This can be run **anytime** _(for patches)_ from **any branch** _(although typically master)_.
- For `Fire Within` blog changes:
  - update FireWithin version _(found in `MyWeb/FireWithin/toc.md`)_
  - update FireWithin history _(found in `MyWeb/FireWithin/history.md`)_
  - check into branch
  - PR to master
- For significant changes:
  - update web version _(found in `package.json`)_
  - update change history _(below)_
  - check into branch
  - PR to master
  - tag the release _(ex: **v1.1.0**)_


## Revision History

Release  | What                                            | *When*
---------|-------------------------------------------------|------------------
[v2.0.0] | Added Fire Within Blog                          | *March 22, 2022*
[v1.2.0] | eatery-nod-w                                    | *June 7, 2019*
[v1.1.0] | Misc Changes                                    | *September 20, 2018*
[v1.0.0] | Initial Release                                 | *September 13, 2018*


### v2.0.0 - Added Fire Within Blog *(March 22, 2022)*

<ul><ul><!--- indentation hack for github - other attempts with style is stripped (be careful with number bullets) ---> 

[GitHub Content](https://github.com/KevinAst/MyWeb/tree/v2.0.0)
&bull;
[GitHub Release](https://github.com/KevinAst/MyWeb/releases/tag/v2.0.0)
&bull;
[Diff](https://github.com/KevinAst/MyWeb/compare/v1.2.0...v2.0.0)

- added "Fire Within" blog

</ul></ul>



<!-- *** RELEASE *************************************************************** -->

### v1.2.0 - eatery-nod-w *(June 7, 2019)*

<ul><ul><!--- indentation hack for github - other attempts with style is stripped (be careful with number bullets) ---> 

[GitHub Content](https://github.com/KevinAst/MyWeb/tree/v1.2.0)
&bull;
[GitHub Release](https://github.com/KevinAst/MyWeb/releases/tag/v1.2.0)
&bull;
[Diff](https://github.com/KevinAst/MyWeb/compare/v1.1.0...v1.2.0)

- added reference to new github app: **eatery-nod-w**
- feature-u presentation mods:
  - updated feature-u presentation syllabus
  - reference **feature-u Teaser** article
  - reference **feature-u Concepts (V1)** article
  - sample app is now **eatery-nod-w** _(a PWA)_
  - synced latest feature-u PDF slides
- feature-u articles now reference **medium** NOT **rogue freecodecamp**

</ul></ul>


<!-- *** RELEASE *************************************************************** -->

### v1.1.0 - Misc Changes *(September 20, 2018)*

<ul><ul><!--- indentation hack for github - other attempts with style is stripped (be careful with number bullets) ---> 

[GitHub Content](https://github.com/KevinAst/MyWeb/tree/v1.1.0)
&bull;
[GitHub Release](https://github.com/KevinAst/MyWeb/releases/tag/v1.1.0)
&bull;
[Diff](https://github.com/KevinAst/MyWeb/compare/v1.0.0...v1.1.0)

- Sanitized internal URL references, removing html where possible
  _(using index.html within directories)_

- Reword retired section

- feature-u presentation
  - added slides
  - minor format changes

- Streamlined address by removing Missouri from St. Louis reference

- Added favicon

- Use `inquire@wiiBridges.com` as email contact

</ul></ul>




<!-- *** RELEASE *************************************************************** -->

### v1.0.0 - Initial Release *(September 13, 2018)*

<ul><ul><!--- indentation hack for github - other attempts with style is stripped (be careful with number bullets) ---> 

[GitHub Content](https://github.com/KevinAst/MyWeb/tree/v1.0.0)
&bull;
[GitHub Release](https://github.com/KevinAst/MyWeb/releases/tag/v1.0.0)
<!-- Diff ONLY for subsequent releases
&bull;
[Diff](https://github.com/KevinAst/MyWeb/compare/v1.0.0...v1.0.1)
-->

**This is where it all began ...**

</ul></ul>

<!--- *** REFERENCE LINKS *** ---> 
[Overview]:                 #overview
[Internal Notes]:           #internal-notes
[Author Fire Within Blog]:  #author-fire-within-blog
[Publish Web Content]:      #publish-web-content


[Revision History]:    #revision-history
 [v2.0.0]:             #v200---added-fire-within-blog-march-22-2022
 [v1.2.0]:             #v120---eatery-nod-w-june-7-2019
 [v1.1.0]:             #v110---misc-changes-september-20-2018
 [v1.0.0]:             #v100---initial-release-september-13-2018

[Bootstrap Templates]:   https://startbootstrap.com/template-categories/all/
[grayscale]:             https://startbootstrap.com/template-overviews/grayscale/ 
[resume]:                https://startbootstrap.com/template-overviews/resume/
[creative]:              https://startbootstrap.com/template-overviews/creative/
[agency]:                https://startbootstrap.com/template-overviews/agency/
[GitBook]:               https://docs.gitbook.com/
