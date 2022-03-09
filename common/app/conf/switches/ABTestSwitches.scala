package conf.switches

import conf.switches.SwitchGroup.ABTests
import java.time.LocalDate

trait ABTestSwitches {
  Switch(
    ABTests,
    "ab-sign-in-gate-main-control",
    "Control audience for the sign in gate to 9% audience. Will never see the sign in gate.",
    owners = Seq(Owner.withGithub("coldlink")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2022, 12, 1)),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-sign-in-gate-main-variant",
    "Show sign in gate to 90% of users on 3rd article view, variant/full audience",
    owners = Seq(Owner.withGithub("coldlink")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2022, 12, 1)),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-spacefinder-okr-3-rich-links",
    "Check whether ignoring rich links in spacefinder on desktop leads to revenue uplift",
    owners = Seq(Owner.withGithub("simonbyford")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2022, 4, 1)),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-spacefinder-okr-mega-test",
    "Check whether all changes made this quarter when combined lead to revenue uplift",
    owners = Seq(Owner.withGithub("simonbyford")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2022, 5, 2)),
    exposeClientSide = true,
  )
}
