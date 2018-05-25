package conf.switches

import conf.switches.Expiry.never
import org.joda.time.LocalDate

trait IdentitySwitches {

  val IdentityCookieRefreshSwitch = Switch(
    SwitchGroup.Identity,
    "id-cookie-refresh",
    "If switched on, users cookies will be refreshed.",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val IdentityAdConsentsSwitch = Switch(
    SwitchGroup.Identity,
    "id-ad-consents",
    "If switched on, replaces the cookie banner.",
    owners = Seq(Owner.withGithub("walaura")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 6, 25), // GDPR goes into effect + 1 month
    exposeClientSide = true
  )

}
