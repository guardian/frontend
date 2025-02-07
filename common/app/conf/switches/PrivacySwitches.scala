package conf.switches

import conf.switches.Expiry.never
import conf.switches.Owner.group
import conf.switches.SwitchGroup.Commercial

trait PrivacySwitches {

  val ConsentManagement = Switch(
    SwitchGroup.Privacy,
    "consent-management",
    "Enable consent management.",
    owners = group(Commercial),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = true,
    impactShortMessage = Some("Critical for for advertising and SR!"),
    impactFullMessage = Some(
      "Warning: Requires ExCo sign-off. Disabling this switch will cost £160,000/day in ad-revenue, impact marketing, impact reader revenue...",
    ),
  )

  val ConsentOrPay = Switch(
    group = SwitchGroup.Feature,
    name = "consent-or-pay",
    description = "Enable consent or pay logic",
    owners =
      Seq(Owner.withEmail("Transparency.and.consent@guardian.co.uk"), Owner.withEmail("identitydev@guardian.co.uk")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = true,
  )
}
