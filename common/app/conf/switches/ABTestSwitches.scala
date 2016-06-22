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

  val ABParticipationDiscussionTest = Switch(
    SwitchGroup.ABTests,
    "ab-participation-discussion-test",
    "We are going to hide comments on a random half of articles",
    owners = Seq(Owner.withGithub("NathanielBennett")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 7, 25),
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

  val ABVideoFootballThrasher = Switch(
    SwitchGroup.ABTests,
    "ab-video-football-thrasher",
    "Swap video thrashers on football front",
    owners = Seq(Owner.withGithub("blongden73")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 6, 28), // Tuesday
    exposeClientSide = true
  )

  val ABVideoYellowButton = Switch(
    SwitchGroup.ABTests,
    "ab-video-yellow-button",
    "Make big play button yellow",
    owners = Seq(Owner.withGithub("akash1810")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 6, 27), // Tuesday
    exposeClientSide = true
  )

}
