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
    highImpact = false,
  )

  val ManyNewsletterVisibleRecaptcha = Switch(
    SwitchGroup.Newsletters,
    "many-newsletter-visible-recaptcha",
    "Shows a visible rather than invisible reCAPTCHA when signing up on the All Newsletters page",
    owners = Seq(Owner.withEmail("newsletters.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val NewslettersRemoveConfirmationStep = Switch(
    SwitchGroup.Newsletters,
    "newsletters-remove-confirmation-step",
    "Remove confirmation step when user sign up to a newsletter",
    owners = Seq(Owner.withEmail("newsletters.dev@guardian.co.uk")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false,
    highImpact = false,
  )

  val ShowNewPrivacyWordingOnEmailSignupEmbeds = Switch(
    SwitchGroup.Newsletters,
    "show-new-privacy-wording-on-email-signup-embeds",
    "Show new privacy wording on email signup embeds",
    owners = Seq(Owner.withEmail("newsletters.dev@guardian.co.uk")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val ValidateEmailSignupRecaptchaTokens = Switch(
    SwitchGroup.Newsletters,
    "validate-email-signup-recaptcha-tokens",
    "Enables validation of reCAPTCHA tokens on email signup submissions",
    owners = Seq(Owner.withEmail("newsletters.dev@guardian.co.uk")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false,
    highImpact = false,
  )

  val UseDcrNewslettersPage = Switch(
    SwitchGroup.Newsletters,
    "use-dcr-newsletters-page",
    "Use the dcr rendered version of the email newsletters page by default",
    owners = Seq(Owner.withEmail("newsletters.dev@guardian.co.uk")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false,
    highImpact = false,
  )
}
