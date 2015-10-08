package common.dfp

import org.joda.time.DateTime
import org.scalatest.{FlatSpec, Matchers}

class GuLineItemTest extends FlatSpec with Matchers {

  private def lineItem(targetedAdUnits: Seq[GuAdUnit]) = {
    val targeting = GuTargeting(targetedAdUnits, Nil, Nil, Nil)
    GuLineItem(id = 0,
      name = "name",
      startTime = DateTime.now(),
      endTime = None,
      isPageSkin = false,
      sponsor = None,
      status = "status",
      costType = "CPM",
      creativePlaceholders = Nil,
      targeting,
      lastModified = DateTime.now())
  }

  "targetsSectionFrontDirectly" should
    "be true for a section front targeted directly" in {
    val targetedAdUnits = Seq(
      GuAdUnit("id", Seq("theguardian.com")),
      GuAdUnit("id", Seq("theguardian.com", "business", "front"))
    )
    lineItem(targetedAdUnits).targetsSectionFrontDirectly("business") shouldBe true
  }

  it should "be false for a section front targeted indirectly" in {
    val targetedAdUnits = Seq(GuAdUnit("id", Seq("theguardian.com")))
    lineItem(targetedAdUnits).targetsSectionFrontDirectly("politics") shouldBe false
  }

  it should "be false for an untargeted section front" in {
    val targetedAdUnits = Seq(GuAdUnit("id", Seq("theguardian.com", "politics")))
    lineItem(targetedAdUnits).targetsSectionFrontDirectly("culture") shouldBe false
  }

  it should "be false for a front whose section is targeted but front not targeted directly" in {
    val targetedAdUnits = Seq(GuAdUnit("id", Seq("theguardian.com", "culture")))
    lineItem(targetedAdUnits).targetsSectionFrontDirectly("culture") shouldBe false
  }
}
