package conf.switches

import conf.switches.Expiry.never
import conf.switches.Owner.group
import conf.switches.SwitchGroup.Commercial

trait PrivacySwitches {

  val ConsentManagement = Switch(
    SwitchGroup.Privacy,
    "consent-management",
    "Enable consent management.",
    owners = group(Commercial),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = true,
    impactShortMessage = Some("Critical for for advertising and SR!"),
    impactFullMessage = Some(
      "Warning: Requires ExCo sign-off. Disabling this switch will cost £160,000/day in ad-revenue, impact marketing, impact reader revenue...",
    ),
  )

  val MparticleConsentSync = Switch(
    SwitchGroup.Privacy,
    "mparticle-consent-sync",
    "Enables syncing of browser consent state to mParticle for paid media targeting",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )
}
