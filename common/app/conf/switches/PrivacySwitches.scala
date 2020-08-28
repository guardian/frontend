package conf.switches

import conf.switches.Expiry.never
import conf.switches.Owner.group
import conf.switches.SwitchGroup.{Privacy, Commercial}

trait PrivacySwitches {

  val Cmp = Switch(
    SwitchGroup.Privacy,
    "consent-management",
    "Enable consent management. Individual frameworks will also need to be switched on.",
    owners = group(Commercial),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
  )

  val TCFv2 = Switch(
    SwitchGroup.Privacy,
    "framework-tcfv2",
    "Enable the TCFv2 framework (if consent-management is on).",
    owners = group(Commercial),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
  )

  val CCPA = Switch(
    SwitchGroup.Privacy,
    "framework-ccpa",
    "Enable the CCPA framework (if consent-management is on).",
    owners = group(Commercial),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
  )
}
