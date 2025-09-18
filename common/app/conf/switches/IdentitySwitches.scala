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

  val GoogleOneTap = Switch(
    SwitchGroup.Identity,
    "google-one-tap-switch",
    "Signing into the Guardian with Google One Tap",
    owners = Seq(Owner.withEmail("identity.dev@theguardian.com")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )
}
