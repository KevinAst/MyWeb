<!-- mark this page so ReflectiveMemorizationData is maintained at run-time -->
P{ inject('<span id="ContainsReflectiveMemorizationData"></span>') }P

## Memorizing God's Word

## At a Glance

M{ toc({
   entries: [
    { href: `#overview`,    label: `Overview`,                                           },

    { href: `#january`,     label: `January`,                                            },
    { ref:  `luk.9.23-24`,  label: `Luke 9:23-24 (Discipleship)`,         indent: true,  },
    { ref:  `php.4.8`,      label: `Philippians 4:8 (ChristianLiving)`,   indent: true,  },

    { href: `#february`,    label: `February`,                                           },
    { ref:  `rom.12.1-2`,   label: `Romans 12:1-2 (ChristianLiving)`,     indent: true,  },
    { ref:  `rom.2.4`,      label: `Romans 2:4 (God)`,                    indent: true,  },

    { href: `#march`,       label: `March`,                                              },
    { ref:  `phm.1.4-7`,    label: `Philemon 1:4-7 (Prayer)`,             indent: true,  },
    { ref:  `1jn.4.7-9`,    label: `1 John 4:7-9 (God)`,                  indent: true,  },

    { href: `#april`,       label: `April`,                                              },
    { ref:  `1jn.1.9`,      label: `1 John 1:9 (Evangelism)`,             indent: true,  },
    { ref:  `rom.3.21-23`,  label: `Romans 3:21-23 (Evangelism)`,         indent: true,  },

    { href: `#may`,         label: `May`,                                                },
    { ref:  `rom.6.23`,     label: `Romans 6:23 (Evangelism)`,            indent: true,  },
    { ref:  `rom.10.9-10`,  label: `Romans 10:9-10 (Evangelism)`,         indent: true,  },

    { href: `#june`,        label: `June` ,                                              },
    { ref:  `eph.4.31-32`,  label: `Ephesians 4:31-32 (ChristianLiving)`, indent: true,  },
    { ref:  `heb.3.12-14`,  label: `Hebrews 3:12-14 (Discipleship)`,      indent: true,  },

    { href: `#july`,        label: `July` ,                                              },
    { ref:  `psa.18.30`,    label: `Psalms 18:30 (God)`,                  indent: true,  },
    { ref:  `2pe.3.9`,      label: `2 Peter 3:9 (God)`,                   indent: true,  },
    { ref:  `1th.3.13`,     label: `1 Thessalonians 3:13 (Prayer)`,       indent: true,  },
  ]
}) }M


<!-- our Multi-Verse Audio Review controls ******************************************************************************** -->

<div style="text-align: center;">

  <br/>
  
  <p>
    <b>Multi-Verse Audio Review</b> <br/>
    <i>
      Listen to multiple verses of your choice <br/>
      by selecting the &#x1F508; audio checkboxes (above), <br/>
      then play <b>this</b> audio control:
    </i>
  </p>
  
  <!-- our one-and-only audio control (hidden) -->
  <audio id="audio_player" controls 
         onended="fw.audio_ended()"
         onerror="fw.audio_loadError(event)"
         style="display: none;">
    Your browser does not support the audio tag.
  </audio>
  
  <!-- Our custom audio control buttons that tap into the one-and-only <audio> -->
  <!-- ... using span as div to workaround an odd issue with HTML/Markdown/Macro (unsure which) where outer </div> is being interpreted as text, leaving it open -->
  <span style="display: block;" class="audio-controls">
    <button class="audio-button" title="Play"  onclick="fw.audio_play('multi-verse')">▶️</button>
    <button class="audio-button" title="Pause" onclick="fw.audio_pause()">⏸</button>
    
    <span class="audio-label" id="verseRef">Multi-Verse</span>
  
    <button class="audio-button" title="Volume Down" onclick="fw.audio_volumeDown()">🔉</button>
    <button class="audio-button" title="Volume Up"   onclick="fw.audio_volumeUp()">🔊</button>
  </span>
  
  
  M{ completedCheckBox(`multiVerseView@@ view verse being played`) }M
  
  <p id="multi-verse-user-msg" style="font-weight: bold; color: red; font-style: italic;"></p>

</div>


### Overview

This page contains _**selected scriptures that you may consider
committing to memory**_.

For me, this journey began in 2020, when God got my attention and took
hold of my life.  I have a bit of a prodigal son story _(I share more
about my Christian faith in the {{book.MyFaith}} page)_.

