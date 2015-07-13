package views.support

import conf.Switches._
import model.MetaData
import org.scalatest.{BeforeAndAfterEach, FlatSpec, Matchers, OptionValues}
import views.support.Commercial.topAboveNavSlot

class CommercialTest extends FlatSpec with Matchers with OptionValues with BeforeAndAfterEach {

  private def metaDataFromId(pageId: String): MetaData = new model.MetaData {
    override def id: String = pageId
    override def section: String = "section"
    override def analyticsName: String = "analyticsName"
    override def webTitle: String = "webTitle"
  }

  def pageShouldHaveAdSizes(pageId: String, sizes: Seq[String]): Unit = {
    FixedTopAboveNavAdSlotSwitch.switchOn()
    val metaData = metaDataFromId(pageId)
    topAboveNavSlot.adSizes(metaData).get("desktop").value shouldBe sizes
  }

  override protected def beforeEach(): Unit = {
    FixedTopAboveNavAdSlotSwitch.switchOff()
    TopAboveNavAdSlot728x90Switch.switchOff()
    TopAboveNavAdSlot88x70Switch.switchOff()
    TopAboveNavAdSlotOmitSwitch.switchOff()
  }

  "topAboveNavSlot ad sizes" should "be fixed for UK network front" in {
    pageShouldHaveAdSizes("uk", Seq("1,1", "900,250", "970,250"))
  }

  they should "be variable for any other page" in {
    pageShouldHaveAdSizes("us", Seq("1,1", "88,70", "728,90", "940,230", "900,250", "970,250"))
    pageShouldHaveAdSizes("uk/culture",
      Seq("1,1", "88,70", "728,90", "940,230", "900,250", "970,250"))
    pageShouldHaveAdSizes(
      "business/2015/jul/07/eurozone-calls-on-athens-to-get-serious-over-greece-debt-crisis",
      Seq("1,1", "88,70", "728,90", "940,230", "900,250", "970,250"))
  }

  "topAboveNavSlot css classes" should
    "be large for 900x250 or 970x250 ad on UK network front" in {
    FixedTopAboveNavAdSlotSwitch.switchOn()
    topAboveNavSlot.cssClasses(metaDataFromId("uk")) should
      endWith("top-banner-ad-container--large")
  }

  they should "be medium for 728x90 ad on UK network front" in {
    FixedTopAboveNavAdSlotSwitch.switchOn()
    TopAboveNavAdSlot728x90Switch.switchOn()
    topAboveNavSlot.cssClasses(metaDataFromId("uk")) should
      endWith("top-banner-ad-container--medium")
  }

  they should "be large for 88x70 ad on UK network front" in {
    FixedTopAboveNavAdSlotSwitch.switchOn()
    TopAboveNavAdSlot88x70Switch.switchOn()
    topAboveNavSlot.cssClasses(metaDataFromId("uk")) should
      endWith("top-banner-ad-container--large")
  }

  they should "be default for any other page" in {
    FixedTopAboveNavAdSlotSwitch.switchOn()
    topAboveNavSlot.cssClasses(metaDataFromId("us")) should
      endWith("top-banner-ad-container--reveal")
    topAboveNavSlot.cssClasses(metaDataFromId("uk/culture")) should
      endWith("top-banner-ad-container--reveal")
    topAboveNavSlot.cssClasses(metaDataFromId(
      "business/2015/jul/07/eurozone-calls-on-athens-to-get-serious-over-greece-debt-crisis"))
      .should(endWith("top-banner-ad-container--reveal"))
  }

  "topAboveNavSlot show" should "be false for 1x1 ad on UK network front" in {
    FixedTopAboveNavAdSlotSwitch.switchOn()
    TopAboveNavAdSlotOmitSwitch.switchOn()
    topAboveNavSlot.hasAd(metaDataFromId("uk")) shouldBe false
  }

  it should "be true for non-1x1 ad on UK network front" in {
    FixedTopAboveNavAdSlotSwitch.switchOn()
    topAboveNavSlot.hasAd(metaDataFromId("uk")) shouldBe true
  }

  it should "be true for any other page" in {
    FixedTopAboveNavAdSlotSwitch.switchOn()
    TopAboveNavAdSlotOmitSwitch.switchOn()
    topAboveNavSlot.hasAd(metaDataFromId("us")) shouldBe true
  }

  it should "be true when master switch is off" in {
    FixedTopAboveNavAdSlotSwitch.switchOff()
    topAboveNavSlot.hasAd(metaDataFromId("uk")) shouldBe true
  }
}
