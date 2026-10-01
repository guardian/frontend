package model

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import conf.switches.Switches
import model.AffiliateProductLivePricing

class AffiliateProductLivePricingTest extends AnyFlatSpec with Matchers {
  "isLivePricingEnabled" should "return false when live pricing switch is off" in {
    Switches.AffiliateProductLivePricing.switchOff()
    AffiliateProductLivePricing.isEnabledForPage("/thefilter/best-widgets") should be(false)
  }
}
