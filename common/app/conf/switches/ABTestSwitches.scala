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
    "ab-commercial-partner",
    "Test commercial partner that tracks metrics",
    owners = Seq(Owner.withGithub("mxdvl")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2021, 9, 1)),
    exposeClientSide = true,
  )

  // tests/improve-skins.ts
  Switch(
    ABTests,
    "ab-improve-skins",
    "Serve Improve page skins via Prebid and measure performance",
    owners = Seq(Owner.withGithub("mxdvl")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2021, 8, 17)),
    exposeClientSide = true,
  )
}
