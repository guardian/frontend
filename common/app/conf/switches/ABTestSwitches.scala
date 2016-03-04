package conf.switches

import org.joda.time.LocalDate

trait ABTestSwitches {

  val ABFrontsOnArticles2 = Switch(
    "A/B Tests",
    "ab-fronts-on-articles2",
    "Injects fronts on articles for the test",
    safeState = Off,
    sellByDate = new LocalDate(2016, 4, 1),
    exposeClientSide = true
  )

  val ABIdentityRegisterMembershipStandfirst = Switch(
    "A/B Tests",
    "ab-identity-register-membership-standfirst",
    "Membership registration page variant for Identity",
    safeState = Off,
    sellByDate = new LocalDate(2016, 4, 1),
    exposeClientSide = true
  )

  val ABArticleVideoAutoplay = Switch(
    "A/B Tests",
    "ab-article-video-autoplay",
    "Autoplay embedded videos in article",
    safeState = Off,
    sellByDate = new LocalDate(2016, 3, 21),
    exposeClientSide = true
  )

}
