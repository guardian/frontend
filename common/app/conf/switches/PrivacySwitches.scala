package conf.switches

import conf.switches.Expiry.never
import conf.switches.Owner.group
import conf.switches.SwitchGroup.{Privacy, Commercial}

trait PrivacySwitches {

  val Cmp = Switch(
    SwitchGroup.Privacy,
    "consent-management",
    "Enable consent management.",
    owners = group(Commercial),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
  )
}
