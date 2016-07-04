package test

import controllers.CrosswordPageController
import metadata.MetaDataMatcher
import org.scalatest.{DoNotDiscover, FlatSpec, Matchers}

@DoNotDiscover class CrosswordPageMetaDataTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  val crosswordUrl = "crosswords/cryptic/26697"
  val crosswordPageController = new CrosswordPageController

  it should "not include the ios deep link" in {
    val result = crosswordPageController.crossword("cryptic", 26697)(TestRequest(crosswordUrl))
    MetaDataMatcher.ensureNoIosUrl(result)
  }

  it should "not include the app deep link" in {
    val result = crosswordPageController.crossword("cryptic", 26697)(TestRequest(crosswordUrl))
    MetaDataMatcher.ensureNoDeepLink(result)
  }
}
