package conf.switches

import conf.switches.SwitchGroup.ABTests
import org.joda.time.LocalDate

trait ABTestSwitches {
  Switch(
    ABTests,
    "ab-sign-in-gate-main-control",
    "Control audience for the sign in gate to 9% audience. Will never see the sign in gate.",
    owners = Seq(Owner.withGithub("coldlink")),
    safeState = Off,
    sellByDate = new LocalDate(2021, 12, 1),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-sign-in-gate-main-variant",
    "Show sign in gate to 90% of users on 3rd article view, variant/full audience",
    owners = Seq(Owner.withGithub("coldlink")),
    safeState = Off,
    sellByDate = new LocalDate(2021, 12, 1),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-sign-in-gate-copy-opt",
    "Compare 6 different sign-in gate copy updates",
    owners = Seq(Owner.withGithub("rebecca-thompson")),
    safeState = Off,
    sellByDate = new LocalDate(2021, 12, 1),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-deeply-read-test",
    "Tests an onward hypothesis by replacing the second tab in the Most Popular container with deeply read items.",
    owners = Seq(Owner.withGithub("nitro-marky")),
    safeState = Off,
    sellByDate = new LocalDate(2021, 4, 1),
    exposeClientSide = true,
  )

}
