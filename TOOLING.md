# Tooling

This document contains resources to help you in both the tooling and
development of the **MyWeb** project.

AI: This doc was started at the start of the "Fire Within" generation
process (refered to as blog in this document).  It may need to be
updated to pick up some of the beginnings (see:
c:/data/tech/dev/project/MyWeb/projectSetup.txt).

# At a Glance

- [NPM Scripts]
- [Dependencies]
- [Project Resources]
- [Project Setup]
  - [Setup GitHub Project]
  - [Initialize NPM Project]
  - [Setup Blog Tooling]
  - [Setup wiiBridges.com domain]
- [Publish to Web]
- [Setup New Feature Branch]


<!--- *** SECTION *************************************************************** --->
# NPM Scripts

This section provides a summary of the available **NPM Scripts**
_(organized by task)_:


```

BLOG
====
blog:dev     ... re-gen the blog whenever the master doc source changes

blog:build   ... manually build the blog (into the MyPage/FireWithin/ dir)
                 - NOTE: this build is executed as the first step in publish:web
                 - FOR BLOG DEVELOPMENT:
                   1. start an internal web server pointing to MyPage/FireWithin/ dir
                   2. manually re-execute blog:build whenever blog/ change
                 - this is MUCH PREFERRED over the gitbook server (which is sorely broken)

blog:clean   ... clean machine-generated MyPage/FireWithin/ directory

PUBLISH
=======
publish:web .... publish the latest webpage TO: https://wiiBridges.com/
                 NOTE: this script FIRST builds the FireWithin blog from scratch
                       ... via prepublish:web
```


<!--- *** SECTION *************************************************************** --->
# Dependencies

This section provides some insight regarding the various dependencies
found in **MyWeb**.

The dependency list can become quite large for a mature project.  In
looking at `package.json`, the inevitable questions are:

- What is this dependency

- Why is it needed

- Is it a dependency for project tooling or application code?

The following table itemizes the **MyWeb** dependencies,
referencing when/where they were introduced/configured.

Dependency                        | Type        | Usage                          | Refer To
--------------------------------- | ----------- | ------------------------------ | ----------------
`gh-pages`                        | **TOOLING** | Blog Deployment                | [Setup Blog Tooling]
`gitbook-cli`                     | **TOOLING** | Blog Generation                | [Setup Blog Tooling]
`rimraf`                          | **TOOLING** | Various NPM Clean Scripts      | [Setup Blog Tooling]


<!--- *** SECTION *************************************************************** --->
# Project Resources

Wondering what some of the top-level file resources are?  Here is a
summary:

```
MyWeb/
  .git/ ................ our local git repo
  .gitignore ........... git repo exclusions (typically machine generated)
  FireWithin/ .......... master source of GitBook FireWithin blog  see: "Setup Blog Tooling"
    book.json .......... GitBook configuration see: "Setup Blog Tooling"
    *.md ............... various Markdown files making up our blog
  LICENSE.md ........... our MIT License
  MyPage/ .............. the web page master (html, css, js, etc.)
    snip snip .......... mucho files!
    FireWithin/ ........ machine generated FireWithin blog (output of GitBook) see: "Setup Blog Tooling" (.gitignored)
  node_modules/ ........ install location of dependent packages (maintained by npm)
  package.json ......... project meta data with dependencies
  package-lock.json .... exhaustive dependency list with installed "locked" versions (maintained by npm)
  README.md ............ basic project docs
  TOOLING.md ........... this document :-)
```


<!--- *** SECTION *************************************************************** --->
# Project Setup

This section chronicles the original setup of the **MyWeb**
project.

If you are forking this project, this detail is _unnecessary_, because
you simply `npm install` and then commence your development.

With that said, this section provides valuable insight on how the
project was originally setup and configured, and can be used in other
projects _(where you are starting from scratch)_!

**NOTE**: These sections roughly represent the chronology of when they
were carried out, however in some cases the order can be changed.

**Sub Sections**:
  - [Setup GitHub Project]
  - [Initialize NPM Project]
  - [Setup Blog Tooling]
  - [Setup wiiBridges.com domain]


<!--- *** SUB-SECTION *************************************************************** --->
# Setup GitHub Project

There are many ways of initiating a new GitHub project. I'll leave the
details to you :-)

