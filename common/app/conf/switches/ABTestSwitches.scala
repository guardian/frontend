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
    "ab-commercial-end-of-quarter-2-test",
    "Check whether all changes made this quarter when combined lead to revenue uplift",
    owners = Seq(Owner.withGithub("chrislomaxjones")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2022, 7, 5)),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-commercial-lazy-load-margin-reloaded",
    "Test various margins at which ads are lazily-loaded in order to find the optimal one",
    owners = Seq(Owner.withGithub("simonbyford")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2022, 7, 11)),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-scroll-depth",
    "Send scroll depth tracking data",
    owners = Seq(Owner.withEmail("dotcom.platform@theguardian.com")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2022, 7, 5)),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-multi-sticky-right-ads",
    "Test the commercial and performance impact of sticky ads in the right column",
    owners = Seq(Owner.withGithub("chrislomaxjones")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2022, 8, 2)),
    exposeClientSide = true,
  )

}
