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
    sellByDate = Some(LocalDate.of(2025, 12, 1)),
    exposeClientSide = true,
    highImpact = false,
  )

  Switch(
    ABTests,
    "ab-sign-in-gate-main-variant",
    "Show sign in gate to 90% of users on 3rd article view, variant/full audience",
    owners = Seq(Owner.withGithub("coldlink")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2025, 12, 1)),
    exposeClientSide = true,
    highImpact = false,
  )

  Switch(
    ABTests,
    "ab-auxia-sign-in-gate",
    "Experimental use of Auxia to drive the client-side SignIn gate",
    owners = Seq(Owner.withEmail("growth@guardian.co.uk")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2026, 1, 30)),
    exposeClientSide = true,
    highImpact = false,
  )

  Switch(
    ABTests,
    "ab-defer-permutive-load",
    "Test the impact of deferring the Permutive script load",
    owners = Seq(Owner.withEmail("commercial.dev@theguardian.com")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2025, 3, 28)),
    exposeClientSide = true,
    highImpact = false,
  )

  Switch(
    ABTests,
    "ab-prebid-bid-cache",
    "Test the impact of enabling prebid bid caching",
    owners = Seq(Owner.withEmail("commercial.dev@theguardian.com")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2025, 3, 28)),
    exposeClientSide = true,
    highImpact = false,
  )

  Switch(
    ABTests,
    "ab-the-trade-desk",
    "Test the impact of disabling the trade desk for some of our users",
    owners = Seq(Owner.withEmail("commercial.dev@theguardian.com")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2025, 3, 28)),
    exposeClientSide = true,
    highImpact = false,
  )
}