At the end of this process you should have:

- A new GitHub project
- A local git repository (for your development)
- Impacted Files:
  ```
    MyWeb/
      .git/ ................ our local git repo
      .gitignore ........... git repo exclusions (typically machine generated)
      LICENSE.md............ MIT License
      README.md ............ basic project docs



<!--- *** SUB-SECTION *************************************************************** --->
# Initialize NPM Project

This task will initialize the project as an NPM project.

At the end of this process you should have:

- **MyWeb** initialized as an NPM project.

- Impacted Files:
  ```
  MyWeb/
    .gitignore ........... modified as needed
    node_modules/ ........ install location of dependent packages (maintained by npm)
    package.json ......... project meta data with dependencies
    package-lock.json .... exhaustive dependency list with installed "locked" versions (maintained by npm)
  ```

**Summary**:

1. Create `package.json` file at project root, with following the
   characteristics:

   ```js
   {
     "name": "MyWeb",
     "version": "1.2.0",
     "description": "My Web Page",
     "homepage": "https://wiibridges.com/",
     "scripts": {
       "L8TR": "L8TR"
     },
     "repository": {
       "type": "git",
       "url": "https://github.com/KevinAst/MyWeb.git"
     },
     "keywords": [
       "web page",
       "geeku",
       "astx"
     ],
     "author": "Kevin J. Bridges <kevinast@gmail.com> (https://github.com/KevinAst)",
     "license": "MIT"
   }
   ```

2. Initialize Node/NPM:

   ```
   $ cd c:/dev/MyWeb
   $ npm install
   ```

3. Update `.gitignore` with following:

   ```
   # node dependencies (defined via "npm install")
   /node_modules/

   # not really interested in package-lock.json in repo
   /package-lock.json

   ... snip snip
   ```

_My personal Detailed Notes are "hidden" (in comment form) in this doc ..._

<!--- Comment out KJB Notes
**Details**:
```
In addition to above:

- configure VSCode
  * setup VSCode workspace file (and edit):
    c:/dev/MyWeb.code-workspace 
  * launch this workspace
  * N/A: ONE TIME: NOW load the VSCode "svelte" extension
