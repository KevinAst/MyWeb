# Acts

<script type="text/javascript" src="pageSetup.js"></script>

<figure style="text-align: center;">
  <img class="diagram clickFullScreen"
       src="Acts-Luke.jpg"
       alt="Acts/Luke"
       width="100%">
  <figcaption>Click image to expand into full-screen</figcaption>
</figure>

## Intro

bla bla bla

## 2009 Acts Series (Sundays)

{{book.ref.CornerstoneChapel}}

## 2015-2016 Acts Series (Mid Week)

{{book.ref.CornerstoneChapel}}

<style>
.markdown-section table {
  width: auto; /* override gitbook table width 100% */
}
</style>

| Lesson/Scripture | Date  | Resource | Completed |
|------------------|:-----:|:--------:|:---------:|
| 1.  [Lesson](https://cornerstonechapel.net/teaching/20151021/) <br/>&nbsp;&nbsp;&nbsp;             [ACTS 1:1-11](https://bible.com/bible/act.1.1-11.msg)          | 10/21/2015 | [Study Guide](https://cornerstonechapel.net/documents/studyguides/20151021.pdf) | <input type="checkbox" id="20151021" onclick="handleCompletedCheckChange(this);"> |
| 2.  [Lesson](https://cornerstonechapel.net/teaching/20151028/) <br/>&nbsp;&nbsp;&nbsp;             [ACTS 1:12-2:13](https://bible.com/bible/act.1.12-2.13.msg) ?? | 10/28/2015 | [Study Guide](https://cornerstonechapel.net/documents/studyguides/20151028.pdf) | <input type="checkbox" id="20151028" onclick="handleCompletedCheckChange(this);"> |
| 3.  [Lesson](https://cornerstonechapel.net/teaching/20151104/) <br/>&nbsp;&nbsp;&nbsp;             [ACTS 2:1-13](https://bible.com/bible/act.2.1-13.msg)          | 11/04/2015 | [Study Guide](https://cornerstonechapel.net/documents/studyguides/20151104.pdf) | <input type="checkbox" id="20151104" onclick="handleCompletedCheckChange(this);"> |
| 4.  [Lesson](https://cornerstonechapel.net/teaching/20151118/) <br/>&nbsp;&nbsp;&nbsp;             [ACTS 2:13-37](https://bible.com/bible/act.2.13-37.msg)        | 11/18/2015 | [Study Guide](https://cornerstonechapel.net/documents/studyguides/20151118.pdf) | <input type="checkbox" id="20151118" onclick="handleCompletedCheckChange(this);"> |
| 5.  [Lesson](https://cornerstonechapel.net/teaching/20151202/) <br/>&nbsp;&nbsp;&nbsp;             [ACTS 2:42-3:26](https://bible.com/bible/act.2.42-3.26.msg) ?? | 12/02/2015 | [Study Guide](https://cornerstonechapel.net/documents/studyguides/20151202.pdf) | <input type="checkbox" id="20151202" onclick="handleCompletedCheckChange(this);"> |
| 6.  [Lesson](https://cornerstonechapel.net/teaching/20151209/) <br/>&nbsp;&nbsp;&nbsp;             [ACTS 4](https://bible.com/bible/act.4.msg)                    | 12/09/2015 | [Study Guide](https://cornerstonechapel.net/documents/studyguides/20151209.pdf) | <input type="checkbox" id="20151209" onclick="handleCompletedCheckChange(this);"> |
| 7.  [Lesson](https://cornerstonechapel.net/teaching/20151216/) <br/>&nbsp;&nbsp;&nbsp;             [ACTS 5](https://bible.com/bible/act.5.msg)                    | 12/16/2015 | [Study Guide](https://cornerstonechapel.net/documents/studyguides/20151216.pdf) | <input type="checkbox" id="20151216" onclick="handleCompletedCheckChange(this);"> |
| 8.  [Lesson](https://cornerstonechapel.net/teaching/20160106/) <br/>&nbsp;&nbsp;&nbsp;             [ACTS 6:1-15](https://bible.com/bible/act.6.1-15.msg)          | 01/06/2016 | [Study Guide](https://cornerstonechapel.net/documents/studyguides/20160106.pdf) | <input type="checkbox" id="20160106" onclick="handleCompletedCheckChange(this);"> |
| 9.  [Lesson](https://cornerstonechapel.net/teaching/20160113/) <br/>&nbsp;&nbsp;&nbsp;             [ACTS 7](https://bible.com/bible/act.7.msg)                    | 01/13/2016 | [Study Guide](https://cornerstonechapel.net/documents/studyguides/20160113.pdf) | <input type="checkbox" id="20160113" onclick="handleCompletedCheckChange(this);"> |
| 10. [Lesson](https://cornerstonechapel.net/teaching/20160120/) <br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [ACTS 8](https://bible.com/bible/act.8.msg)                    | 01/20/2016 | [Study Guide](https://cornerstonechapel.net/documents/studyguides/20160120.pdf) | <input type="checkbox" id="20160120" onclick="handleCompletedCheckChange(this);"> |

?? more todo really

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
