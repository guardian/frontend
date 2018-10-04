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

  val IdentityNewsletterRecaptchaSwitch = Switch(
    SwitchGroup.Identity,
    "id-newsletter-recaptcha",
    "If switched on, newsletter widgets will trigger a recaptcha.",
    owners = Seq(Owner.withGithub("walaura")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val IdentityEmailSignInUpsellSwitch = Switch(
    SwitchGroup.Identity,
    "id-email-sign-in-upsell",
    "If switched on, users coming from newsletters will get prompts to sign in.",
    owners = Seq(Owner.withGithub("walaura")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 10, 24),
    exposeClientSide = true
  )

  val IdentityUseFollowSwitches = Switch(
    SwitchGroup.Identity,
    "id-use-follow-switches",
    "If switched on, access to the new consent journeys will be enabled.",
    owners = Owner.group(SwitchGroup.Identity),
    safeState = Off,
    sellByDate = new LocalDate(2018, 10, 24),
    exposeClientSide = false
  )

}