```
KJB Notes --->


<!--- *** SUB-SECTION *************************************************************** --->
# Setup Blog Tooling

**MyWeb** promotes it's FireWithin blog using [GitBook], which is a
[Markdown] based solution.  This configuration setup is patterned
after the following article _(minus the JSDoc)_: [Integrating GitBook
with JSDoc to Document Your Open Source Project].

Here is a 2019 reference that got me going with moving output out of `_book/`:
[GitBook related configuration and optimization](https://developpaper.com/gitbook-related-configuration-and-optimization/)

At the end of this process you should have:

- Blog setup through [Markdown] files.

- Impacted Dependencies:
  ```
  gh-pages
  gitbook-cli
  nodemon
  rimraf
  ```

- Impacted Files:
  ```
  package.json ...... enhance blog dependencies -and- blog scripts

  FireWithin/ ........... master source of GitBook FireWithin blog  see: "Setup Blog Tooling"
    buildDocsInDev.js ... docs build script in dev (executed by nodemon)
    book.json ........... GitBook configuration
    toc.md .............. the summary TOC (seen in the left nav)
    intro.md ............ the Guide Introduction
    *.md ................ various Markdown files making up our blog
    sectionN/ ........... optional blog dirs (as required)
      *.md
    styles/
      website.css ... gitbook style overrides

  MyPage/ .............. the web page master (html, css, js, etc.)
    snip snip .......... other web-page resources (NOT blog related)!
    FireWithin/ ........ machine generated FireWithin blog (output of GitBook) see: "Setup Blog Tooling" (.gitignored)
      *.html
      *.js
      *.css
  ```

**Installation Details**:

1. Install the [GitBook command-line interface]

   ```
   $ npm install --save-dev gitbook-cli
     + gitbook-cli@2.3.2
       added 19 packages, changed 2 packages, and audited 618 packages in 15s
       > HMMM: 19 packages is much different from tw-themes install (a year ago) ... same 2.3.2 version
       added 577 packages from 672 contributors and audited 1234 packages in 32.693s
   ```

   KJB: Yikes: this is the same version installed 4 years ago (in feature-u).

   It has 7K downloads / week, but was last published 5 years ago ... hmmm

2. Define following blog-related project files

   **NOTE**: To find the installed gitbook version (referenced in `book.json` below):
   ```
   $ npx gitbook ls
     GitBook Versions Installed:
     * 3.2.2
       2.5.2
   ```

   ```
   FireWithin/

     book.json (GitBook configuration)
     =========
       {
         "gitbook":     "3.2.2",
         "title":       "FireWithin",
         "description": "Fire Within (Bible Study Resources)",
         "author":      "Kevin J. Bridges <kevin@wiiBridges.com> (https://github.com/KevinAst)",
         "structure": { 
           "readme":  "intro.md",
           "summary": "toc.md" 
         }
       }

     toc.md (defines the left-nav)
     ======
       # Table of content 
       
       ### Fire Within (1.2.0)

       ----
       * [Revelation](revelation.md)

     intro.md (blog introduction)
     ========
       # Fire Within

       Welcome to my "Fire Within" Bible Study Resources!

       XX more here

     revelation.md (we have to start somewhere)
     =============
       # Revelation

       XX more here
   ```

3. Install gh-pages (used in npm scripts below)

   ```
   $ npm install --save-dev gh-pages
     > KJB: left as original install: 1.2.0
     > NEWER (from tw-themes):
     + gh-pages@3.1.0
       added 28 packages from 10 contributors and audited 1262 packages in 10.237s
   ```

4. Install nodemon (used in npm scripts below)

   We use nodemon in development to re-gen the FireWithin docs anytime
   the master doc source changes.

   - Install nodemon:

     ```
     $ npm install --save-dev nodemon
       added 109 packages, and audited 728 packages in 7s
     ```

   - Configure nodemon:

     **package.json**
     ```
     {
       ...
       "nodemonConfig": {
         "watch": [
           "FireWithin/"
         ],
         "ext": "md,js,css,jpg,png"
       },
       ...
     }
     ```

   - Define new docs build script:

     **MyWeb/FireWithin/buildDocsInDev.js**
     ```
     // This script will execute a gitbook command to build our docs in a development env
     //  - we need this because in development we want re-gen the docs anytime the master doc source changes
     //  - we accomplish this through nodemon, which executes a node script NOT a gitbook command
     //  - hence the reason for this script (a node script that simply passes-through to the gitbook command)

     const {exec} = require("child_process");

     const buildScript = 'gitbook build FireWithin MyPage/FireWithin';

     console.log('buildDocsInDev executing: ' + buildScript);

     exec(buildScript, (error, stdout, stderr) => {
       if (error) {
         console.log(`ERROR:\n${error.message}`);
         return;
       }
       if (stderr) {
         console.log(`stderr:\n${stderr}`);
       }
       console.log(`stdout:\n${stdout}`);
     });
     ```

5. Install rimraf (used in npm scripts below)

   ```
   $ npm install --save-dev rimraf
     + rimraf@3.0.2
       added 1 package, changed 1 package, and audited 619 packages in 2s
   ```

6. Define the following **blog-related NPM scripts**:

   **package.json**:
   ```js
   ... snip snip
   "scripts": {
    ...
     "blog:dev": "nodemon FireWithin/buildDocsInDev.js",
     "blog:build": "gitbook build FireWithin MyPage/FireWithin",
     "blog:clean": "rimraf MyPage/FireWithin",
     "blog:gitbook:help": "gitbook help",
     "prepublish:web": "npm run blog:build",
     "publish:web": "gh-pages --dist MyPage"
     ...
   },
   ... snip snip
   ```

7. Add entry in .gitignore:

   **.gitignore**:
   ```
   # our machine generated gitbook output
   /MyPage/FireWithin/

   # our gitbook plugins
   /FireWithin/node_modules/
   ```

8. Prep/Initialize gitbook plugins.  This step is needed whenever you
   add gitbook plugins via `book.json`. As an example the `toolbar`
   plugin (mentioned below).

   ```
   $ cd MyPage/FireWithin ... KJB: I THINK I executed from this dir (don't remember)
   $ npx gitbook install
         info: nothing to install!
               KJB: This command only needs to be run when gitbook plugins
                    are added to book.json
   ```

9. Serve up web page and test our setup

   - must apply a hack to installed lib to get unstable gitbook build working

     ```
     1. Gitbook-cli install error TypeError: cb.apply is not a function inside graceful-fs
        ... https://stackoverflow.com/questions/64211386/gitbook-cli-install-error-typeerror-cb-apply-is-not-a-function-inside-graceful
        * they talk about gitbook-cli working in node v12 and NOT in node v14
        * they install a newer version of graceful-fs@latest IN gitbook-cli
          $ cd /usr/local/lib/node_modules/gitbook-cli/node_modules/npm/node_modules/
          $ npm install graceful-fs@latest --save
     
     2. How I fixed a "cb.apply is not a function" error while using Gitbook
        ... https://flaviocopes.com/cb-apply-not-a-function/
        > a real hack:
        * this guy commented out code in node_modules:
          node_modules/gitbook-cli/node_modules/npm/node_modules/graceful-fs/polyfills.js
     
            >>> PUNT and DO THIS (this is how I got it working):
          - in MY case the problem code is found here:
            c:/dev/MyWeb/node_modules/npm/node_modules/graceful-fs/polyfills.js
            * comment out the lines 62-64:
              // KJB: HACK to fix STALE gitbook-cli (see: TOOLING.md)
              // fs.stat = statFix(fs.stat)
              // fs.fstat = statFix(fs.fstat)
              // fs.lstat = statFix(fs.lstat)
            * IT WORKS!
     ```

   - build our blog

     **One Time Build** _(typically in production)_
     ```
     $ npm run blog:build
     ```

     **Continuous Build** _(in development)_
     ```
     $ npm run blog:dev
     ```

   - just launch our own web server and nix the gitbook server (which is sorely broken).
     * point to: MyPage/FireWithin/
     * OR:       MyPage/ ... once blog is integrated to our overall web page

9. Follow customization suggestions found in [Integrating GitBook with
   JSDoc to Document Your Open Source Project].  

   Specifically:

   - Setup `blog/styles/website.css`
   - Disable livereload via "-livereload" option in "plugins" section of `book.json`
   - Disable social media sharing in toolbar via "-sharing" option in "plugins" section of `book.json`
   - Adding toolbar links to GitHub/NPM via "toolbar" plugin (configured in `book.json`).
     Don't forget to do your `$ npx gitbook install` to install the
     toolbar plugin referenced in `book.json`.

9. Install [`folding-menu`] GitBook plugin that "tames" large left-nav
   menus by visualizing one section at a time.

   - add following to `book.json`:

     **book.json**
     ```js
     {
       ...
       "plugins": [
         ... other plugins you may be using
         "folding-menu"
       ]
       ...
       "pluginsConfig": {
         "folding-menu":	{
           "animationDuration": 500,
           "sticky":            false
         }
       }
     }
     ```

     There appears to be a bug in the folding-menu plugin "sticky" setting,
     where it is NOT informed of a top-level page change when done via a
     link.  As a result I have disabled this option ("sticky": false).

     ALSO this (for toolbar buttons)

     ```
       ...
       "pluginsConfig": {
         "toolbar": {
           "buttons": [
             {
               "label": "Home",
               "icon": "fa fa-home",
               "url": "https://wiibridges.com/",
               "target": "_self"
             }
           ]
         }
       }

     ```

   - install the new plugins

     NOTE: This installs the gitbook plugins in `MyWeb\FireWithin\node_modules\`.
     This works fine.  I tried to move this to my root node_modules, but it doesn't work.
     Simply .gitignore /FireWithin/node_modules/

     ```
     $ cd MyPage/FireWithin ... KJB: I THINK I executed from this dir (don't remember)
     $ npx gitbook install

       info: installing 2 plugins using npm@3.9.2 

       info: installing plugin "toolbar" 
       info: install plugin "toolbar" (*) from NPM with version 0.6.0 
       C:\dev\MyWeb\FireWithin
       `-- gitbook-plugin-toolbar@0.6.0 
       
       info: >> plugin "toolbar" installed with success 

       info: installing plugin "folding-menu" 
       info: install plugin "folding-menu" (*) from NPM with version 1.0.1 
       C:\dev\MyWeb\FireWithin
       +-- gitbook-plugin-folding-menu@1.0.1 
       `-- gitbook-plugin-toolbar@0.6.0 
       
       info: >> plugin "folding-menu" installed with success 
     
     > NOT (OLD):
     $ npm install --save-dev gitbook-plugin-folding-menu
     ```

<!--- *** SUB-SECTION *************************************************************** --->
# Setup wiiBridges.com domain

To accommodate a more professional URL, we point github pages to our
wiiBridges.com domain.

FYI: See details of this at c:/data/tech/isp/domain.GitHubDNS.txt.



<!--- *** SECTION *************************************************************** --->
# Publish to Web

This section chronicles the steps in publishing **MyWeb** to wiiBridges.com.

AI: Most of the following needs to be reviewed and NIXed.  What I typically do:

```
quick publish (from next3 branch)
* PUBLISH WEB ... do in PowerShell
  $ cd C:\dev\MyWeb
  $ npm run publish:web
* test:
  https://wiibridges.com/
```

**Feature Branch**:

Typically all development is done in a **feature branch**.  If you are
about to deploy, presumably your branch is complete and documented.

1. insure all tests are operational

   ```
   $ npm run test
   ```

2. finalize version -and- history notes:

   - for the new version, use [semantic standards](http://semver.org/)

   - update version in:
     * `package.json`
     * `blog/toc.md` (version is referenced at top)
     * `blog/history.md` (within the "running" notes)

   - review/finalize all blog impacted by change
     * also insure README.md does NOT need to change

   - optionally: save a link-neutral version of change history comments (to use in git tagging)
     * pull from history.md _(normalizing any reference links)_
     * ALTERNATE: simply reference the history section (in the git tag)

       EX: https://MyWeb.js.org/history.html#v0_1_0

**main Branch**:

1. issue PR (pull request) and merge to main branch

2. sync main to local machine (where the deployment will occur)

3. verify version is correct in:
   * `package.json`
   * `blog/toc.md`
   * `blog/history.md`

4. now, everything should be checked in to main and ready to publish

5. tag the release (in github)
   * verify the history page github links are correct (now that the tag exists)

6. publish **MyWeb** to npm **_(THIS IS IT!)_**:

   ```
    $ npm publish
      + MyWeb@v.v.v
   ```

   verify publish was successful
   - receive email from npm
   - npm package: https://www.npmjs.com/package/MyWeb
   - unpkg.com:   https://unpkg.com/MyWeb/

7. publish **MyWeb** page:

   ```
   $ npm run blog:publish ... NO NO NO
   ```
  
   verify publish site was successful
   - https://MyWeb.js.org/
     * see new version
     * see correct history

8. optionally test the new package in an external project (by installing it)


<!--- *** SECTION *************************************************************** --->
# Setup New Feature Branch

This section documents the steps to setup a new **feature branch**
(where all development is typically done):

1. create a new branch (typically spawned from the "main" branch).

   **EX**: `next7`

2. devise "best guess" as to the next version number _(may be
   premature, but this can subsequently change)_.

   Reflect this in: 
   * `package.json`
   * `blog/toc.md` (version is referenced at top)
   * `blog/history.md` (within the "running" notes)

3. setup new running Revision History (in `blog/history.md`)

   This provides a place where we can incrementally maintain "running"
   revision notes.




<!--- *** LINKS ***************************************************************** --->

[NPM Scripts]:                    #npm-scripts
[Dependencies]:                   #dependencies
[Project Resources]:              #project-resources
[Project Setup]:                  #project-setup
  [Setup GitHub Project]:         #setup-github-project
  [Initialize NPM Project]:       #initialize-npm-project
  [Setup Blog Tooling]:           #setup-blog-tooling
  [Setup wiiBridges.com domain]:  #setup-wiibridgescom-domain
[Publish to Web]:                 #publish-to-web
[Setup New Feature Branch]:       #setup-new-feature-branch

[GitBook]:                         https://docs.gitbook.com/
[GitBook command-line interface]:  https://www.npmjs.com/package/gitbook-cli
[Markdown]:                        https://en.wikipedia.org/wiki/Markdown
[Integrating GitBook with JSDoc to Document Your Open Source Project]: https://medium.com/@kevinast/integrate-gitbook-jsdoc-974be8df6fb3
[`folding-menu`]:                  https://github.com/KevinAst/gitbook-plugin-folding-menu
