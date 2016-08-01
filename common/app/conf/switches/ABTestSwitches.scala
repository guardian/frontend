package conf.switches

import org.joda.time.LocalDate

trait ABTestSwitches {

  val ABLiveBlogChromeNotificationsProd2 = Switch(
    SwitchGroup.ABTests,
    "ab-live-blog-chrome-notifications-prod2",
    "Live blog chrome notifications - prod",
    owners = Seq(Owner.withGithub("NathanielBennett")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 8, 31),
    exposeClientSide = true
  )

  val ABHostedAutoplay = Switch(
    SwitchGroup.ABTests,
    "ab-hosted-autoplay",
    "An autoplay overlay with the next video on a hosted page",
    owners = Seq(Owner.withGithub("Calanthe")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 8, 12),
    exposeClientSide = true
  )

  val giraffe = Switch(
    SwitchGroup.ABTests,
    "ab-giraffe-article",
    "Test effectiveness of inline CTA for contributions.",
    owners = Seq(Owner.withGithub("markjamesbutler"), Owner.withGithub("AWare")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 8, 1),
    exposeClientSide = true
  )

  val ABVideoCaption = Switch(
    SwitchGroup.ABTests,
    "ab-video-caption",
    "Testing if increasing prominence of video caption drives plays.",
    owners = Seq(Owner.withGithub("gidsg")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 8, 3),
    exposeClientSide = true
  )

  val ABHabitFormingDigestPromo = Switch(
    SwitchGroup.ABTests,
    "ab-habit-forming-digest-promo",
    "Show infrequent users a banner offering a curated digest",
    owners = Seq(Owner.withGithub("katebee")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 8, 1),
    exposeClientSide = true
  )

  val ABParticipationDiscussionOrderingTake2 = Switch(
    SwitchGroup.ABTests,
    "ab-participation-discussion-ordering-take-2",
    "Test to see whether ordering comments by recommends increases the number of people who read them",
    owners = Seq(Owner.withGithub("NathanielBennett")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 8, 26),
    exposeClientSide = true
  )
}
