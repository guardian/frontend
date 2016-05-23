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
    sellByDate = new LocalDate(2016, 6, 1),
    exposeClientSide = true
  )

  val ABLiveBlogChromeNotificationsProd = Switch(
    SwitchGroup.ABTests,
    "ab-live-blog-chrome-notifications-prod",
    "Live blog chrome notifications - prod",
    safeState = Off,
    sellByDate = new LocalDate(2016, 6, 1),
    exposeClientSide = true
  )

  val ABLoyalAdblockingSurvey = Switch(
    SwitchGroup.ABTests,
    "ab-loyal-adblocking-survey",
    "An adblock ongoing survey for all loyal users",
    safeState = Off,
    sellByDate = new LocalDate(2016, 5, 31),
    exposeClientSide = true
  )

  val ABParticipationStarRatings = Switch(
    SwitchGroup.ABTests,
    "ab-participation-star-ratings",
    "AB test switch to insert star ratings into film articles",
    safeState = Off,
    sellByDate = new LocalDate(2016, 6, 13),
    exposeClientSide = true
  )

  val ABParticipationLowFricMusic = Switch(
    SwitchGroup.ABTests,
    "ab-participation-low-fric-music",
    "AB test switch to insert low friction participation into music",
    safeState = Off,
    sellByDate = new LocalDate(2016, 6, 15),
    exposeClientSide = true
  )

  val ABParticipationLowFricTv = Switch(
    SwitchGroup.ABTests,
    "ab-participation-low-fric-tv",
    "AB test switch to insert low friction participation into tv",
    safeState = Off,
    sellByDate = new LocalDate(2016, 6, 15),
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

  val ABParticipationHideHalfOfComments = Switch(
    SwitchGroup.ABTests,
    "ab-participation-hide-half-of-comments",
    "We are going to hide comments on a random half of articles",
    safeState = Off,
    sellByDate = new LocalDate(2016, 6, 6),
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

  val ABPlayVideoOnFronts = Switch(
    SwitchGroup.ABTests,
    "ab-play-video-on-fronts",
    "Don't play video on fronts, but auto play when in article",
    safeState = Off,
    sellByDate = new LocalDate(2016, 6, 1),
    exposeClientSide = true
  )

  val ABVideoControlsOnMainMedia = Switch(
    SwitchGroup.ABTests,
    "ab-video-controls-on-main-media",
    "Show video controls on main media.",
    safeState = Off,
    sellByDate = new LocalDate(2016, 5, 26),
    exposeClientSide = true
  )
}
