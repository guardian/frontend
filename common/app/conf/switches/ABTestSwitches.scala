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
    "ab-sign-in-gate-alternative-wording",
    "Test different messages on the sign in gate",
    owners = Seq(Owner.withGithub("raphaelkabo")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2025, 12, 1)),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-mpu-when-no-epic",
    "Test MPU when there is no epic at the end of Article on the page.",
    owners = Seq(Owner.withEmail("commercial.dev@theguardian.com")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2024, 3, 29)),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-section-ad-density",
    "Increase inline advert density on article pages in high value sections.",
    owners = Seq(Owner.withEmail("commercial.dev@theguardian.com")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2024, 7, 26)),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-block-supporter-revenue-messaging-sport",
    "Block supporter revenue messaging in the Sport section",
    owners = Seq(Owner.withEmail("commercial.dev@theguardian.com")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2024, 5, 31)),
    exposeClientSide = true,
  )
}
