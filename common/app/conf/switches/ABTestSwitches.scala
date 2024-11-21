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
    sellByDate = Some(LocalDate.of(2024, 12, 2)),
    exposeClientSide = true,
    highImpact = false,
  )

  Switch(
    ABTests,
    "ab-usa-expandable-marketing-card",
    "Test the impact of showing the user a component that highlights the Guardians journalism",
    owners = Seq(Owner.withEmail("dotcom.platform@guardian.co.uk")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2025, 1, 29)),
    exposeClientSide = true,
    highImpact = false,
  )

  Switch(
    ABTests,
    "ab-onwards-content-article",
    "Test the impact of showing the galleries onwards content component on article pages",
    owners = Seq(Owner.withEmail("dotcom.platform@guardian.co.uk")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2025, 1, 29)),
    exposeClientSide = true,
    highImpact = false,
  )

  Switch(
    ABTests,
    "ab-new-header-bidding-endpoint",
    "Test new header bidding (prebid) analytics endpoint",
    owners = Seq(Owner.withEmail("commercial.dev@theguardian.com")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2024, 12, 2)),
    exposeClientSide = true,
    highImpact = false,
  )
  Switch(
    ABTests,
    "ab-gpid-prebid-ad-units",
    "Test new GPID prebid ad units",
    owners = Seq(Owner.withEmail("commercial.dev@theguardian.com")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2024, 12, 18)),
    exposeClientSide = true,
    highImpact = false,
  )
}
