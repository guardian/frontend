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

  private def metaDataFromId(pageId: String): MetaData = MetaData.make(
    id = pageId,
    section = "section",
    analyticsName = "analyticsName",
    webTitle = "webTitle")

  def pageShouldRequestAdSizes(pageId: String)(sizes: Seq[String]): Unit = {
    val metaData = metaDataFromId(pageId)
    topAboveNavSlot.adSizes(metaData, defaultEdition).get("desktop").value shouldBe sizes
  }

  "topAboveNavSlot ad sizes" should "be variable for all pages" in {
    pageShouldRequestAdSizes("uk/culture")(
      Seq("1,1", "88,70", "728,90", "940,230", "900,250", "970,250")
    )
    pageShouldRequestAdSizes(
      "business/2015/jul/07/eurozone-calls-on-athens-to-get-serious-over-greece-debt-crisis")(
        Seq("1,1", "88,70", "728,90", "940,230", "900,250", "970,250")
      )
  }

  // Keeping this code for now since we'll be running another similar
  // experiment in the near future:
  // "topAboveNavSlot css classes" should
  //   "be large for 900x250 or 970x250 ad on UK business front" in {
  //   topAboveNavSlot.cssClasses(metaDataFromId("uk/business"), defaultEdition, Seq(AdSize(900, 250))) should endWith("top-banner-ad-container--large")
  // }
  //
  // they should "be small for 728x90 ad on AU business front" in {
  //   topAboveNavSlot.cssClasses(metaDataFromId("au/business"), defaultEdition, Seq(leaderboardSize)) should endWith("top-banner-ad-container--small")
  // }
  //
  // they should "be responsive for 88x70 ad on US business front" in {
  //   topAboveNavSlot.cssClasses(metaDataFromId("us/business"), defaultEdition, Seq(responsiveSize)) should endWith("top-banner-ad-container--responsive")
  // }

  they should "be default for any other page" in {
    topAboveNavSlot.cssClasses(metaDataFromId("uk/culture"), defaultEdition, Nil) should
      endWith("top-banner-ad-container--reveal")
    topAboveNavSlot.cssClasses(metaDataFromId(
      "business/2015/jul/07/eurozone-calls-on-athens-to-get-serious-over-greece-debt-crisis"),
      defaultEdition, Nil)
      .should(endWith("top-banner-ad-container--reveal"))
  }
}
