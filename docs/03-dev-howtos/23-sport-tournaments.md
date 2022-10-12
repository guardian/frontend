Sport Tournaments
=================
Every now and then sport happens. In fact, it happens fairly frequently. But sometimes (about once a year), BIG sport
happens. BIG sport comes in the form of delightful events such as a [football world cup](https://www.theguardian.com/football/womens-world-cup-2019)
or a [cricket world cup](https://www.theguardian.com/sport/live/2019/jun/05/south-africa-v-india-cricket-world-cup-2019-live).
For these events we often provide live scores, tournament [spider diagrams](https://www.theguardian.com/football/womens-world-cup-2019/overview),
 [fixtures tables](https://www.theguardian.com/football/fixtures) and other lovely things. (In fact, we provide some of this
 stuff all the time for the various football leagues.)

 So the time has come to add a new competition, and you are the bold developer taking up the mantle to deliver automated
 sports results across the guardian. How to begin?

In general the sport routes file is a good place to start to get an idea of how this stuff fits together and what controller
is responsible for the pages you're trying to sort out. We don't tend to remove routes after a competition is finished -
we just remove the competition from navigation etc. It can be very helpful to find links to the pages you're trying to
create from older tournaments - maybe someone can give these to you, or you can scroll back for ages through sports tag
pages to find the last e.g. cricket world cup match.

All our various sport features have a similar architecture - some kind of job in the sports app which periodically fetches
and caches data from PA - this runs pretty frequently as it needs to pick up people scoring goals and the like. This
data is then used by the controllers to return useful information to power the various tables, results etc.

There are lots of helpful sports-specific pages within [frontend.gutools](https://frontend.gutools.co.uk/admin) - they haven't been
maintained for a while but there's plenty of useful info there, including api keys so you don't have to drag them
out of the config. There's also a PA api explorer and some docs of the various endpoints - more enjoyable than the docs
[on the PA site](http://developer.press.net/docs/)

More specifically, there's some stuff that you'll often end up doing when sorting out a new tournament.

 *Football*

We've got more football logic than for any of the other sports. You can find all the lovely football stuff we do all year
round by clicking through the nav on the [football section](https://www.theguardian.com/football/live). Tasks you'll need to do:

 - Add the competition to Competitions.scala
 - Add the tournament badge to static/public/images/badges
 - Add the competition to `tableOrder` in LeagueTableController
 - Update CompetitionStages.scala with the different matches of the tournament (this is for the spider diagram). NOTE:
 ordering is important here, make sure you've got the right teams playing each other. Here's an example https://github.com/guardian/frontend/pull/21396


After doing the above...

 - Verify that data is being successfully fetched from PA - you should see 'refreshing results for <competition pa id>'
 in the logs - check for any errors. The logic for fetching data is in agent.scala. It may be that we need to ask PA to
 switch on the data feed for that competition.
  - Check the spider diagram looks right. We do some string matching in knockoutSpider.scala.html to pick up the 3rd place
  play offs. If PA decides to use a slightly different name for that round then our string match will need to be updated
  to get the matches showing up in the right place on the diagram.
 - Check any team name cleaning is being done - see https://github.com/guardian/frontend/pull/21542, https://github.com/guardian/frontend/pull/21609
  and https://github.com/guardian/frontend/pull/21500

As of writing this the email for contacting PA customer.services@pressassociation.com


*Other sports*
[Football isn't the only sport](https://elt.oup.com/elt/students/englishfile/dyslexicfriendlytexts/a002209_english_file_3e_beginner_reading_text_file_7a.pdf?cc=us&selLanguage=en)
it turns out, who'd have thought it. Cricket also exists! All we offer for cricket is live scores that get injected into
live blogs with the appropriate team tags on them. These are set up in CricketTeams.scala - as of writing this we only
support the 10 teams that were in the 2019 cricket world cup - though more can be added to this list with the appropriate
PA id. HOWEVER, there are some limits to how many teams we can fetch data for - see https://github.com/guardian/frontend/pull/21563
for details.

Rugby is also a thing, as of writing this the code is broken due to being designed for an API we no longer have access
to. Watch this space though - it might be getting a makeover (so have a look in PR history for rugby related things!)


