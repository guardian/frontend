package test

import controllers.CrosswordPageController
import metadata.MetaDataMatcher
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover}

@DoNotDiscover class CrosswordPageMetaDataTest
    extends AnyFlatSpec
    with Matchers
    with ConfiguredTestSuite
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestWsClient
    with WithTestApplicationContext
    with WithTestContentApiClient {

  val crosswordUrl = "crosswords/cryptic/26697"
  lazy val crosswordPageController =
    new CrosswordPageController(testContentApiClient, play.api.test.Helpers.stubControllerComponents())

  it should "not include the ios deep link" in {
    val result = crosswordPageController.crossword("cryptic", 26697)(TestRequest(crosswordUrl))
    MetaDataMatcher.ensureNoIosUrl(result)
  }

  it should "not include the app deep link" in {
    val result = crosswordPageController.crossword("cryptic", 26697)(TestRequest(crosswordUrl))
    MetaDataMatcher.ensureNoDeepLink(result)
  }
}
