# VBS
<script type="text/javascript" src="utils.js"></script>

This is a temporary page detailing my VBS Guide of 3rd Grade Boys (Journalists).

### At a Glance

- [Name Tags and Attendance](#name-tags-and-attendance)
- [3rd Grade Guides](#3rd-grade-guides)
- [Schedule](#schedule)
- [Schedule (Friday)](#schedule-friday)
- [Maps](#maps)

## Name Tags and Attendance

- Volunteers will find their name tags and an attendance form
  located in the area in which you are serving. 

- If you are in a rotation, these items will be in your room. 

- If you are a <mark>guide</mark>, these items will be in your guide bag which
  will be in your group's classroom.

- You do not need to see registration for check-in or name
  tags. 

## 3rd Grade Guides

- 3.1 Illustrators
  - Kelly Nischuitz
  - Oli Nischuitz
  - Eric Horn
  - Colette Horn
- 3.2 <mark>Journalists</mark>
  - Tony Simmons
  - Kevin Bridges
  - Tara Johnson
  - Jill Harrison
- 3.3 Authors
  - Laura Daniels
  - Alyssa Sharpmack
  - Chloe Crow
- 3.4 Poets
  - Mandi Thomas
  - Ryan Thomas
  - Megan Johnisee


## Schedule

<table>

<tr><td> {{book.cb1}}VBS_open{{book.cb2}}     5:45-6:10 <br/><i>(25 mins)</i> {{book.cb3}} </td><td> C204                    <br/> Opening Activities                        </td> </tr>
<tr><td> {{book.cb1}}VBS_worship{{book.cb2}}  6:15-6:40 <br/><i>(25 mins)</i> {{book.cb3}} </td><td> A Gym (FBM/Elementary)  <br/> Worship Rally                             </td> </tr>
<tr><td> {{book.cb1}}VBS_bible{{book.cb2}}    6:40-7:10 <br/><i>(30 mins)</i> {{book.cb3}} </td><td> FBM Chapel              <br/> Bible Study #1                            </td> </tr>
<tr><td> {{book.cb1}}VBS_snack{{book.cb2}}    7:10-7:20 <br/><i>(20 mins)</i> {{book.cb3}} </td><td> Middle School Cafeteria <br/> Snack                                     </td> </tr>
<tr><td> {{book.cb1}}VBS_reck{{book.cb2}}     7:20-7:40 <br/><i>(20 mins)</i> {{book.cb3}} </td><td> E Gym #1 (H.S)          <br/> Recreation                                </td> </tr>
<tr><td> {{book.cb1}}VBS_missions{{book.cb2}} 7:40-8:00 <br/><i>(20 mins)</i> {{book.cb3}} </td><td> C225 (Preteen Area)     <br/> Missions #2                               </td> </tr>
<tr><td> {{book.cb1}}VBS_crafts{{book.cb2}}   8:00-8:20 <br/><i>(20 mins)</i> {{book.cb3}} </td><td> C204                    <br/> Crafts                                    </td> </tr>
<tr><td> {{book.cb1}}VBS_close{{book.cb2}}    8:20-8:30 <br/><i>(10 mins)</i> {{book.cb3}} </td><td> C204                    <br/> Closing Group Time / Review and Dismissal </td> </tr>

</table>

## Schedule (Friday)

<table>

<tr><td> {{book.cb1}}VBS_F_open{{book.cb2}}     5:45-6:10 <br/><i>(25 mins)</i> {{book.cb3}} </td><td> C204                     <br/> Opening Activities                        </td> </tr>
<tr><td> {{book.cb1}}VBS_F_bible{{book.cb2}}    6:10-6:35 <br/><i>(25 mins)</i> {{book.cb3}} </td><td> FBM Chapel               <br/> Bible Study #1                            </td> </tr>
<tr><td> {{book.cb1}}VBS_F_snack{{book.cb2}}    6:35-6:45 <br/><i>(10 mins)</i> {{book.cb3}} </td><td> Middle School Cafeteria  <br/> Snack                                     </td> </tr>
<tr><td> {{book.cb1}}VBS_F_reck{{book.cb2}}     6:45-7:05 <br/><i>(20 mins)</i> {{book.cb3}} </td><td> E Gym #1 (H.S)           <br/> Recreation                                </td> </tr>
<tr><td> {{book.cb1}}VBS_F_missions{{book.cb2}} 7:05-7:25 <br/><i>(20 mins)</i> {{book.cb3}} </td><td> C225 (Preteen Area)      <br/> Missions #2                               </td> </tr>
<tr><td> {{book.cb1}}VBS_F_crafts{{book.cb2}}   7:25-7:45 <br/><i>(20 mins)</i> {{book.cb3}} </td><td> C204                     <br/> Crafts                                    </td> </tr>
<tr><td> {{book.cb1}}VBS_F_worship{{book.cb2}}  7:45-8:10 <br/><i>(25 mins)</i> {{book.cb3}} </td><td> A Gym (FBM/Elementary)   <br/> Worship Rally                             </td> </tr>
<tr><td> {{book.cb1}}VBS_F_close{{book.cb2}}    8:20-8:30 <br/><i>(10 mins)</i> {{book.cb3}} </td><td> C204                     <br/> Closing Group Time / Review and Dismissal </td> </tr>

</table>


## Maps

<center>
  <figure>
    <div id="VBS_map1"></div>
    <figcaption>BASE: Hover to zoom, Click to open in new tab</figcaption>
  </figure>
</center>
<script>
  addZoomableImage('VBS_map1', 'VBS_map1.png', 75);
</script>

<center>
  <figure>
    <div id="VBS_map2"></div>
    <figcaption>FIRST: Hover to zoom, Click to open in new tab</figcaption>
  </figure>
</center>
<script>
  addZoomableImage('VBS_map2', 'VBS_map2.png', 75);
</script>

<center>
  <figure>
    <div id="VBS_map3"></div>
    <figcaption>RECK: Hover to zoom, Click to open in new tab</figcaption>
  </figure>
</center>
<script>
  addZoomableImage('VBS_map3', 'VBS_map3.png', 75);
</script>



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
