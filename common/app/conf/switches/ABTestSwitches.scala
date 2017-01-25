package conf.switches

import common.editions._
import conf.switches.SwitchGroup.ABTests
import org.joda.time.LocalDate

trait ABTestSwitches {

  for ((edition, testId) <- Map(
    Uk -> "ab-membership-engagement-banner-uk-test13",
    International -> "ab-membership-engagement-international-experiment-test12",
    Au -> "ab-au-memb-engagement-msg-copy-test8"
  )) Switch(
    SwitchGroup.ABTests,
    testId,
    s"Test effectiveness of engagement banners in the $edition edition for driving Membership & Contributions.",
    owners = Seq(Owner.withGithub("rtyley")),
    safeState = On,
    sellByDate = new LocalDate(2017, 9, 8), // we'll be doing AB tests on this for a long time, don't want to break the build
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-editorial-email-variants",
    "Assign users to variants of our editorial emails",
    owners = Seq(Owner.withGithub("davidfurey")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 2, 16),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-opinion-email-variants",
    "Assign users to variants of opinion emails",
    owners = Seq(Owner.withGithub("davidfurey")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 2, 8),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-recommended-for-you-recommendations",
    "Test personalised container on fronts",
    owners = Seq(Owner.withGithub("davidfurey")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 2, 21),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-contributions-epic-brexit",
    "Test whether we get a positive effect on membership/contribution by targeting the latest brexit articles",
    owners = Seq(Owner.withGithub("alexduf")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 3, 1),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-contributions-epic-always-ask-strategy",
    "Test to assess the effects of always asking readers to contribute via the Epic over a prolonged period",
    owners = Seq(Owner.withGithub("Mullefa")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 2, 6),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-contributions-epic-ask-four-stagger",
    "Test to see if imposing a minimum-time-between-impressions for the epic has a positive effect on conversion",
    owners = Seq(Owner.withGithub("jranks123")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 2, 24),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-contributions-epic-ask-four-earning",
    "This places the epic on all articles for all users, with a limit of 4 impressions in any given 30 days",
    owners = Seq(Owner.withGithub("jranks123")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 5, 1),
    exposeClientSide = true
  )
}
