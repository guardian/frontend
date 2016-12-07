package conf.switches

import conf.switches.SwitchGroup.ABTests
import org.joda.time.LocalDate

trait ABTestSwitches {

  Switch(
    ABTests,
    "ab-its-raining-inline-ads",
    "Display more inline ads on the wide breakpoint",
    owners = Seq(Owner.withGithub("regiskuckaertz")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 12, 14),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-editorial-email-variants",
    "Assign users to variants of our editorial emails",
    owners = Seq(Owner.withGithub("katebee")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 12, 21),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-membership-engagement-international-experiment",
    "Test varying the number of visits before showing the membership engagement banner",
    owners = Seq(Owner.withGithub("rupert.bates")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 1, 16),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-recommended-for-you-recommendations",
    "Test personalised container on fronts",
    owners = Seq(Owner.withGithub("davidfurey")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 1, 10),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-contributions-epic-brexit-supreme",
    "Gather contributions and supporters around Brexit supreme court case",
    owners = Seq(Owner.withGithub("philwills")),
    safeState = Off,
    sellByDate =  new LocalDate(2016, 12, 16),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-uk-memb-engagement-msg-copy-test-10",
    "Test alternate short messages on membership engagement banner",
    owners = Seq(Owner.withGithub("justinpinner")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 12, 22), // Thursday 22nd December
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-au-memb-engagement-msg-copy-test-8",
    "Test alternate short messages on AU membership engagement banner",
    owners = Seq(Owner.withGithub("justinpinner")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 12, 22), // Thursday 22nd December
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-contributions-epic-us-pre-end-of-year",
    "Test which Epic variant to use in the US end of year campaign",
    owners = Seq(Owner.withGithub("Mullefa")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 12, 12),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-contributions-epic-always-ask-strategy",
    "Test to assess the effects of always asking readers to contribute via the Epic over a prolonged period",
    owners = Seq(Owner.withGithub("Mullefa")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 1, 6),
    exposeClientSide = true
  )
}
