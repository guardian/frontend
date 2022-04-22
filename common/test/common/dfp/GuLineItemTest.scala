package common.dfp

import common.dfp.AdSize.leaderboardSize
import org.joda.time.DateTime
import org.joda.time.DateTime.now
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class GuLineItemTest extends AnyFlatSpec with Matchers {

  private val defaultCreativePlaceholders =
    Seq(GuCreativePlaceholder(leaderboardSize, targeting = None))

  private val defaultTargeting = targeting(
    Seq(
      GuAdUnit("id", Seq("theguardian.com"), GuAdUnit.ACTIVE),
      GuAdUnit("id", Seq("theguardian.com", "business", "front"), GuAdUnit.ACTIVE),
    ),
  )

  private def targeting(adUnits: Seq[GuAdUnit]): GuTargeting = {
    GuTargeting(
      adUnitsIncluded = adUnits,
      adUnitsExcluded = Nil,
      geoTargetsIncluded = Seq(GeoTarget(1, None, "COUNTRY", "Australia")),
      geoTargetsExcluded = Nil,
      customTargetSets = Nil,
    )
  }

  private def lineItem(
      endTime: Option[DateTime] = None,
      costType: String = "CPD",
      creativePlaceholders: Seq[GuCreativePlaceholder] = defaultCreativePlaceholders,
      targeting: GuTargeting = defaultTargeting,
  ): GuLineItem = {
    GuLineItem(
      id = 0L,
      orderId = 0L,
      name = "name",
      Sponsorship,
      startTime = now,
      endTime,
      isPageSkin = false,
      sponsor = None,
      status = "status",
      costType,
      creativePlaceholders,
      targeting,
      lastModified = now,
    )
  }

  "isSuitableForTopAboveNavSlot" should
    "be true for a line item that meets all the rules" in {
    lineItem() shouldBe 'suitableForTopAboveNavSlot
  }

  it should
    "be true for a line item that has relevant creative targeting" in {
    val creativePlaceholders =
      Seq(GuCreativePlaceholder(leaderboardSize, targeting = Some(defaultTargeting)))
    lineItem(creativePlaceholders = creativePlaceholders) shouldBe 'suitableForTopAboveNavSlot
  }

  it should "be false for a section front targeted indirectly" in {
    val target = targeting(Seq(GuAdUnit("id", Seq("theguardian.com"), GuAdUnit.ACTIVE)))
    lineItem(targeting = target) should not be 'suitableForTopAboveNavSlot
  }

  it should "be false for an untargeted section front" in {
    val target = targeting(Seq(GuAdUnit("id", Seq("theguardian.com", "politics"), GuAdUnit.ACTIVE)))
    lineItem(targeting = target) should not be 'suitableForTopAboveNavSlot
  }

  it should "be false for a front whose section is targeted but front not targeted directly" in {
    val target = targeting(Seq(GuAdUnit("id", Seq("theguardian.com", "business"), GuAdUnit.ACTIVE)))
    lineItem(targeting = target) should not be 'suitableForTopAboveNavSlot
  }

  it should "be false for a CPM campaign" in {
    lineItem(costType = "CPM") should not be 'suitableForTopAboveNavSlot
  }

  it should "be false for a completed campaign" in {
    lineItem(endTime = Some(now.minusDays(1))) should not be 'suitableForTopAboveNavSlot
  }
}
