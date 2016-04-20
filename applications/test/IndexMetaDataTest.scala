package test

import metadata.MetaDataMatcher
import org.jsoup.Jsoup
import org.scalatest.{DoNotDiscover, FlatSpec, Matchers}
import play.api.libs.json._
import play.api.test.Helpers._

@DoNotDiscover class IndexMetaDataTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  val articleUrl = "money/pensions"
  val crosswordsUrl = "crosswords"

  it should "Include organisation metadata" in {
    val result = controllers.IndexController.render(articleUrl)(TestRequest(articleUrl))
    MetaDataMatcher.ensureOrganisation(result)
  }

  it should "Include webpage metadata" in {
    val result = controllers.IndexController.render(articleUrl)(TestRequest(articleUrl))
    MetaDataMatcher.ensureWebPage(result, articleUrl)
  }

  it should "Include app deep link" in {
    val result = controllers.IndexController.render(articleUrl)(TestRequest(articleUrl))
    MetaDataMatcher.ensureDeepLink(result)
  }

  it should "Not include app deep link on the crosswords index" in {
    val result = controllers.IndexController.render(crosswordsUrl)(TestRequest(crosswordsUrl))
    MetaDataMatcher.ensureNoDeepLink(result)
  }

  it should "not include webpage metadata on the crossword index" in {
    val result = controllers.IndexController.render(crosswordsUrl)(TestRequest(crosswordsUrl))
    MetaDataMatcher.ensureNoIosUrl(result)
  }

  it should "Include item list metadata" in {
    val result = controllers.IndexController.render(articleUrl)(TestRequest(articleUrl))
    val body = Jsoup.parseBodyFragment(contentAsString(result))
    status(result) should be(200)

    val script = body.getElementsByAttributeValue("data-schema", "ItemList")
    script.size() should be(1)

    val itemList: JsValue = Json.parse(script.first().html())

    (itemList \ "itemListElement").as[JsArray].value.size should be(20)

  }
}
