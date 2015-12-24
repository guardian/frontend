package test

import metadata.MetaDataMatcher
import org.scalatest.{DoNotDiscover, FlatSpec, Matchers}

@DoNotDiscover class CrosswordPageMetaDataTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  val crosswordUrl = "crosswords/cryptic/26697"

  it should "not include the ios deep link" in {
    val result = controllers.CrosswordPageController.crossword("cryptic", 26697)(TestRequest(crosswordUrl))
    MetaDataMatcher.ensureNoIosUrl(result)
  }

  it should "not include the app deep link" in {
    val result = controllers.CrosswordPageController.crossword("cryptic", 26697)(TestRequest(crosswordUrl))
    MetaDataMatcher.ensureNoDeepLink(result)
  }
}
