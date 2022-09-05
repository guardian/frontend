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
    owners = Seq(Owner.withEmail("commercial.dev@theguardian.com")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )

}
