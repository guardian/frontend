package views.support

import common.Edition
import common.Edition.defaultEdition
import common.dfp.Size
import conf.Switches._
import model.MetaData
import org.scalatest.{BeforeAndAfterEach, FlatSpec, Matchers, OptionValues}
import views.support.Commercial.topAboveNavSlot

class CommercialTest extends FlatSpec with Matchers with OptionValues with BeforeAndAfterEach {

  private def metaDataFromId(pageId: String,
                             adSizes: Option[Seq[Size]]): MetaData = new model.MetaData {
    override def id: String = pageId
    override def section: String = "section"
    override def analyticsName: String = "analyticsName"
    override def webTitle: String = "webTitle"

    override def sizesOfAdInTopAboveNavSlot(edition: Edition): Option[Seq[Size]] = adSizes
  }

  def pageShouldRequestAdSizes(pageId: String, sizesAvailableForSlot: Option[Seq[Size]])
                              (sizes: Seq[String]): Unit = {
    val metaData = metaDataFromId(pageId, sizesAvailableForSlot)
    topAboveNavSlot.adSizes(metaData, defaultEdition).get("desktop").value shouldBe sizes
  }

  override protected def beforeEach(): Unit = {
    FixedTopAboveNavAdSlotSwitch.switchOn()
  }

  "topAboveNavSlot ad sizes" should "be fixed for UK network front" in {
    pageShouldRequestAdSizes("uk", None)(Seq("1,1", "900,250", "970,250"))
  }

  they should "be variable for any other page" in {
    pageShouldRequestAdSizes("uk/culture", None)(
      Seq("1,1", "88,70", "728,90", "940,230", "900,250", "970,250")
    )
    pageShouldRequestAdSizes(
      "business/2015/jul/07/eurozone-calls-on-athens-to-get-serious-over-greece-debt-crisis", None)(
        Seq("1,1", "88,70", "728,90", "940,230", "900,250", "970,250")
      )
  }

  "topAboveNavSlot css classes" should
    "be large for 900x250 or 970x250 ad on UK network front" in {
    topAboveNavSlot.cssClasses(metaDataFromId("uk", Some(Seq(Size(900, 250)))),
      defaultEdition) should endWith("top-banner-ad-container--large")
  }

  they should "be small for 728x90 ad on AU network front" in {
    topAboveNavSlot.cssClasses(metaDataFromId("au", Some(Seq(Size(728, 90)))),
      defaultEdition) should endWith("top-banner-ad-container--small")
  }

  they should "be responsive for 88x70 ad on US network front" in {
    topAboveNavSlot.cssClasses(metaDataFromId("us", Some(Seq(Size(88, 70)))), defaultEdition) should
      endWith("top-banner-ad-container--responsive")
  }

  they should "be default for any other page" in {
    topAboveNavSlot.cssClasses(metaDataFromId("uk/culture", None), defaultEdition) should
      endWith("top-banner-ad-container--reveal")
    topAboveNavSlot.cssClasses(metaDataFromId(
      "business/2015/jul/07/eurozone-calls-on-athens-to-get-serious-over-greece-debt-crisis", None),
      defaultEdition)
      .should(endWith("top-banner-ad-container--reveal"))
  }
}
