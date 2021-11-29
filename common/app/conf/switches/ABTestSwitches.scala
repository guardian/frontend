package conf.switches

import conf.switches.SwitchGroup.ABTests
import conf.switches.Owner.group
import java.time.LocalDate
import conf.switches.SwitchGroup.{Commercial}

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
    "ab-prebid-timeout",
    "Vary length of prebid timeout",
    owners = Seq(Owner.withGithub("chrislomaxjones")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2021, 11, 29)),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-integrate-criteo",
    "Integrate Criteo as a Prebid SSP",
    owners = Seq(Owner.withGithub("chrislomaxjones")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2022, 1, 10)),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-integrate-smart",
    "Integrate Smart AdServer as a Prebid SSP",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2022, 1, 10)),
    exposeClientSide = true,
  )
}
