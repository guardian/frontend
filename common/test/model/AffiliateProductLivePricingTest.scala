package model

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import conf.switches.Switches
import model.AffiliateProductLivePricing

class AffiliateProductLivePricingTest extends AnyFlatSpec with Matchers {
  "isEnabledForPage" should "return false when the content flag is absent" in {
    Switches.AffiliateProductLivePricing.switchOn()
    AffiliateProductLivePricing.isEnabledForPage(None) should be(false)
  }

  it should "return false when the content flag is false" in {
    Switches.AffiliateProductLivePricing.switchOn()
    AffiliateProductLivePricing.isEnabledForPage(Some(false)) should be(false)
  }

  it should "return false when the switch is off" in {
    Switches.AffiliateProductLivePricing.switchOff()
    AffiliateProductLivePricing.isEnabledForPage(Some(true)) should be(false)
  }

  it should "return true when the content flag and switch are on" in {
    Switches.AffiliateProductLivePricing.switchOn()
    AffiliateProductLivePricing.isEnabledForPage(Some(true)) should be(true)
  }
}
