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
    sellByDate = Some(LocalDate.of(2023, 9, 13)),
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
    sellByDate = Some(LocalDate.of(2023, 11, 30)),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-billboards-in-merch-high",
    "Test the commercial impact of showing billboard adverts in merchandising-high slots",
    owners = Seq(Owner.withEmail("commercial.dev@theguardian.com")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2023, 11, 30)),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-elements-manager",
    "Test serving GEM assets in ad slots on page",
    owners = Seq(Owner.withEmail("commercial.dev@theguardian.com")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2023, 11, 30)),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-sign-in-gate-copy-test-jan-2023",
    "Test the impact of changing the copy in the sign in gate",
    owners = Seq(Owner.withEmail("personalisation@guardian.co.uk")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2023, 10, 2)),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-limit-inline-merch",
    "Test the impact of limiting the eligibility of inline merchandising ad slots",
    owners = Seq(Owner.withEmail("commercial.dev@theguardian.com")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2023, 9, 1)),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-liveblog-right-column-ads",
    "Test the commercial impact of different strategies for displaying ads in the right column on liveblog pages.",
    owners = Seq(Owner.withEmail("commercial.dev@theguardian.com")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2023, 9, 20)),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-public-good-test",
    "Test public good at the end of article pages.",
    owners = Seq(Owner.withEmail("commercial.dev@theguardian.com")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2023, 8, 30)),
    exposeClientSide = true,
  )
}
