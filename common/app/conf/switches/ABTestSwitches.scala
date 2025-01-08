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
    "ab-ad-block-ask",
    "Show new ad block ask component in ad slots when we detect ad blocker usage",
    owners = Seq(Owner.withEmail("commercial.dev@theguardian.com")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2025, 2, 24)),
    exposeClientSide = true,
    highImpact = false,
  )

  Switch(
    ABTests,
    "ab-opt-out-frequency-cap",
    "Test the Opt Out frequency capping feature",
    owners = Seq(Owner.withEmail("commercial.dev@theguardian.com")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2025, 1, 29)),
    exposeClientSide = true,
    highImpact = false,
  )

  Switch(
    ABTests,
    "ab-gpid-prebid-ad-units",
    "Test new GPID prebid ad units",
    owners = Seq(Owner.withEmail("commercial.dev@theguardian.com")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2025, 1, 17)),
    exposeClientSide = true,
    highImpact = false,
  )

  Switch(
    ABTests,
    "ab-region-specific-prebid",
    "Test impact of splitting the Prebid bundle by region",
    owners = Seq(Owner.withEmail("commercial.dev@theguardian.com")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2025, 1, 24)),
    exposeClientSide = true,
    highImpact = false,
  )
}
