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

  val IdentityEmailSignInUpsellSwitch = Switch(
    SwitchGroup.Identity,
    "id-email-sign-in-upsell",
    "If switched on, users coming from newsletters will get prompts to sign in.",
    owners = Owner.group(SwitchGroup.Identity),
    safeState = Off,
    sellByDate = new LocalDate(2019, 6, 17),
    exposeClientSide = true
  )

  val IdentityEnableUpsellJourneysSwitch = Switch(
    SwitchGroup.Identity,
    "id-enable-upsell-journeys",
    "If switched on, access to the new consent journeys will be enabled.",
    owners = Owner.group(SwitchGroup.Identity),
    safeState = Off,
    sellByDate = new LocalDate(2019, 6, 17),
    exposeClientSide = false
  )

}
