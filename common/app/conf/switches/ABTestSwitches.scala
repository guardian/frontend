package conf.switches

import conf.switches.SwitchGroup.ABTests
import org.joda.time.LocalDate

trait ABTestSwitches {

  Switch(
    ABTests,
    "ab-membership-engagement-international-experiment",
    "Test varying the number of visits before showing the membership engagement banner",
    owners = Seq(Owner.withGithub("rupert.bates")),
    safeState = On,
    sellByDate = new LocalDate(2016, 12, 22), // Thursday 1st December
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
    "ab-contributions-epic-usa-cta-three-way",
    "Test just contributions vs contributions or membership vs just membership in the US",
    owners = Seq(Owner.withGithub("philwills")),
    safeState = Off,
    sellByDate =  new LocalDate(2016, 12, 22),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-uk-memb-engagement-msg-copy-test-10",
    "Test alternate short messages on membership engagement banner",
    owners = Seq(Owner.withGithub("justinpinner")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 12, 22), // Thursday 8th December
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

}
