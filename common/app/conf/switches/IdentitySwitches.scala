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
    "If switched on, users will post GDPR compliant marketing consent from 'Edit Profile' page",
    owners = Seq(Owner.withGithub("mario-galic")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 1, 1),
    exposeClientSide = false
  )

  val IdentityAllowAccessToGdprJourneyPageSwitch = Switch(
    SwitchGroup.Identity,
    "id-allow-access-to-gdpr-journey-page",
    "If switched on, users will be able to access the /repermission endpoint",
    owners = Seq(Owner.withGithub("walaura")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 1, 1),
    exposeClientSide = false
  )

  val IdentityPointToConsentJourneyPage = Switch(
    SwitchGroup.Identity,
    "id-point-to-consent-journey-page",
    "If switched on, public facing links will redirect to journey page",
    owners = Seq(Owner.withGithub("calum-campbell")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 1, 15),
    exposeClientSide = false

  )

  val IdentityRedirectUsersWithLingeringV1ConsentsSwitch = Switch(
    SwitchGroup.Identity,
    "id-redirect-users-with-lingering-v1-consents",
    "If switched on, users trying to reach /email-prefs will go to /consent to repermission",
    owners = Seq(Owner.withGithub("walaura")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 1, 15),
    exposeClientSide = false
  )

  val IdentityShowCommunicationChannelConsents = Switch(
    SwitchGroup.Identity,
    "id-show-communication-channel-consents",
    "If switched on, users will see UI for opting in or out of different communication channels",
    owners = Seq(Owner.withGithub("walaura")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 1, 15),
    exposeClientSide = false
  )
}
