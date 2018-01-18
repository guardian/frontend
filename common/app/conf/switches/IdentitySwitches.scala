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

  val IdentityCollectGdprCompliantConsentsSwitch = Switch(
    SwitchGroup.Identity,
    "id-gdpr-marketing-consent",
    "If switched on, GDPR Compliant V2 consents will be collected & users will be promtet to update their V1 consents",
    owners = Seq(Owner.withGithub("mario-galic"), Owner.withGithub("walaura")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 3, 1),
    exposeClientSide = false
  )

  val IdentityShowCommunicationChannelConsents = Switch(
    SwitchGroup.Identity,
    "id-show-communication-channel-consents",
    "If switched on, users will see UI for opting in or out of different communication channels",
    owners = Seq(Owner.withGithub("walaura")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 3, 1),
    exposeClientSide = false
  )

  val IdentityShowOptInEngagementBanner = Switch(
    SwitchGroup.Identity,
    "id-show-opt-in-engagement-banner",
    "If switched on, users coming from newsletters will see UI to opt in to GDPR-compliant marketing",
    owners = Seq(Owner.withGithub("walaura")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 6, 25), // GDPR goes into effect + 1 month
    exposeClientSide = true
  )

}
