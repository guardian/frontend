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
    sellByDate = Some(LocalDate.of(2021, 12, 1)),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-sign-in-gate-main-variant",
    "Show sign in gate to 90% of users on 3rd article view, variant/full audience",
    owners = Seq(Owner.withGithub("coldlink")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2021, 12, 1)),
    exposeClientSide = true,
  )

    Switch(
    ABTests,
    "ab-remove-sticky-nav",
    "Remove sticky behaviour from the navigation and subnavigation bar",
    owners = Seq(Owner.withGithub("MarSavar")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2021, 10, 10)),
    exposeClientSide = true,
  )
}
