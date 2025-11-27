package conf.switches

import conf.switches.SwitchGroup.ABTests
import java.time.LocalDate
import conf.switches.Expiry.never

trait ABTestSwitches {
  Switch(
    ABTests,
    "ab-no-auxia-sign-in-gate",
    "Defines a control group who should not have sign-in gate journeys handled by Auxia",
    owners = Seq(Owner.withEmail("growth@guardian.co.uk")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2027, 11, 1)),
    exposeClientSide = true,
    highImpact = false,
  )

  Switch(
    ABTests,
    "ab-admiral-adblock-recovery",
    "Testing the Admiral integration for adblock recovery on theguardian.com",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2026, 1, 21)),
    exposeClientSide = true,
    highImpact = false,
  )

  Switch(
    ABTests,
    "ab-personalised-highlights",
    "Allow personalised highlights to be shown on the front page",
    owners = Seq(Owner.withEmail("fronts.and.curation@guardian.co.uk")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2025, 12, 4)),
    exposeClientSide = true,
    highImpact = false,
  )
}
