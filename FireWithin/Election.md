<script type="text/javascript" src="utils.js"></script>

## Election Day Sermons

{{book.CornerstoneChapel}}


<!-- MASTER: vertical layout for "cell phone" responsive show/hide -->
<div class="phone">
<table>

<tr><td> {{book.cb1}}20121104{{book.cb2}} 1. {{book.cb3}} </td><td> {{book.cst1}}20121104{{book.cst2}} Election Day Sermon                             {{book.cst3}} <br/>                                                                 </td><td> 11/04/2012                                              </td>
<tr><td> {{book.cb1}}20140622{{book.cb2}} 2. {{book.cb3}} </td><td> {{book.cst1}}20140622{{book.cst2}} Making of a King, Journey of a Christian        {{book.cst3}} <br/> {{book.b1}}111/1sa.8.niv   {{book.b2}} 1 Samuel 8-11    {{book.b3}} </td><td> 06/22/2014 <br/> {{book.csg1}}20140622.pdf{{book.csg2}} </td>
<tr><td> {{book.cb1}}20161016{{book.cb2}} 3. {{book.cb3}} </td><td> {{book.cst1}}20161016{{book.cst2}} Election Day Sermon                             {{book.cst3}} <br/> {{book.b1}}111/psa.33.niv  {{book.b2}} Psalm 33         {{book.b3}} </td><td> 10/16/2016                                              </td>
<tr><td> {{book.cb1}}20201018{{book.cb2}} 4. {{book.cb3}} </td><td> {{book.cst1}}20201018{{book.cst2}} Church in America, Wake Up!                     {{book.cst3}} <br/> {{book.b1}}111/jer.6.NIV   {{book.b2}} Jeremiah 6:16-19 {{book.b3}} </td><td> 10/18/2020                                              </td>
<tr><td> {{book.cb1}}20201028{{book.cb2}} 5. {{book.cb3}} </td><td> {{book.cst1}}20201028{{book.cst2}} Night of Prayer for the Elections               {{book.cst3}} <br/>                                                                 </td><td> 10/28/2020                                              </td>
<tr><td> {{book.cb1}}20201101{{book.cb2}} 6. {{book.cb3}} </td><td> {{book.cst1}}20201101{{book.cst2}} Calm in the Storm: An Election Day Addendum     {{book.cst3}} <br/> {{book.b1}}111/mat.8.niv   {{book.b2}} Matthew 8:23-27  {{book.b3}} </td><td> 11/01/2020 <br/> {{book.csg1}}20201101.pdf{{book.csg2}} </td>
<tr><td> {{book.cb1}}20201108{{book.cb2}} 7. {{book.cb3}} </td><td> {{book.cst1}}20201108{{book.cst2}} Sent Out Among Wolves: A Post-Election Reminder {{book.cst3}} <br/> {{book.b1}}111/mat.10.niv  {{book.b2}} Matthew 10       {{book.b3}} </td><td> 11/08/2020 <br/> {{book.csg1}}20201108.pdf{{book.csg2}} </td>

</table>
</div>

<!-- COPY: horizontal layout for "desktop/tablet" responsive show/hide (simply add 2 columns to header and replace TWO FROM <br/> TO </td><td> -->
<div class="desktop">
<table>

<tr><td> {{book.cb1}}20121104{{book.cb2}} 1. {{book.cb3}} </td><td> {{book.cst1}}20121104{{book.cst2}} Election Day Sermon                             {{book.cst3}} </td><td>                                                                 </td><td> 11/04/2012 </td><td>                                       </td>
<tr><td> {{book.cb1}}20140622{{book.cb2}} 2. {{book.cb3}} </td><td> {{book.cst1}}20140622{{book.cst2}} Making of a King, Journey of a Christian        {{book.cst3}} </td><td> {{book.b1}}111/1sa.8.niv   {{book.b2}} 1 Samuel 8-11    {{book.b3}} </td><td> 06/22/2014 </td><td> {{book.csg1}}20140622.pdf{{book.csg2}} </td>
<tr><td> {{book.cb1}}20161016{{book.cb2}} 3. {{book.cb3}} </td><td> {{book.cst1}}20161016{{book.cst2}} Election Day Sermon                             {{book.cst3}} </td><td> {{book.b1}}111/psa.33.niv  {{book.b2}} Psalm 33         {{book.b3}} </td><td> 10/16/2016 </td><td>                                       </td>
<tr><td> {{book.cb1}}20201018{{book.cb2}} 4. {{book.cb3}} </td><td> {{book.cst1}}20201018{{book.cst2}} Church in America, Wake Up!                     {{book.cst3}} </td><td> {{book.b1}}111/jer.6.NIV   {{book.b2}} Jeremiah 6:16-19 {{book.b3}} </td><td> 10/18/2020 </td><td>                                       </td>
<tr><td> {{book.cb1}}20201028{{book.cb2}} 5. {{book.cb3}} </td><td> {{book.cst1}}20201028{{book.cst2}} Night of Prayer for the Elections               {{book.cst3}} </td><td>                                                                 </td><td> 10/28/2020 </td><td>                                       </td>
<tr><td> {{book.cb1}}20201101{{book.cb2}} 6. {{book.cb3}} </td><td> {{book.cst1}}20201101{{book.cst2}} Calm in the Storm: An Election Day Addendum     {{book.cst3}} </td><td> {{book.b1}}111/mat.8.niv   {{book.b2}} Matthew 8:23-27  {{book.b3}} </td><td> 11/01/2020 </td><td> {{book.csg1}}20201101.pdf{{book.csg2}} </td>
<tr><td> {{book.cb1}}20201108{{book.cb2}} 7. {{book.cb3}} </td><td> {{book.cst1}}20201108{{book.cst2}} Sent Out Among Wolves: A Post-Election Reminder {{book.cst3}} </td><td> {{book.b1}}111/mat.10.niv  {{book.b2}} Matthew 10       {{book.b3}} </td><td> 11/08/2020 </td><td> {{book.csg1}}20201108.pdf{{book.csg2}} </td>

</table>
</div>




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