Recently, my local church ({{book.FBM}}) launched a memorization
campaign called **[25 in 25](https://fbmaryville.org/25-in-25)** — a
challenge to memorize 25 passages in 2025, each centered on one of
five themes.

Memorization has always been a challenge for me. This time, however,
rather than using that as an excuse, I felt God directing me to do
something about it. _**This page is the result — <mark>one I hope will
be a helpful resource</mark>.**_

P{ collapsibleSection({
  id:     'memVerseOverview',
  label:  'Tell Me More',
  initialExpansion: 'close',
}) }P

Explore the features of this page _(with some quick tips on how to use them)_:.

- _**Audio Playback**_: You can listen to each passage _**on repeat**_ until
  you stop it. This is especially handy on your phone — _**just pop in
  your earbuds and let the Scripture take root in your memory!**_

  This is the **<mark>key feature</mark>** of this page and _**the
  reason I created it**_ :-)

  You will find the **Audio Playback Control** after each scripture
  _(below)_.  The following elements are included for each audio:

  - **Context** (e.g., _Paul's parting instruction to the church at Philippi_)  
  - **Scripture Reference** (e.g., _Philippians 4:8_)  
  - **Translation** (e.g., _New Living Translation_)  
  - **Scripture Passage** (recited in the selected translation)  
  - **Scripture Reference** (repeated – per recommendation of The [Navigators'](https://www.navigators.org/))


- _**Customizable Translations**_: For each memory verse, you may
  select the Bible translation you wish to memorize, from a selection
  of the most popular versions.

  Initially, the default translation _(promoted by the **[25 in
  25](https://fbmaryville.org/25-in-25)** campaign)_ will be selected,
  and **it's selector will always be shown in red**.

- _**YouVersion Links**_: Each memory verse is a link to the
  [YouVersion](https://www.bible.com/) Bible App, so you can explore
  the passage in greater depth.

  In addition there are _**"... explore {Book}"**_ links _(below the
  audio controls)_ that navigate further into the {{book.FireWithin}}
  Bible Study Guide.

- _**Progress Tracking**_: As is the case with several aspects of this
  {{book.FireWithin}} site, you can keep track of your progress _(in 
  this case - the verses you have memorized)_ with the "completed"
  check boxes ✔.

- _**Minimalist View**_: You can collapse both this overview and
  devotional sections found in this page - **to give more prominence to
  the scripture itself**.  

  Simply click the title of any collapsible section _(indicated by an
  arrow - ▶)_, to toggle between expanded and collapsed views.

- _**Multi-Verse Playback**_: In addition to listening to each
  individual memory verse _(one at a time)_, you can choose to listen
  to multiple verses of your choosing.  This audio control is at the
  top of the page _(just under the **Table of Contents**)_.

  You simply select the verses you want to review _(through the
  &#x1F508; audio checkboxes to the right of each verse in the TOC)_,
  and click play on the audio control.  

  When you check the "view verse being played" option, the verse will
  scroll into view during it's play.  **Please Note**: This feature
  seems to be intermittent on cell-phone use _(only on selected
  verses)_.

- _**Total Recall**_: All these settings are automatically saved, so when
  you return to the site, it will be just as you left it.

  > **Please Note**: By default these settings are stored locally on
  > your device. This works well when you are using a single device.  
  > 
  > If however you use multiple devices _(say your laptop and your
  > phone)_, each one will have their own settings _(that you must sync
  > manually)_.  **To solve this problem**, you simply create a **FireWithin
  > Account** (on the {{book.Settings}} page) - which then saves your
  > settings to the cloud, and any device signed-in to this account
  > will sync automatically!

P{ collapsibleSectionEnd() }P


Currently, there are only a few passages on this page.  I am following
the **[25 in 25](https://fbmaryville.org/25-in-25)** campaign, and
will be adding passages from that resource throughout the year.

I also plan to add additional scriptures to this page.  _**Would you like
to see a particular passage added?**_ Reach out to me at <span
id="inquire"></span>

<script>
  withFW( ()=>fw.addInquire('Add%20Memory%20Scripture') )
</script>

Lord Bless You!
<br/>**&lt;/Kevin&gt;**


<!-- *** NEW MONTH ******************************************************************************** -->

<hr style="height: 9px; background-color: #616a6b; border: none; width: 70%; margin: 20px auto; border-radius: 5px;">

<span id="january"></span>

_**[January Flyer](https://fbmaryville.org/s/25in25cards_Jan.pdf) for [25 in 25](https://fbmaryville.org/25-in-25) campaign**_


<!-- *** NEW PASSAGE ******************************************************************************** -->

M{ memorizeVerse({
  ref:     `luk.9.23-24`,
  label:   `Luke 9:23-24 (Discipleship)`,
  context: `Jesus highlights the importance of submission`,
  text: {
    NLT:   `Then he said to the crowd, "If any of you wants to be my follower, you must give up your own way, take up your cross daily, and follow me. If you try to hang on to your life, you will lose it. But if you give up your life for my sake, you will save it."`,
    NKJV:  `Then He said to them all, "If anyone desires to come after Me, let him deny himself, and take up his cross daily, and follow Me. For whoever desires to save his life will lose it, but whoever loses his life for My sake will save it."`,  
    KJV:   `And he said to them all, "If any man will come after me, let him deny himself, and take up his cross daily, and follow me. For whosoever will save his life shall lose it: but whosoever will lose his life for my sake, the same shall save it."`,
    ESV:   `And he said to all, "If anyone would come after me, let him deny himself and take up his cross daily and follow me. For whoever would save his life will lose it, but whoever loses his life for my sake will save it."`,
    CSB:   `Then he said to them all, "If anyone wants to follow after   me, let him deny himself,   take up his cross daily,   and follow me.   For whoever wants to save his life will lose it, but whoever loses his life because of me will save it."`,
   "NIV*": `Then he said to them all: "Whoever wants to be my disciple must deny themselves and take up their cross daily and follow me. For whoever wants to save their life will lose it, but whoever loses their life for me will save it."`,
  },
}) }M

<p style="text-align: center;"><i><a href="Luke.html">... explore Luke</a></i></p>

P{ inject('<div class="indent">') }P

P{ collapsibleSection({
  id:     'more_luk_9_23-24',
  label:  'Additional Thoughts',
}) }P

If we want to have a new life (eternal life), we must deny ourselves
and give up our lives (our own way of living) here on earth.
 
Denying ourselves is the hardest part. In fact, the world teaches
something completely different. The world says, "follow your heart" or
"live your truth." Meanwhile, someone laying down their desires to be
obedient to Jesus is considered extreme and down right crazy.
 
Did you know that the basis for salvation is a denial of self?
 
To repent of sin (turn from sin) and ask for forgiveness (help) from
God is a denial of self. At our core we want to sin. Only with the
Holy Spirit's help can we take this first step of self denial (turning
from sin). And the same is true about each and every step of self
denial.
 
_**The Holy Spirit is our helper**_ in denying ourselves, taking up our
cross daily, and following Jesus. Simply put, obedience is laying down
what we want in order to trust that God knows better than we do.

P{ collapsibleSectionEnd() }P

P{ inject('</div>') }P


<!-- *** NEW PASSAGE ******************************************************************************** -->

M{ memorizeVerse({
  ref:     `php.4.8`,
  label:   `Philippians 4:8 (ChristianLiving)`,
  context: `Paul's parting instruction to the Church at Philippi`,
  text: {
    NLT:   `And now, dear brothers and sisters, one final thing. Fix your thoughts on what is true, and honorable, and right, and pure, and lovely, and admirable. Think about things that are excellent and worthy of praise.`,
    NKJV:  `Finally, brethren, whatever things are true, whatever things are noble, whatever things are just, whatever things are pure, whatever things are lovely, whatever things are of good report, if there is any virtue and if there is anything praiseworthy—meditate on these things.`,  
    KJV:   `Finally, brethren, whatsoever things are true, whatsoever things are honest, whatsoever things are just, whatsoever things are pure, whatsoever things are lovely, whatsoever things are of good report; if there be any virtue, and if there be any praise, think on these things.`,
    ESV:   `Finally, brothers, whatever is true, whatever is honorable, whatever is just, whatever is pure, whatever is lovely, whatever is commendable, if there is any excellence, if there is anything worthy of praise, think about these things.`,
    CSB:   `Finally  brothers and sisters, whatever is true,  whatever is honorable,  whatever is just,  whatever is pure,  whatever is lovely, whatever is commendable — if there is any moral excellence  and if there is anything praiseworthy — dwell on these things.`,
   "NIV*": `Finally, brothers and sisters, whatever is true, whatever is noble, whatever is right, whatever is pure, whatever is lovely, whatever is admirable—if anything is excellent or praiseworthy—think about such things.`,
  },
}) }M

<p style="text-align: center;"><i><a href="Philippians.html">... explore Philippians</a></i></p>

P{ inject('<div class="indent">') }P

P{ collapsibleSection({
  id:     'more_php_4_8',
  label:  'Additional Thoughts',
}) }P

What we think about is important. We Often allow our minds
to wander and end up in some pretty dark places. It's when
we allow our thoughts to reach their conclusion that we get
in trouble. 

Instead, we should "_take every thought captive to obey Christ_"
[2 Corinthians 10:5 ESV](https://bible.com/bible/59/2co.10.5.ESV).

In M{ bibleLink(`php.4.8@@Philippians 4:8`) }M, the Apostle Paul
teaches us how to begin taking every thought captive.

Next time you have a thought you can ask:

- Is this line of thinking true, honorable, or right?
  
- Are these thoughts pure, lovely, or admirable?
  
- Is this an excellent or praiseworthy way of thinking?

If the answer to any of these questions is "NO", then you know
what to do. 

- Take those thoughts captive and bring them into obedience to Christ.

- _**Allow the Holy Spirit to lead you in truth**_ instead of your
  thoughts leading you into dark places.

P{ collapsibleSectionEnd() }P

P{ inject('</div>') }P









<!-- *** NEW MONTH ******************************************************************************** -->

<hr style="height: 9px; background-color: #616a6b; border: none; width: 70%; margin: 20px auto; border-radius: 5px;">

<span id="february"></span>

_**[February Flyer](https://fbmaryville.org/s/_25in25cards_Feb.pdf) for [25 in 25](https://fbmaryville.org/25-in-25) campaign**_
                    
                    


<!-- *** NEW PASSAGE ******************************************************************************** -->

M{ memorizeVerse({
  ref:     `rom.12.1-2`,
  label:   `Romans 12:1-2 (ChristianLiving)`,
  context: `A surrendered life, a renewed mind`,
  text: {
    NLT:   `And so, dear brothers and sisters, I plead with you to give your bodies to God because of all he has done for you. Let them be a living and holy sacrifice—the kind he will find acceptable. This is truly the way to worship him. Don’t copy the behavior and customs of this world, but let God transform you into a new person by changing the way you think. Then you will learn to know God’s will for you, which is good and pleasing and perfect.`,
    NKJV:  `I beseech you therefore, brethren, by the mercies of God, that you present your bodies a living sacrifice, holy, acceptable to God, which is your reasonable service. And do not be conformed to this world, but be transformed by the renewing of your mind, that you may prove what is that good and acceptable and perfect will of God.`,  
    KJV:   `I beseech you therefore, brethren, by the mercies of God, that ye present your bodies a living sacrifice, holy, acceptable unto God, which is your reasonable service. And be not conformed to this world: but be ye transformed by the renewing of your mind, that ye may prove what is that good, and acceptable, and perfect, will of God.`,
    ESV:   `I appeal to you therefore, brothers, by the mercies of God, to present your bodies as a living sacrifice, holy and acceptable to God, which is your spiritual worship. Do not be conformed to this world, but be transformed by the renewal of your mind, that by testing you may discern what is the will of God, what is good and acceptable and perfect.`,
    CSB:   `Therefore, brothers and sisters, in view of the mercies of God, I urge you  to present your bodies as a living sacrifice,  holy and pleasing to God; this is your true worship.  Do not be conformed  to this age,  but be transformed by the renewing of your mind,  so that you may discern what is the good, pleasing, and perfect will  of God.`,
   "NIV*": `Therefore, I urge you, brothers and sisters, in view of God’s mercy, to offer your bodies as a living sacrifice, holy and pleasing to God—this is your true and proper worship. Do not conform to the pattern of this world, but be transformed by the renewing of your mind. Then you will be able to test and approve what God’s will is—his good, pleasing and perfect will.`,
  },
}) }M

<p style="text-align: center;"><i><a href="Romans.html">... explore Romans</a></i></p>

P{ inject('<div class="indent">') }P

P{ collapsibleSection({
  id:     'more_rom_12_1-2',
  label:  'Additional Thoughts',
}) }P

Knowing that our thoughts direct our behaviors, renewing our mind
becomes our greatest transformational aspiration.

With a renewed mind, we are able to discern what is God's will and
what is a scheme of the evil one.  _**In other words, we can better
understand God's ways versus the ways of the world.**_

Once we are able to discern these things, it becomes possible for us
to _offer our bodies to God as a living sacrifice_.  _**We can walk in
obedience to Him.**_ _We are pleasing to Him!_

P{ collapsibleSectionEnd() }P

P{ inject('</div>') }P





<!-- *** NEW PASSAGE ******************************************************************************** -->

M{ memorizeVerse({
  ref:     `rom.2.4`,
  label:   `Romans 2:4 (God)`,
  context: `God's kindness leads to repentance`,
  text: {
    NLT:   `Don’t you see how wonderfully kind, tolerant, and patient God is with you? Does this mean nothing to you? Can’t you see that his kindness is intended to turn you from your sin?`,
    NKJV:  `Or do you despise the riches of His goodness, forbearance, and longsuffering, not knowing that the goodness of God leads you to repentance?`,  
    KJV:   `Or despisest thou the riches of his goodness and forbearance and longsuffering; not knowing that the goodness of God leadeth thee to repentance?`,
    ESV:   `Or do you presume on the riches of his kindness and forbearance and patience, not knowing that God’s kindness is meant to lead you to repentance?`,
    CSB:   `Or do you despise the riches of his kindness,  restraint,  and patience,  not recognizing  that God’s kindness  is intended to lead you to repentance?`,
    NIV:   `Or do you show contempt for the riches of his kindness, forbearance and patience, not realizing that God’s kindness is intended to lead you to repentance?`,
   "ICB*": `God has been very kind to you, and he has been patient with you. God has been waiting for you to change. But you think nothing of his kindness. Perhaps you do not understand that God is kind to you so that you will change your hearts and lives.`,
  },
}) }M

<p style="text-align: center;"><i><a href="Romans.html">... explore Romans</a></i></p>

P{ inject('<div class="indent">') }P

P{ collapsibleSection({
  id:     'more_rom_2_4',
  label:  'Additional Thoughts',
}) }P

God is patient and kind. 

However, many times we mistake His patience and kindness as a lack of
response. We begin fooling ourselves into thinking sin isn't sin or
that God isn't real because there was no immediate consequence for our
sin.

This verse tells us that _**it's His kindness that leads to
repentance**_. Without His kindness, we wouldn't even have a chance to
repent. 

_**Thank God for His kindness today!**_

P{ collapsibleSectionEnd() }P

P{ inject('</div>') }P




<!-- *** NEW MONTH ******************************************************************************** -->

<hr style="height: 9px; background-color: #616a6b; border: none; width: 70%; margin: 20px auto; border-radius: 5px;">

<span id="march"></span>

_**[March Flyer](https://fbmaryville.org/s/25in25cards_march.pdf) for [25 in 25](https://fbmaryville.org/25-in-25) campaign**_



<!-- *** NEW PASSAGE ******************************************************************************** -->

M{ memorizeVerse({
  ref:     `phm.1.4-7`,
  label:   `Philemon 1:4-7 (Prayer)`,
  context: `faith and love refreshes hearts`,
  text: {
    NLT:   `I always thank my God when I pray for you, Philemon, because I keep hearing about your faith in the Lord Jesus and your love for all of God’s people. And I am praying that you will put into action the generosity that comes from your faith as you understand and experience all the good things we have in Christ. Your love has given me much joy and comfort, my brother, for your kindness has often refreshed the hearts of God’s people.`,
    NKJV:  `I thank my God, making mention of you always in my prayers, hearing of your love and faith which you have toward the Lord Jesus and toward all the saints, that the sharing of your faith may become effective by the acknowledgment of every good thing which is in you in Christ Jesus. For we have great joy and consolation in your love, because the hearts of the saints have been refreshed by you, brother.`,  
    KJV:   `I thank my God, making mention of thee always in my prayers, hearing of thy love and faith, which thou hast toward the Lord Jesus, and toward all saints; that the communication of thy faith may become effectual by the acknowledging of every good thing which is in you in Christ Jesus. For we have great joy and consolation in thy love, because the bowels of the saints are refreshed by thee, brother.`,
    ESV:   `I thank my God always when I remember you in my prayers, because I hear of your love and of the faith that you have toward the Lord Jesus and for all the saints, and I pray that the sharing of your faith may become effective for the full knowledge of every good thing that is in us for the sake of Christ. For I have derived much joy and comfort from your love, my brother, because the hearts of the saints have been refreshed through you.`,
    CSB:   `I always thank my God when I mention you in my prayers, because I hear of your love  for all the saints and the faith that you have in the Lord Jesus. I pray that your participation in the faith may become effective  through knowing every good thing  that is in us  for the glory of Christ. For I have great joy and encouragement from your love, because the hearts of the saints have been refreshed  through you, brother.`,
   "NIV*": `I always thank my God as I remember you in my prayers, because I hear about your love for all his holy people and your faith in the Lord Jesus. I pray that your partnership with us in the faith may be effective in deepening your understanding of every good thing we share for the sake of Christ. Your love has given me great joy and encouragement, because you, brother, have refreshed the hearts of the Lord’s people.`,
  },
}) }M

<p style="text-align: center;"><i><a href="Philemon.html">... explore Philemon</a></i></p>

P{ inject('<div class="indent">') }P

P{ collapsibleSection({
  id:     'more_phm_1_4-7',
  label:  'Additional Thoughts',
}) }P

When you pray for someone, you can _**follow Paul's example**_.  As an
example, _if you are praying for your pastor_:

- Thank God for your pastor. 
- Thank God for the love your pastor has for the church and for his
  love for the Lord!
- Pray that your pastor's work in the church might deepen his own
  understanding of every good thing we share in the faith.
- Thank God for the times your heart has been refreshed by
  his words or actions. 
- Thank God for bringing joy and encouragement to His people through
  your pastor.

P{ collapsibleSectionEnd() }P

P{ inject('</div>') }P



<!-- *** NEW PASSAGE ******************************************************************************** -->

M{ memorizeVerse({
  ref:     `1jn.4.7-9`,
  label:   `1 John 4:7-9 (God)`,
  context: `defined by God’s revealed love`,
  text: {
    NLT:   `Dear friends, let us continue to love one another, for love comes from God. Anyone who loves is a child of God and knows God. But anyone who does not love does not know God, for God is love. God showed how much he loved us by sending his one and only Son into the world so that we might have eternal life through him.`,
    NKJV:  `Beloved, let us love one another, for love is of God; and everyone who loves is born of God and knows God. He who does not love does not know God, for God is love. In this the love of God was manifested toward us, that God has sent His only begotten Son into the world, that we might live through Him.`,  
    KJV:   `Beloved, let us love one another: for love is of God; and every one that loveth is born of God, and knoweth God. He that loveth not knoweth not God; for God is love. In this was manifested the love of God toward us, because that God sent his only begotten Son into the world, that we might live through him.`,
    ESV:   `Beloved, let us love one another, for love is from God, and whoever loves has been born of God and knows God. Anyone who does not love does not know God, because God is love. In this the love of God was made manifest among us, that God sent his only Son into the world, so that we might live through him.`,
    CSB:   `Dear friends, let us love one another, because love is from God, and everyone who loves has been born of God  and knows God. The one who does not love does not know God, because God is love. God’s love was revealed among us  in this way: God sent  his one and only Son  into the world so that we might live  through him.`,
   "NIV*": `Dear friends, let us love one another, for love comes from God. Everyone who loves has been born of God and knows God. Whoever does not love does not know God, because God is love. This is how God showed his love among us: He sent his one and only Son into the world that we might live through him.`,
  },
}) }M

<p style="text-align: center;"><i><a href="1John.html">... explore 1 John</a></i></p>

P{ inject('<div class="indent">') }P

P{ collapsibleSection({
  id:     'more_1jn_4_7-9',
  label:  'Additional Thoughts',
}) }P

God is love. God loves us. His love for us is shown in His patience
and kindness towards us so that we might come to repent of our sin and
follow His perfect ways (and not our own ways).

- If we have been born again, God's love will be on display in our
  life. 
  
- If God's love is not on display in our life, then we are not born
  again.  

God's love is displayed through our obedience to God and the love and
kindness we show others.

P{ collapsibleSectionEnd() }P

P{ inject('</div>') }P




<!-- *** NEW MONTH ******************************************************************************** -->

<hr style="height: 9px; background-color: #616a6b; border: none; width: 70%; margin: 20px auto; border-radius: 5px;">


<span id="april"></span>

_**[April Flyer](https://fbmaryville.org/s/25in25cards_April.pdf) for [25 in 25](https://fbmaryville.org/25-in-25) campaign**_



<!-- *** NEW PASSAGE ******************************************************************************** -->

M{ memorizeVerse({
  ref:     `1jn.1.9`,
  label:   `1 John 1:9 (Evangelism)`,
  context: `confess, cleanse, forgiven!`,
  text: {
    NLT:    `But if we confess our sins to him, he is faithful and just to forgive us our sins and to cleanse us from all wickedness.`,
    NKJV:   `If we confess our sins, He is faithful and just to forgive us our sins and to cleanse us from all unrighteousness.`,  
    KJV:    `If we confess our sins, he is faithful and just to forgive us our sins, and to cleanse us from all unrighteousness.`,
    ESV:    `If we confess our sins, he is faithful and just to forgive us our sins and to cleanse us from all unrighteousness.`,
    CSB:    `If we confess our sins, he is faithful and righteous to forgive  us our sins and to cleanse us from all unrighteousness.`,
    "NIV*": `If we confess our sins, he is faithful and just and will forgive us our sins and purify us from all unrighteousness.`,
  },
}) }M

<p style="text-align: center;"><i><a href="1John.html">... explore 1 John</a></i></p>

P{ inject('<div class="indent">') }P

P{ collapsibleSection({
  id:     'more_phm_1_4-7',
  label:  'Additional Thoughts',
}) }P

Does God really forgive all our sins? Even the really bad ones? The
secret ones?

**Yes, He does!**

When we humble ourselves and confess our sins to Him, we are forgiven
and purified.

Think of it like this: If our sins were dirty spots on our shirt, when
we confess our sins, all the dirty spots on our shirt are wiped away
and we are made clean in God's eyes.

He forgives us when we ask for forgiveness and He wipes our record
clean.

P{ collapsibleSectionEnd() }P

P{ inject('</div>') }P



<!-- *** NEW PASSAGE ******************************************************************************** -->

M{ memorizeVerse({
  ref:     `rom.3.21-23`,
  label:   `Romans 3:21-23 (Evangelism)`,
  context: `God's righteousness revealed in Christ`,
  text: {
    NLT:    `But now God has shown us a way to be made right with him without keeping the requirements of the law, as was promised in the writings of Moses and the prophets long ago. We are made right with God by placing our faith in Jesus Christ. And this is true for everyone who believes, no matter who we are. For everyone has sinned; we all fall short of God’s glorious standard.`,
    NKJV:   `But now the righteousness of God apart from the law is revealed, being witnessed by the Law and the Prophets, even the righteousness of God, through faith in Jesus Christ, to all and on all who believe. For there is no difference; for all have sinned and fall short of the glory of God`,  
    KJV:    `But now the righteousness of God without the law is manifested, being witnessed by the law and the prophets; even the righteousness of God which is by faith of Jesus Christ unto all and upon all them that believe: for there is no difference: for all have sinned, and come short of the glory of God`,
    ESV:    `But now the righteousness of God has been manifested apart from the law, although the Law and the Prophets bear witness to it - the righteousness of God through faith in Jesus Christ for all who believe. For there is no distinction: for all have sinned and fall short of the glory of God`,
    CSB:    `But now, apart from the law, the righteousness of God has been revealed,  attested by the Law and the Prophets. The righteousness of God is through faith in Jesus Christ, to all who believe,  since there is no distinction.  For all have sinned  and fall short of the  glory of God`,
    "NIV*": `But now apart from the law the righteousness of God has been made known, to which the Law and the Prophets testify. This righteousness is given through faith in Jesus Christ to all who believe. There is no difference between Jew and Gentile, for all have sinned and fall short of the glory of God`,
  },
}) }M

<p style="text-align: center;"><i><a href="Romans.html">... explore Romans</a></i></p>

P{ inject('<div class="indent">') }P

P{ collapsibleSection({
  id:     'more_phm_1_4-7',
  label:  'Additional Thoughts',
}) }P

Through faith in Jesus, we can have a right relationship with God. By
believing in Jesus, we are given the righteousness of God. 

**This is amazing news!**

Apart from Jesus, we are all sinners who have fallen short of the
glorious standard of God. 

On our own merit, we fall short. We need Jesus in order to have a
right relationship with God.

P{ collapsibleSectionEnd() }P

P{ inject('</div>') }P



<!-- *** NEW MONTH ******************************************************************************** -->

<hr style="height: 9px; background-color: #616a6b; border: none; width: 70%; margin: 20px auto; border-radius: 5px;">


<span id="may"></span>

_**[May Flyer](https://fbmaryville.org/s/25in25cards_may.pdf) for [25 in 25](https://fbmaryville.org/25-in-25) campaign**_



<!-- *** NEW PASSAGE ******************************************************************************** -->

M{ memorizeVerse({
  ref:     `rom.6.23`,
  label:   `Romans 6:23 (Evangelism)`,
  context: `earned death, offered life`,
  text: {
    NLT:    `For the wages of sin is death, but the free gift of God is eternal life through Christ Jesus our Lord.`,
    NKJV:   `For the wages of sin is death, but the gift of God is eternal life in Christ Jesus our Lord.`,  
    ESV:    `For the wages of sin is death, but the free gift of God is eternal life in Christ Jesus our Lord.`,
    "NIV*": `For the wages of sin is death, but the gift of God is eternal life in Christ Jesus our Lord.`,
  },
}) }M

<p style="text-align: center;"><i><a href="Romans.html">... explore Romans</a></i></p>

P{ inject('<div class="indent">') }P

P{ collapsibleSection({
  id:     'more_rom_6_23',
  label:  'Additional Thoughts',
}) }P

Since none of us are perfect, we are all sinners. 
Because of our sin, we have earned the wages of our sin, death. 
Death is eternal separation from the presence Of God. 

Thankfully, God has given us the gift of eternal life through Jesus.
_**Jesus paid for our sins by dying on the cross.**_

P{ collapsibleSectionEnd() }P

P{ inject('</div>') }P




<!-- *** NEW PASSAGE ******************************************************************************** -->

M{ memorizeVerse({
  ref:     `rom.10.9-10`,
  label:   `Romans 10:9-10 (Evangelism)`,
  context: `say it, believe it, be saved`,
  text: {
    NLT:    `If you openly declare that Jesus is Lord and believe in your heart that God raised him from the dead, you will be saved. For it is by believing in your heart that you are made right with God, and it is by openly declaring your faith that you are saved.`,
    NKJV:   `that if you confess with your mouth the Lord Jesus and believe in your heart that God has raised Him from the dead, you will be saved. For with the heart one believes unto righteousness, and with the mouth confession is made unto salvation.`,  
    ESV:    `because, if you confess with your mouth that Jesus is Lord and believe in your heart that God raised him from the dead, you will be saved. For with the heart one believes and is justified, and with the mouth one confesses and is saved.`,
    "NIV*": `If you declare with your mouth, “Jesus is Lord,” and believe in your heart that God raised him from the dead, you will be saved. For it is with your heart that you believe and are justified, and it is with your mouth that you profess your faith and are saved.`,
  },
}) }M

<p style="text-align: center;"><i><a href="Romans.html">... explore Romans</a></i></p>

P{ inject('<div class="indent">') }P

P{ collapsibleSection({
  id:     'more_rom_10_9-10',
  label:  'Additional Thoughts',
}) }P

In our hearts we believe. 
Our mouths say what is in our heart. 
The way we live our life shows what is in our heart. 

_**What does your mouth and life say about what you believe?**_

Believe in your heart _(have faith)_ that Jesus is Lord and that God raised Him from the dead. 
Do this and you will be justified. 
Profess your faith _(make it known to others)_ and you will be saved!

Next, you can live out your faith every day!

P{ collapsibleSectionEnd() }P

P{ inject('</div>') }P



<!-- *** NEW MONTH ******************************************************************************** -->

<hr style="height: 9px; background-color: #616a6b; border: none; width: 70%; margin: 20px auto; border-radius: 5px;">


<span id="june"></span>

_**[June Flyer](https://fbmaryville.org/s/_25in25cards_June.pdf) for [25 in 25](https://fbmaryville.org/25-in-25) campaign**_



<!-- *** NEW PASSAGE ******************************************************************************** -->

M{ memorizeVerse({
  ref:     `eph.4.31-32`,
  label:   `Ephesians 4:31-32 (ChristianLiving)`,
  context: `from bitterness to kindness`,
  text: {
   "NLT*": `Get rid of all bitterness, rage, anger, harsh words, and slander, as well as all types of evil behavior. Instead, be kind to each other, tenderhearted, forgiving one another, just as God through Christ has forgiven you.`,
    NKJV:  `Let all bitterness, wrath, anger, clamor, and evil speaking be put away from you, with all malice. And be kind to one another, tenderhearted, forgiving one another, even as God in Christ forgave you.`,  
    ESV:   `Let all bitterness and wrath and anger and clamor and slander be put away from you, along with all malice. Be kind to one another, tenderhearted, forgiving one another, as God in Christ forgave you.`,
    NIV:   `Get rid of all bitterness, rage and anger, brawling and slander, along with every form of malice. Be kind and compassionate to one another, forgiving each other, just as in Christ God forgave you.`,
  },
}) }M

<p style="text-align: center;"><i><a href="Ephesians.html">... explore Ephesians</a></i></p>

P{ inject('<div class="indent">') }P

P{ collapsibleSection({
  id:     'more_eph_4_31-32',
  label:  'Additional Thoughts',
}) }P

The way we respond to others can determine how well the relationship
goes moving forward. 

Not only are our responses to others important, but our thoughts and
feelings about others can impact the relationship too.  Ultimately,
our thoughts direct our behaviors. Once again, the Apostle Paul helps
us to "take every thought captive to obey Christ."

When we examine our thoughts and recognize disobedient ones, we can
replace disobedient thoughts with obedient ones.

This is the beginning of being tender-hearted and forgiving.  If we
want to be obedient to Christ in our actions, we must also be obedient
to Christ in our thoughts.

P{ collapsibleSectionEnd() }P

P{ inject('</div>') }P



<!-- *** NEW PASSAGE ******************************************************************************** -->

M{ memorizeVerse({
  ref:     `heb.3.12-14`,
  label:   `Hebrews 3:12-14 (Discipleship)`,
  context: `hold firm in faith together`,
  text: {
    NLT:   `Be careful then, dear brothers and sisters. Make sure that your own hearts are not evil and unbelieving, turning you away from the living God. You must warn each other every day, while it is still “today,” so that none of you will be deceived by sin and hardened against God. For if we are faithful to the end, trusting God just as firmly as when we first believed, we will share in all that belongs to Christ.`,
    NKJV:  `Beware, brethren, lest there be in any of you an evil heart of unbelief in departing from the living God; but exhort one another daily, while it is called “Today,” lest any of you be hardened through the deceitfulness of sin. For we have become partakers of Christ if we hold the beginning of our confidence steadfast to the end.`,  
    ESV:   `Take care, brothers, lest there be in any of you an evil, unbelieving heart, leading you to fall away from the living God. But exhort one another every day, as long as it is called “today,” that none of you may be hardened by the deceitfulness of sin. For we have come to share in Christ, if indeed we hold our original confidence firm to the end.`,
   "NIV*": `See to it, brothers and sisters, that none of you has a sinful, unbelieving heart that turns away from the living God. But encourage one another daily, as long as it is called “Today,” so that none of you may be hardened by sin’s deceitfulness. We have come to share in Christ, if indeed we hold our original conviction firmly to the very end.`,
  },
}) }M

<p style="text-align: center;"><i><a href="Hebrews.html">... explore Hebrews</a></i></p>

P{ inject('<div class="indent">') }P

P{ collapsibleSection({
  id:     'more_heb_3_12-14',
  label:  'Additional Thoughts',
}) }P

When we sin and are unrepentant, our hearts begin to become
calloused. After some time, we can allow a calloused heart to deceive
us into thinking that we no longer need God or that He isn't as
important as we once thought.  Many have fallen into this trap.

However, when we have other believers in our life who can encourage us
and remind us to walk with the Lord, we are able to hold firm, repent,
and walk in obedience. 

Find believers that can be encouraging to you. Find believers to whom
you can be an encouragement to. These kinds of relationships are key
in the life of the believer.

P{ collapsibleSectionEnd() }P

P{ inject('</div>') }P




<!-- *** NEW MONTH ******************************************************************************** -->

<hr style="height: 9px; background-color: #616a6b; border: none; width: 70%; margin: 20px auto; border-radius: 5px;">

<span id="july"></span>

_**[July Flyer](https://fbmaryville.org/s/25in25cards_July.pdf) for [25 in 25](https://fbmaryville.org/25-in-25) campaign**_


<!-- *** NEW PASSAGE ******************************************************************************** -->

M{ memorizeVerse({
  ref:     `psa.18.30`,
  label:   `Psalms 18:30 (God)`,
  context: `perfect path, proven word`,
  text: {
    NLT:    `God’s way is perfect. All the LORD’s promises prove true. He is a shield for all who look to him for protection.`,
    NKJV:   `As for God, His way is perfect; The word of the LORD is proven; He is a shield to all who trust in Him.`,  
    ESV:    `This God - his way is perfect; the word of the LORD proves true; he is a shield for all those who take refuge in him.`,
    "NIV*": `As for God, his way is perfect: The LORD’s word is flawless; he shields all who take refuge in him.`,
  },
}) }M

<p style="text-align: center;"><i><a href="Psalms.html">... explore Psalms</a></i></p>

P{ inject('<div class="indent">') }P

P{ collapsibleSection({
  id:     'more_psa_18_30',
  label:  'Additional Thoughts',
}) }P

There is no fault or failure in God. His ways (not ours) are perfect
and He speaks absolute truth.

The more we know about the Lord, the more we can trust Him. The better
we understand His ways, the better we can follow His way and not our
own. The more clear we are about what He has said, the more clearly we
can follow His Word.

Thankfully, God takes care of those who follow His ways, believe His
Word, and put their trust in Him.

P{ collapsibleSectionEnd() }P

P{ inject('</div>') }P


<!-- *** NEW PASSAGE ******************************************************************************** -->

M{ memorizeVerse({
  ref:     `2pe.3.9`,
  label:   `2 Peter 3:9 (God)`,
  context: `patient for repentance`,
  text: {
    NLT:    `The Lord isn’t really being slow about his promise, as some people think. No, he is being patient for your sake. He does not want anyone to be destroyed, but wants everyone to repent.`,
    NKJV:   `The Lord is not slack concerning His promise, as some count slackness, but is longsuffering toward us, not willing that any should perish but that all should come to repentance.`,  
    ESV:    `The Lord is not slow to fulfill his promise as some count slowness, but is patient toward you, not wishing that any should perish, but that all should reach repentance.`,
    "NIV*": `The Lord is not slow in keeping his promise, as some understand slowness. Instead he is patient with you, not wanting anyone to perish, but everyone to come to repentance.`,
  },
}) }M

<p style="text-align: center;"><i><a href="2Peter.html">... explore 2 Peter</a></i></p>

P{ inject('<div class="indent">') }P

P{ collapsibleSection({
  id:     'more_2pe_3_9',
  label:  'Additional Thoughts',
}) }P

Have you ever been impatient? 

Thankfully, God is patient with us. God doesn't want anyone to perish
(die without knowing Jesus). He desires for everyone to come to
repentance and faith in Jesus. 

While God is patient, He is also just. When we are apart from Christ,
we are dead in our sin and our eternal destination is Hell (eternal
separation from God's presence). 

Just because we don't suffer the terrible wrath of God the instant we
sin, it does not mean that punishment isn't coming. God will swiftly
bring about His wrath the moment we die. 

His patience is not weakness, it is mercy. His patience is not a free
pass. He will keep his promise; both to save the lost and punish the
wicked.

P{ collapsibleSectionEnd() }P

P{ inject('</div>') }P


<!-- *** NEW PASSAGE ******************************************************************************** -->

M{ memorizeVerse({
  ref:     `1th.3.13`,
  label:   `1 Thessalonians 3:13 (Prayer)`,
  context: `ready for Christ’s return`,
  text: {
    NLT:    `May he, as a result, make your hearts strong, blameless, and holy as you stand before God our Father when our Lord Jesus comes again with all his holy people. Amen.`,
    NKJV:   `so that He may establish your hearts blameless in holiness before our God and Father at the coming of our Lord Jesus Christ with all His saints.`,  
    ESV:    `so that he may establish your hearts blameless in holiness before our God and Father, at the coming of our Lord Jesus with all his saints.`,
    "NIV*": `May he strengthen your hearts so that you will be blameless and holy in the presence of our God and Father when our Lord Jesus comes with all his holy ones.`,
  },
}) }M

<p style="text-align: center;"><i><a href="1Thessalonians.html">... explore 1 Thessalonians</a></i></p>

P{ inject('<div class="indent">') }P

P{ collapsibleSection({
  id:     'more_1th_3_13',
  label:  'Additional Thoughts',
}) }P

When you pray for someone, you can follow Paul's example. For example,
if you are praying for your small group, ask God to strengthen their
hearts so that they would be blameless and holy before Him. Pray that
whatever they experience here on earth would not cause them to doubt
or fall away from the Lord. Pray for them to be faithful until Jesus
comes again!

P{ collapsibleSectionEnd() }P

P{ inject('</div>') }P
