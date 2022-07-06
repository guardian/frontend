package conf.switches

import conf.switches.Expiry.never
import conf.switches.Owner.group

trait NewslettersSwitches {

  val EmailSignupRecaptcha = Switch(
    SwitchGroup.Newsletters,
    "email-signup-recaptcha",
    "Enables showing reCAPTCHA when signing up to email newsletters",
    owners = Seq(Owner.withEmail("newsletters.dev@guardian.co.uk")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
  )

  val NewslettersRemoveConfirmationStep = Switch(
    SwitchGroup.Newsletters,
    "newsletters-remove-confirmation-step",
    "Remove confirmation step when user sign up to a newsletter",
    owners = Seq(Owner.withEmail("newsletters.dev@guardian.co.uk")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false,
  )

  val ShowNewPrivacyWordingOnEmailSignupEmbeds = Switch(
    SwitchGroup.Newsletters,
    "show-new-privacy-wording-on-email-signup-embeds",
    "Show new privacy wording on email signup embeds",
    owners = Seq(Owner.withEmail("newsletters.dev@guardian.co.uk")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
  )

  val ValidateEmailSignupRecaptchaTokens = Switch(
    SwitchGroup.Newsletters,
    "validate-email-signup-recaptcha-tokens",
    "Enables validation of reCAPTCHA tokens on email signup submissions",
    owners = Seq(Owner.withEmail("newsletters.dev@guardian.co.uk")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false,
  )

}
