package views.support

import model.{MetaData, SectionId}
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.{BeforeAndAfterEach, OptionValues}
import org.scalatest.matchers.should.Matchers
import views.support.Commercial.topAboveNavSlot

class CommercialTest extends AnyFlatSpec with Matchers with OptionValues with BeforeAndAfterEach {

  private def metaDataFromId(pageId: String): MetaData =
    MetaData.make(
      id = pageId,
      section = Some(SectionId.fromId("section")),
      webTitle = "webTitle",
      javascriptConfigOverrides = Map(),
    )

  def pageShouldRequestAdSizes(pageId: String)(sizes: Seq[String]): Unit = {
    topAboveNavSlot.adSizes.get("desktop").value shouldBe sizes
  }

  "topAboveNavSlot ad sizes" should "be variable for all pages" in {
    pageShouldRequestAdSizes("uk/culture")(
      Seq("1,1", "2,2", "728,90", "940,230", "900,250", "970,250", "88,71", "fluid"),
    )
    pageShouldRequestAdSizes("business/2015/jul/07/eurozone-calls-on-athens-to-get-serious-over-greece-debt-crisis")(
      Seq("1,1", "2,2", "728,90", "940,230", "900,250", "970,250", "88,71", "fluid"),
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
    val metaData = metaDataFromId("uk")
    topAboveNavSlot.cssClasses(metaData) should endWith("js-top-banner")
  }
}
