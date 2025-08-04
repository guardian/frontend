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
    "ab-admiral-adblock-recovery",
    "Testing the Admiral integration for adblock recovery on theguardian.com",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2025, 8, 29)),
    exposeClientSide = true,
    highImpact = false,
  )

  Switch(
    ABTests,
    "ab-prebid-ad-unit",
    "Test grouping slots to be used by PrebidAdUnit to allow full benefits of bidCache in Prebid",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2025, 8, 12)),
    exposeClientSide = true,
    highImpact = false,
  )

  Switch(
    ABTests,
    "ab-google-one-tap",
    "This test is being used to prototype and roll out single sign-on with Google One Tap.",
    owners = Seq(Owner.withEmail("identity.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2025, 12, 1)),
    exposeClientSide = true,
    highImpact = false,
  )
}
