package conf.switches

<<<<<<< Updated upstream
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

  val Okta = Switch(
    group = SwitchGroup.Identity,
    name = "okta",
    description = "Use Okta for authentication",
    owners = Seq(Owner.withGithub("@guardian/dotcom-platform")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )
}
=======
trait IdentitySwitches {}
>>>>>>> Stashed changes
