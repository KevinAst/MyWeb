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
- [Clone Project From Scratch]


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
     "blog:dev": "nodemon --exec \"npx gitbook build FireWithin MyPage/FireWithin\"",
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



<!--- *** SUB-SECTION *************************************************************** --->
# Clone Project From Scratch

These are the complete steps in getting this project up-and-running
from the github repository.  I performed this 10/18/2024 in setting up
my new development machine.  There are some manual steps in the
process, and some things that should be revisited when I have time.

1. Clone the ([MyWeb](https://github.com/KevinAst/MyWeb)) GitHub
   project to your local development environment.

   - use your preferred git process.
   - I use GitHub Desktop as follows:
     * from the ([MyWeb](https://github.com/KevinAst/MyWeb))
     * click dropdown: `Code / Open with GitHub Desktop`
     * this will launch a clone process on the  **GitHub Desktop** on your local machine.
       - use the following local directory: `C:\dev\MyWeb`
       - click: `clone`
     * make sure you are using the current development branch (at the
       time of this writing: `next3`).
   - optionally setup a VSCode workspace (currently I never open the project in VSCode)

2. Install the main project dependencies:

   ```
   c:/dev/MyWeb/
      .gitignore
      FireWithin/
      LICENSE.md
      MyPage/
      node_modules/ <<< CREATING THIS DIRECTORY
      package.json
      README.md
      TOOLING.md
   ```

   ```bash
   $ cd c:/dev/MyWeb

   $ npm install

       npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
       npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
       npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
       npm warn deprecated q@1.5.0: You or someone you depend on is using Q, the JavaScript Promise library that gave JavaScript developers strong feelings about promises. They can almost certainly migrate to the native JavaScript promise now. Thank you literally everyone for joining me in this bet against the odds. Be excellent to each other.
       npm warn deprecated
       npm warn deprecated (For a CapTP with native promises, see @endo/eventual-send and @endo/captp)

       added 142 packages, and audited 700 packages in 13s

       28 packages are looking for funding
         run `npm fund` for details

       58 vulnerabilities (1 low, 15 moderate, 31 high, 11 critical)

   $ ls
       NOTE: The node_modules directory NOW EXISTS!
   ```

3. Setup GitBook and the GitBook Plugins used by this project.

   Please Note that the GitBook project has transitioned to a
   commercial platform, and the open-source version is no longer
   maintained.  The open-source version is still however heavily used.

   There are some manual patches required, to get it running.  When I
   have time, I plan to move over to Honkit - a fork of the original
   GitBook which is actively maintained by the community, providing
   compatibility with the GitBook ecosystem.

   - Apply the following **hack** to the installed lib to make the
     unstable gitbook operational.

     This is making a change to an **installed** node_module library
     (i.e. a hack).  It is mentioned in Step 9 (above), but the file
     tends to move around (based on enhancements to this low-level
     library).

     Avoiding Following Error (executing gitbook command):
     ```
     TypeError: cb.apply is not a function
     ```

     File Location:
     ```
     ORIGINALLY (from Step 9 above): 
       c:/dev/MyWeb/node_modules/npm/node_modules/graceful-fs/polyfills.js

     CURRENTLY (greping for content, found 2: update both):
       c:/dev/MyWeb/node_modules/npm/node_modules/graceful-fs/polyfills.js
       c:/dev/MyWeb/node_modules/graceful-fs/polyfills.js
     ```

     DO THIS: Comment Out Following Lines:
     ```js
     // KJB: HACK to fix STALE gitbook-cli (see: TOOLING.md)
     // fs.stat = statFix(fs.stat)
     // fs.fstat = statFix(fs.fstat)
     // fs.lstat = statFix(fs.lstat)
     ```

   - Temporarly remove `my-plugin` (MY local plugin) from book.json.

     NEEDED, so as to NOT halt the plugin installation (my-plugin is a
     local plugin that is symlinked into node_modules).

     book.json
     ```json
       "plugins": [
         "my-plugin",     <<< TEMPORARILY REMOVE THIS (before executing subsequent commands)
         "-livereload",
         "-sharing",
         "toolbar",
         "folding-menu"
       ],
     ```

   - Now install the gitbook plugins

     ```bash

     $ cd C:/dev/MyWeb/FireWithin

     $ lsd # list directories

         gitbook-plugin-my-plugin
         js
         styles

     $ npx gitbook install # install gitbook and it's plugins (directed from book.json)

         info: installing 2 plugins using npm@3.9.2 
         info:  
         info: installing plugin "toolbar"              <<< NOTE: FIRST PLUGIN INSTALLED
         info: install plugin "toolbar" (*) from NPM with version 0.6.0 
         C:\dev\MyWeb\FireWithin
         `-- gitbook-plugin-toolbar@0.6.0 
         info: >> plugin "toolbar" installed with success 
         
         info: installing plugin "folding-menu"         <<< NOTE: SECOND PLUGIN INSTALLED
         info: install plugin "folding-menu" (*) from NPM with version 1.0.1 
         C:\dev\MyWeb\FireWithin
         +-- gitbook-plugin-folding-menu@1.0.1 
         `-- gitbook-plugin-toolbar@0.6.0 
         
         info: >> plugin "folding-menu" installed with success 

     $ lsd # list directories again

         gitbook-plugin-my-plugin
         js
         node_modules     <<< NOTE: Process ADDED node_modules (with plugins)
         styles
     ```

   - Add `my-plugin` (MY local plugin) back into book.json.

     book.json
     ```json
       "plugins": [
         "my-plugin",     <<< ADD THIS BACK (will be manually referenced from symlink on next step)
         "-livereload",
         "-sharing",
         "toolbar",
         "folding-menu"
       ],
     ```

   - Create the symlink for MY local plugin

     ```bash
     $ cd C:/dev/MyWeb/FireWithin/node_modules
           
     # make the hard link by referencing the master source (THIS IS A DOS command)
     $ mklink /J gitbook-plugin-my-plugin ..\gitbook-plugin-my-plugin
     ```

     This sets up the following directory structure:

     ```
     c:/dev/
        MyWeb/
          FireWithin/
            gitbook-plugin-my-plugin/ <<< MASTER of MY "local" specialized plugin for FireWithin
            js/
            node_modules/
              gitbook-plugin-folding-menu/
              gitbook-plugin-my-plugin -> c:/dev/MyWeb/FireWithin/gitbook-plugin-my-plugin/ <<< symlink link referencing parent master gitbook-plugin-my-plugin
              gitbook-plugin-toolbar/
            styles/
            tons of .md files, etc.
     ```

4. The project should now be operational!

   Try the normal development build/browse steps.

   ```bash
   # run web server:
     $ cd C:/dev/MyWeb
     $ npm run blog:devServe

   # run build process
     $ cd C:/dev/MyWeb
     $ npm run blog:dev

   # IN BROWSER
     http://localhost:8080/
   ```


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
[Clone Project From Scratch]:     #clone-project-from-scratch

[GitBook]:                         https://docs.gitbook.com/
[GitBook command-line interface]:  https://www.npmjs.com/package/gitbook-cli
[Markdown]:                        https://en.wikipedia.org/wiki/Markdown
[Integrating GitBook with JSDoc to Document Your Open Source Project]: https://medium.com/@kevinast/integrate-gitbook-jsdoc-974be8df6fb3
[`folding-menu`]:                  https://github.com/KevinAst/gitbook-plugin-folding-menu
