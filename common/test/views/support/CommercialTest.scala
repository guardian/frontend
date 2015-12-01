package views.support

import common.Edition
import common.Edition.defaultEdition
import common.dfp.AdSize.{leaderboardSize, responsiveSize}
import common.dfp.{AdSize, AdSlot}
import conf.switches.Switches._
import model.MetaData
import org.scalatest.{BeforeAndAfterEach, FlatSpec, Matchers, OptionValues}
import views.support.Commercial.topAboveNavSlot

class CommercialTest extends FlatSpec with Matchers with OptionValues with BeforeAndAfterEach {

  private def metaDataFromId(pageId: String, adSizes: Seq[AdSize]): MetaData = new model.MetaData {
    override def id: String = pageId
    override def section: String = "section"
    override def analyticsName: String = "analyticsName"
    override def webTitle: String = "webTitle"

    override def sizeOfTakeoverAdsInSlot(slot: AdSlot, edition: Edition): Seq[AdSize] = adSizes
  }

  def pageShouldRequestAdSizes(pageId: String, sizesAvailableForSlot: Seq[AdSize])
                              (sizes: Seq[String]): Unit = {
    val metaData = metaDataFromId(pageId, sizesAvailableForSlot)
    topAboveNavSlot.adSizes(metaData, defaultEdition).get("desktop").value shouldBe sizes
  }

  override protected def beforeEach(): Unit = {
    FixedTopAboveNavAdSlotSwitch.switchOn()
  }

  "topAboveNavSlot ad sizes" should "be variable for all pages" in {
    pageShouldRequestAdSizes("uk/culture", Nil)(
      Seq("1,1", "88,70", "728,90", "940,230", "900,250", "970,250")
    )
    pageShouldRequestAdSizes(
      "business/2015/jul/07/eurozone-calls-on-athens-to-get-serious-over-greece-debt-crisis", Nil)(
        Seq("1,1", "88,70", "728,90", "940,230", "900,250", "970,250")
      )
  }

  "topAboveNavSlot css classes" should
    "be large for 900x250 or 970x250 ad on UK business front" in {
    topAboveNavSlot.cssClasses(metaDataFromId("uk/business", Seq(AdSize(900, 250))),
      defaultEdition) should endWith("top-banner-ad-container--large")
  }

  they should "be small for 728x90 ad on AU business front" in {
    topAboveNavSlot.cssClasses(metaDataFromId("au/business", Seq(leaderboardSize)),
      defaultEdition) should endWith("top-banner-ad-container--small")
  }

  they should "be responsive for 88x70 ad on US business front" in {
    topAboveNavSlot.cssClasses(metaDataFromId("us/business", Seq(responsiveSize)), defaultEdition) should
      endWith("top-banner-ad-container--responsive")
  }

  they should "be default for any other page" in {
    topAboveNavSlot.cssClasses(metaDataFromId("uk/culture", Nil), defaultEdition) should
      endWith("top-banner-ad-container--reveal")
    topAboveNavSlot.cssClasses(metaDataFromId(
      "business/2015/jul/07/eurozone-calls-on-athens-to-get-serious-over-greece-debt-crisis", Nil),
      defaultEdition)
      .should(endWith("top-banner-ad-container--reveal"))
  }
}
