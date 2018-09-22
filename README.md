# MyWeb

## At a Glance

- [Overview]
- [Internal Notes]
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


## Publish Web Content

To publish the content, simply:

```shell
$ npm run publish:web
```

**Notes:**
- This can be run **anytime** _(for patches)_ from **any branch** _(although typically master)_.
- For significant changes:
  - update change history _(below)_
  - PR to master branch
  - tag the release _(ex: **v1.1.0**)_


## Revision History

Release  | What                                            | *When*
---------|-------------------------------------------------|------------------
[v1.2.0] | L8TR                                            | *October xx, 2018*
[v1.1.0] | Misc Changes                                    | *September 20, 2018*
[v1.0.0] | Initial Release                                 | *September 13, 2018*


<!-- *** RELEASE *************************************************************** -->

### v1.2.0 - L8TR *(October xx, 2018)*

<ul><ul><!--- indentation hack for github - other attempts with style is stripped (be careful with number bullets) ---> 

[GitHub Content](https://github.com/KevinAst/MyWeb/tree/v1.2.0)
&bull;
[GitHub Release](https://github.com/KevinAst/MyWeb/releases/tag/v1.2.0)
&bull;
[Diff](https://github.com/KevinAst/MyWeb/compare/v1.1.0...v1.2.0)

- Added reference to 3rd article: feature-u Concepts (V1)

- ?? more

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
[Overview]:            #overview
[Internal Notes]:      #internal-notes
[Publish Web Content]: #publish-web-content
[Revision History]:    #revision-history
 [v1.2.0]:             #v120---l8tr-october-xx-2018
 [v1.1.0]:             #v110---misc-changes-september-20-2018
 [v1.0.0]:             #v100---initial-release-september-13-2018

[Bootstrap Templates]:   https://startbootstrap.com/template-categories/all/
[grayscale]:             https://startbootstrap.com/template-overviews/grayscale/ 
[resume]:                https://startbootstrap.com/template-overviews/resume/
[creative]:              https://startbootstrap.com/template-overviews/creative/
[agency]:                https://startbootstrap.com/template-overviews/agency/
