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
    sellByDate = Some(LocalDate.of(2022, 12, 12)),
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
    sellByDate = Some(LocalDate.of(2022, 12, 30)),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-remove-prebid-a9-canada",
    "Remove the initialisation of Prebid and A9 in the Canada region",
    owners = Seq(Owner.withGithub("domlander")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2023, 1, 31)),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-liveblog-desktop-outstream",
    "Test the impact of enabling outstream on inline2+ on liveblogs on desktop",
    owners = Seq(Owner.withEmail("commercial.dev@theguardian.com")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2023, 1, 31)),
    exposeClientSide = true,
  )
}
