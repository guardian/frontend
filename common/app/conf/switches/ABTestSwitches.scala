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
    "ab-deeply-read-article-footer",
    "Test whether adding deeply read articles have negative impact on recirculation",
    owners = Seq(Owner.withName("dotcom.platform")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2023, 2, 13)),
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
    owners = Seq(Owner.withGithub("zekehuntergreen")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2023, 4, 4)),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-billboards-in-merch",
    "Test the commercial impact of showing billboard adverts in merchandising slots",
    owners = Seq(Owner.withEmail("commercial.dev@theguardian.com")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2023, 3, 30)),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-no-carrot-ads-near-newsletter-signup-blocks",
    "Test the impact of preventing spacefinder from positioning carrot ads near newsletter signup blocks",
    owners = Seq(Owner.withEmail("commercial.dev@theguardian.com")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2023, 4, 4)),
    exposeClientSide = true,
  )
}
