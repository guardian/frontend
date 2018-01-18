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

  val IdentityGdprMarketingConsentSwitch = Switch(
    SwitchGroup.Identity,
    "id-gdpr-marketing-consent",
    "If switched on, UI for enabling V2 marketing+newsletter consents will be shown instead of the V1 one",
    owners = Seq(Owner.withGithub("mario-galic"), Owner.withGithub("walaura")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 2, 1),
    exposeClientSide = false
  )

  val IdentityAllowAccessToGdprJourneyPageSwitch = Switch(
    SwitchGroup.Identity,
    "id-allow-access-to-gdpr-journey-page",
    "If switched on, users will be able to access the Journey page",
    owners = Seq(Owner.withGithub("walaura")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 2, 1),
    exposeClientSide = false
  )

  val IdentityPointToConsentJourneyPage = Switch(
    SwitchGroup.Identity,
    "id-point-to-consent-journey-page",
    "If switched on, several endpoints will redirect qualifying users to the Journey page to repermission",
    owners = Seq(Owner.withGithub("walaura"), Owner.withGithub("calum-campbell")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 2, 1),
    exposeClientSide = false
  )

  val IdentityShowCommunicationChannelConsents = Switch(
    SwitchGroup.Identity,
    "id-show-communication-channel-consents",
    "If switched on, users will see UI for opting in or out of different communication channels",
    owners = Seq(Owner.withGithub("walaura")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 2, 1),
    exposeClientSide = false
  )

  val IdentityShowOptInEngagementBanner = Switch(
    SwitchGroup.Identity,
    "id-show-opt-in-engagement-banner",
    "If switched on, users coming from newsletters will see UI to opt in to GDPR-compliant marketing",
    owners = Seq(Owner.withGithub("walaura")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 4, 1),
    exposeClientSide = true
  )

}
