package model

import conf.switches.Switches

object AffiliateProductLivePricing {
  def isEnabledForPage(livePricingEnabled: Option[Boolean]): Boolean =
    livePricingEnabled.contains(true) && Switches.AffiliateProductLivePricing.isSwitchedOn
}
