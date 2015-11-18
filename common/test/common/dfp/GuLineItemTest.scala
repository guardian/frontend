package common.dfp

import common.dfp.AdSize.leaderboardSize
import org.joda.time.DateTime
import org.scalatest.{FlatSpec, Matchers}

class GuLineItemTest extends FlatSpec with Matchers {

  private val defaultCreativePlaceholders =
    Seq(GuCreativePlaceholder(leaderboardSize, targeting = None))

  private val defaultTargeting = targeting(Seq(
    GuAdUnit("id", Seq("theguardian.com")),
    GuAdUnit("id", Seq("theguardian.com", "business", "front"))
  ))

  private def targeting(adUnits: Seq[GuAdUnit]): GuTargeting = {
    GuTargeting(
      adUnits,
      geoTargetsIncluded = Seq(GeoTarget(1, None, "COUNTRY", "Australia")),
      geoTargetsExcluded = Nil,
      customTargetSets = Nil
    )
  }

  private def lineItem(creativePlaceholders: Seq[GuCreativePlaceholder] =
                       defaultCreativePlaceholders,
                       costType: String = "CPD",
                       targeting: GuTargeting = defaultTargeting): GuLineItem = {
    GuLineItem(id = 0,
      name = "name",
      startTime = DateTime.now(),
      endTime = None,
      isPageSkin = false,
      sponsor = None,
      status = "status",
      costType,
      creativePlaceholders,
      targeting,
      lastModified = DateTime.now())
  }

  "isSuitableForTopAboveNavSlot" should
    "be true for a line item that meets all the rules" in {
    lineItem() shouldBe 'suitableForTopAboveNavSlot
  }

  it should
    "be true for a line item that has relevant creative targeting" in {
    val creativePlaceholders =
      Seq(GuCreativePlaceholder(leaderboardSize, targeting = Some(defaultTargeting)))
    lineItem(creativePlaceholders) shouldBe 'suitableForTopAboveNavSlot
  }

  it should "be false for a section front targeted indirectly" in {
    val target = targeting(Seq(GuAdUnit("id", Seq("theguardian.com"))))
    lineItem(targeting = target) should not be 'suitableForTopAboveNavSlot
  }

  it should "be false for an untargeted section front" in {
    val target = targeting(Seq(GuAdUnit("id", Seq("theguardian.com", "politics"))))
    lineItem(targeting = target) should not be 'suitableForTopAboveNavSlot
  }

  it should "be false for a front whose section is targeted but front not targeted directly" in {
    val target = targeting(Seq(GuAdUnit("id", Seq("theguardian.com", "business"))))
    lineItem(targeting = target) should not be 'suitableForTopAboveNavSlot
  }

  it should "be false for a CPM campaign" in {
    lineItem(costType = "CPM") should not be 'suitableForTopAboveNavSlot
  }
}
