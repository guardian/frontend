package conf.switches

import conf.switches.SwitchGroup.ABTests
import java.time.LocalDate
import conf.switches.Expiry.never

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
    "ab-sign-in-gate-mandatory-long-test-run-uk",
    "Test run for long mandatory sign in gate trial",
    owners = Seq(Owner.withGithub("vlbee")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2022, 12, 1)),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-sign-in-gate-mandatory-long-test-run-na",
    "Test run for long mandatory sign in gate trial",
    owners = Seq(Owner.withGithub("vlbee")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2022, 12, 1)),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-sign-in-gate-mandatory-long-test-run-aunz",
    "Test run for long mandatory sign in gate trial",
    owners = Seq(Owner.withGithub("vlbee")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2022, 12, 1)),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-sign-in-gate-mandatory-long-test-run-eu",
    "Test run for long mandatory sign in gate trial",
    owners = Seq(Owner.withGithub("vlbee")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2022, 12, 1)),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-deeply-read-article-footer",
    "Test whether adding deeply read articles have negative impact on recirculation",
    owners = Seq(Owner.withName("dotcom.platform")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2022, 10, 10)),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-consentless-ads",
    "Use consentless ad stack rather than consented / standalone",
    owners = Seq(Owner.withName("commercial-dev")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-integrate-ima",
    "Test the commercial impact of replacing YouTube ads with Interactive Media Ads on first-party videos",
    owners = Seq(Owner.withGithub("zekehuntergreen")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2022, 12, 30)),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-shady-pie-click-through",
    "Test the click through rate of the new labs shady pie component",
    owners = Seq(Owner.withGithub("emma-imber")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2022, 10, 25)),
    exposeClientSide = true,
  )
}
