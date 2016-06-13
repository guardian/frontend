package conf.switches

import org.joda.time.LocalDate

trait ABTestSwitches {

  val ABFrontsOnArticles2 = Switch(
    SwitchGroup.ABTests,
    "ab-fronts-on-articles2",
    "Injects fronts on articles for the test",
    owners = Seq(Owner.withName("dotcom reach")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 7, 5),
    exposeClientSide = true
  )

  val ABLiveBlogChromeNotificationsInternal = Switch(
    SwitchGroup.ABTests,
    "ab-live-blog-chrome-notifications-internal",
    "Live blog chrome notifications - Internal",
    owners = Seq(Owner.withGithub("desbo")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 7, 4),
    exposeClientSide = true
  )

  val ABLiveBlogChromeNotificationsProd = Switch(
    SwitchGroup.ABTests,
    "ab-live-blog-chrome-notifications-prod",
    "Live blog chrome notifications - prod",
    owners = Seq(Owner.withGithub("NathanielBennett")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 7, 4),
    exposeClientSide = true
  )
  
  val ABCleverFriend = Switch(
    SwitchGroup.ABTests,
    "ab-clever-friend-brexit",
    "Switch to trigger segmentation for clever friend exposure",
    owners = Seq(Owner.withGithub("annebyrne")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 7, 29),
    exposeClientSide = true
  )

  val ABWelcomeHeader = Switch(
    SwitchGroup.ABTests,
    "ab-welcome-header",
    "Welcome header for first time users test",
    owners = Seq(Owner.withGithub("marialivia16")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 6, 30),
    exposeClientSide = true
  )

  val ABParticipationDiscussionTest = Switch(
    SwitchGroup.ABTests,
    "ab-participation-discussion-test",
    "We are going to hide comments on a random half of articles",
    owners = Seq(Owner.withGithub("NathanielBennett")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 6, 21),
    exposeClientSide = true
  )

  val ABFacebookShareParams = Switch(
    SwitchGroup.ABTests,
    "ab-facebook-share-params",
    "Switch to add a query parameter to the url sent to Facebook when a user clicks the share button",
    owners = Seq(Owner.withGithub("katebee")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 6, 30),
    exposeClientSide = true
  )

  val ABNewUserAdvertsDisabled = Switch(
    SwitchGroup.ABTests,
    "ab-new-user-adverts-disabled",
    "Enable adfree experience for 3 days for new users",
    owners = Seq(Owner.withGithub("davidfurey")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 7, 1),
    exposeClientSide = true
  )

  val ABParticipationLowFricSportV2 = Switch(
    SwitchGroup.ABTests,
    "ab-participation-low-fric-sport-v2",
    "AB test switch to insert low friction participation into sport",
    owners = Seq(Owner.withGithub("gtrufitt")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 6, 21),
    exposeClientSide = true
  )

  val ABVideoTeaser = Switch(
    SwitchGroup.ABTests,
    "ab-video-teaser",
    "Show video teaser",
    owners = Seq(Owner.withGithub("akash1810")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 6, 17),
    exposeClientSide = true
  )


  val ABVideoNav = Switch(
    SwitchGroup.ABTests,
    "ab-video-nav",
    "Have video in the nav",
    owners = Seq(Owner.withGithub("jamesgorrie")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 6, 15),
    exposeClientSide = true
  )

  val ABVideoMainMediaAlwaysShowcase = Switch(
    SwitchGroup.ABTests,
    "ab-video-main-media-always-showcase",
    "Make video main media always showcase",
    owners = Seq(Owner.withGithub("akash1810")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 6, 14),
    exposeClientSide = true
  )

  val ABVideoFootballThrasher = Switch(
    SwitchGroup.ABTests,
    "ab-video-football-thrasher",
    "Swap video thrashers on football front",
    owners = Seq(Owner.withGithub("jamesgorrie")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 6, 14),
    exposeClientSide = true
  )

  val ABVideoYellowButton = Switch(
    SwitchGroup.ABTests,
    "ab-video-yellow-button",
    "Make big play button yellow",
    owners = Seq(Owner.withGithub("akash1810")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 6, 14),
    exposeClientSide = true
  )

  val ABTestAudience = Switch(
    SwitchGroup.ABTests,
    "ab-test-audience",
    "Test the A/B test samples against page views",
    safeState = Off,
    sellByDate = new LocalDate(2016, 6, 21),
    exposeClientSide = true
  )
}
