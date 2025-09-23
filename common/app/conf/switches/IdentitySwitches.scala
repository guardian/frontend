package conf.switches

import conf.switches.Expiry.never

trait IdentitySwitches {

  val IdentityCookieRefreshSwitch = Switch(
    SwitchGroup.Identity,
    "id-cookie-refresh",
    "If switched on, users cookies will be refreshed.",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val consentOrPayEurope = Switch(
    SwitchGroup.Identity,
    "consent-or-pay-europe",
    "Releasing Consent or Pay to Europe",
    owners = Seq(Owner.withEmail("dotcom.platform@theguardian.com")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )
}
