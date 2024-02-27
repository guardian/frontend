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
  )

  Switch(
    ABTests,
    "ab-sign-in-gate-main-variant",
    "Show sign in gate to 90% of users on 3rd article view, variant/full audience",
    owners = Seq(Owner.withGithub("coldlink")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2025, 12, 1)),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-sign-in-gate-guardian-live-offer",
    "Show the Guardian Live offer sign in gate",
    owners = Seq(Owner.withGithub("raphaelkabo")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2025, 12, 1)),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-sign-in-gate-saturday-edition-offer",
    "Show the Saturday Edition offer sign in gate",
    owners = Seq(Owner.withGithub("raphaelkabo")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2025, 12, 1)),
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

  Switch(
    ABTests,
    "ab-integrate-ima",
    "Test the commercial impact of replacing YouTube ads with Interactive Media Ads on first-party videos",
    owners = Seq(Owner.withGithub("commercial.dev@theguardian.com")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2024, 2, 28)),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-prebid-kargo",
    "Test Kargo as a prebid bidder for US traffic.",
    owners = Seq(Owner.withEmail("commercial.dev@theguardian.com")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2024, 2, 29)),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-mpu-when-no-epic",
    "Test MPU when there is no epic at the end of Article on the page.",
    owners = Seq(Owner.withEmail("commercial.dev@theguardian.com")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2024, 2, 29)),
    exposeClientSide = true,
  )
}
