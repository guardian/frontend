package conf.switches

import org.joda.time.LocalDate

trait ABTestSwitches {

  val ABLiveBlogChromeNotificationsInternal = Switch(
    SwitchGroup.ABTests,
    "ab-live-blog-chrome-notifications-internal",
    "Live blog chrome notifications - Internal",
    owners = Seq(Owner.withGithub("desbo")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 8, 31),
    exposeClientSide = true
  )

  val ABLiveBlogChromeNotificationsProd = Switch(
    SwitchGroup.ABTests,
    "ab-live-blog-chrome-notifications-prod",
    "Live blog chrome notifications - prod",
    owners = Seq(Owner.withGithub("NathanielBennett")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 8, 31),
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

  val ABJoinDiscussionAfterPoll = Switch(
    SwitchGroup.ABTests,
    "ab-join-discussion-after-poll",
    "Does 'join discussion' message after poll participation increase comments",
    owners = Seq(Owner.withGithub("GHaberis")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 7, 13),
    exposeClientSide = true
  )

  val ABSamplingTest = Switch(
    SwitchGroup.ABTests,
    "ab-sampling-test",
    "Tests the sampling",
    owners = Seq(Owner.withGithub("davidfurey")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 7, 22),
    exposeClientSide = true
  )

  val ABHostedAutoplay = Switch(
    SwitchGroup.ABTests,
    "ab-hosted-autoplay",
    "An autoplay overlay with the next video on a hosted page",
    owners = Seq(Owner.withGithub("Calanthe")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 7, 14),
    exposeClientSide = true
  )

  val giraffe = Switch(
    SwitchGroup.ABTests,
    "ab-giraffe",
    "Test effectiveness of inline CTA for contributions.",
    owners = Seq(Owner.withGithub("markjamesbutler")),
    safeState = On,
    sellByDate = new LocalDate(2016, 7, 1),
    exposeClientSide = true
  )
}
