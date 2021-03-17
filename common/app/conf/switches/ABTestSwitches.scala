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
    "ab-sign-in-gate-mandatory",
    "Compare mandatory signin gate",
    owners = Seq(Owner.withGithub("quarpt")),
    safeState = Off,
    sellByDate = new LocalDate(2021, 6, 4),
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

  Switch(
    ABTests,
    "ab-sticky-nav-test",
    "Tests sticky nav behaviour",
    owners = Seq(Owner.withGithub("nicl")),
    safeState = Off,
    sellByDate = new LocalDate(2021, 5, 3),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-puzzles-banner",
    "0% A/B test for puzzles banner",
    owners = Seq(Owner.withGithub("lucymonie")),
    safeState = Off,
    sellByDate = new LocalDate(2021, 4, 13),
    exposeClientSide = true,
  )
}
