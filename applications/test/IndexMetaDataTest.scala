package test

import contentapi.SectionsLookUp
import controllers.IndexController
import metadata.MetaDataMatcher
import org.jsoup.Jsoup
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover}
import org.scalatestplus.mockito.MockitoSugar
import play.api.libs.json._
import play.api.libs.ws.WSClient
import play.api.test.Helpers._

@DoNotDiscover class IndexMetaDataTest
    extends AnyFlatSpec
    with Matchers
    with ConfiguredTestSuite
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestWsClient
    with WithTestApplicationContext
    with WithTestContentApiClient
    with MockitoSugar {

  val articleUrl = "money/pensions"
  val crosswordsUrl = "crosswords"

  lazy val sectionsLookUp = new SectionsLookUp(testContentApiClient)
  lazy val indexController = new IndexController(
    testContentApiClient,
    sectionsLookUp,
    play.api.test.Helpers.stubControllerComponents(),
    mock[WSClient],
  )

  it should "Include app deep link" in {
    val result = indexController.render(articleUrl)(TestRequest(s"$articleUrl?dcr=false"))
    MetaDataMatcher.ensureDeepLink(result)
  }

  it should "Not include app deep link on the crosswords index" in {
    val result = indexController.render(crosswordsUrl)(TestRequest(s"$crosswordsUrl?dcr=false"))
    MetaDataMatcher.ensureNoDeepLink(result)
  }

  it should "not include webpage metadata on the crossword index" in {
    val result = indexController.render(crosswordsUrl)(TestRequest(s"$crosswordsUrl?dcr=false"))
    MetaDataMatcher.ensureNoIosUrl(result)
  }
}
