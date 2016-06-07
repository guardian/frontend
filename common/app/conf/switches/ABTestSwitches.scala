package conf.switches

import org.joda.time.LocalDate

trait ABTestSwitches {

  // Owner: Dotcom Reach
  val ABFrontsOnArticles2 = Switch(
    SwitchGroup.ABTests,
    "ab-fronts-on-articles2",
    "Injects fronts on articles for the test",
    safeState = Off,
    sellByDate = new LocalDate(2016, 7, 5),
    exposeClientSide = true
  )

  val ABLiveBlogChromeNotificationsInternal = Switch(
    SwitchGroup.ABTests,
    "ab-live-blog-chrome-notifications-internal",
    "Live blog chrome notifications - Internal",
    safeState = Off,
    sellByDate = new LocalDate(2016, 7, 4),
    exposeClientSide = true
  )

  val ABLiveBlogChromeNotificationsProd = Switch(
    SwitchGroup.ABTests,
    "ab-live-blog-chrome-notifications-prod",
    "Live blog chrome notifications - prod",
    safeState = Off,
    sellByDate = new LocalDate(2016, 7, 4),
    exposeClientSide = true
  )

  val ABParticipationLowFricRecipes = Switch(
    SwitchGroup.ABTests,
    "ab-participation-low-fric-recipes",
    "AB test switch to insert low friction participation into recipes",
    safeState = Off,
    sellByDate = new LocalDate(2016, 6, 15),
    exposeClientSide = true
  )

  val ABParticipationLowFricFashion = Switch(
    SwitchGroup.ABTests,
    "ab-participation-low-fric-fashion",
    "AB test switch to insert low friction participation into fashion",
    safeState = Off,
    sellByDate = new LocalDate(2016, 6, 15),
    exposeClientSide = true
  )

  val ABCleverFriend = Switch(
    SwitchGroup.ABTests,
    "ab-clever-friend-brexit",
    "Switch to trigger segmentation for clever friend exposure",
    safeState = Off,
    sellByDate = new LocalDate(2016, 7, 29),
    exposeClientSide = true
  )

  val ABWelcomeHeader = Switch(
    SwitchGroup.ABTests,
    "ab-welcome-header",
    "Welcome header for first time users test",
    safeState = Off,
    sellByDate = new LocalDate(2016, 6, 30),
    exposeClientSide = true
  )

  val ABParticipationDiscussionTest = Switch(
    SwitchGroup.ABTests,
    "ab-participation-discussion-test",
    "We are going to hide comments on a random half of articles",
    safeState = Off,
    sellByDate = new LocalDate(2016, 6, 21),
    exposeClientSide = true
  )

  val ABFacebookShareParams = Switch(
    SwitchGroup.ABTests,
    "ab-facebook-share-params",
    "Switch to add a query parameter to the url sent to Facebook when a user clicks the share button",
    safeState = Off,
    sellByDate = new LocalDate(2016, 6, 30),
    exposeClientSide = true
  )

  val ABNewUserAdvertsDisabled = Switch(
    SwitchGroup.ABTests,
    "ab-new-user-adverts-disabled",
    "Enable adfree experience for 3 days for new users",
    safeState = Off,
    sellByDate = new LocalDate(2016, 7, 1),
    exposeClientSide = true
  )

  val ABParticipationLowFricSport = Switch(
    SwitchGroup.ABTests,
    "ab-participation-low-fric-sport",
    "AB test switch to insert low friction participation into sport",
    safeState = Off,
    sellByDate = new LocalDate(2016, 6, 15),
    exposeClientSide = true
  )

  val ABVideoTeaser = Switch(
    SwitchGroup.ABTests,
    "ab-video-teaser",
    "Show video teaser",
    safeState = Off,
    sellByDate = new LocalDate(2016, 6, 17),
    exposeClientSide = true
  )


  val ABVideoNav = Switch(
    SwitchGroup.ABTests,
    "ab-video-nav",
    "Have video in the nav",
    safeState = Off,
    sellByDate = new LocalDate(2016, 6, 15),
    exposeClientSide = true
  )

  val ABVideoMainMediaAlwaysShowcase = Switch(
    SwitchGroup.ABTests,
    "ab-video-main-media-always-showcase",
    "Make video main media always showcase",
    safeState = Off,
    sellByDate = new LocalDate(2016, 6, 14),
    exposeClientSide = true
  )
}
