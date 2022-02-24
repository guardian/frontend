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
    "ab-spacefinder-okr-1-filter-nearby",
    "Check whether fixing a bug in spacefinder's nearby candidate filtering mechanism leads to revenue uplift",
    owners = Seq(Owner.withGithub("simonbyford")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2022, 3, 7)),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-spacefinder-okr-2-images-loaded",
    "Check whether fixing spacefinder's ability to detect when images have loaded leads to revenue uplift",
    owners = Seq(Owner.withGithub("simonbyford")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2022, 2, 28)),
    exposeClientSide = true,
  )
}
