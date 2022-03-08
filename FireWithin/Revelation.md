# Revelation

<script type="text/javascript" src="pageSetup.js"></script>


## Intro

<!-- TEMP TEST -->
<center>
  <figure>
    <div id="ActsOverview1"></div>
    <figcaption>Hover to zoom, Click to open in new tab</figcaption>
  </figure>
</center>
<script>
  addZoomableImage('ActsOverview1', 'Luke-Acts.png', 90);
</script>


## 2019 Series

do it

do it

do it

do it

do it

do it

<script>
  // explicitly invoke our page setup here
  // - believe this is executed after all DOM elms (above) are up-and-running)
  // - was having difficulty with following:
  //      window.addEventListener('load', pageSetup());
  //      * it was in fact executed EACH time the page is loaded
  //      * HOWEVER the 'onload' event fired ONLY ONCE (not in navigating to other page and back)
  //        - this must have something to do with how GITBOOK does it's navigation
  //          ... not really sure

  // handles BOTH registerImgClickFullScreenHandlers() & initializeCompletedChecks()
  pageSetup();
</script>
