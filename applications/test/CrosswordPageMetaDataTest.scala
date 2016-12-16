package test

import controllers.CrosswordPageController
import metadata.MetaDataMatcher
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover, FlatSpec, Matchers}

@DoNotDiscover class CrosswordPageMetaDataTest
  extends FlatSpec
  with Matchers
  with ConfiguredTestSuite
  with BeforeAndAfterAll
  with WithTestWsClient
  with WithTestContext
  with WithTestContentApiClient {

  val crosswordUrl = "crosswords/cryptic/26697"
  val crosswordPageController = new CrosswordPageController(testContentApiClient)

  it should "not include the ios deep link" in {
    val result = crosswordPageController.crossword("cryptic", 26697)(TestRequest(crosswordUrl))
    MetaDataMatcher.ensureNoIosUrl(result)
  }

  it should "not include the app deep link" in {
    val result = crosswordPageController.crossword("cryptic", 26697)(TestRequest(crosswordUrl))
    MetaDataMatcher.ensureNoDeepLink(result)
  }
}
