package conf.switches

import conf.switches.Expiry.never
import conf.switches.Owner.group
import conf.switches.SwitchGroup.{Privacy, Commercial}

trait PrivacySwitches {

  val ConsentManagement = Switch(
    SwitchGroup.Privacy,
    "consent-management",
    "Enable consent management.",
    owners = group(Commercial),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
  )

  val AuConsent = Switch(
    SwitchGroup.Privacy,
    "au-consent",
    "Enable consent management for Australia.",
    owners = group(Commercial),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
  )
}
