package test

import org.jsoup.Jsoup
import play.api.libs.json._
import org.scalatest.{DoNotDiscover, FlatSpec, Matchers}
import play.api.test.Helpers._

@DoNotDiscover class ArticleMetaDataTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  val articleUrl = "environment/2012/feb/22/capitalise-low-carbon-future"

  it should "Include organisation metadata" in {
    val result = controllers.ArticleController.renderArticle(articleUrl, None, None)(TestRequest(articleUrl))
    val body = Jsoup.parseBodyFragment(contentAsString(result))
    status(result) should be(200)

    val script = body.getElementsByAttributeValue("data-schema", "organization")
    script.size() should be(1)

    val data: JsValue = Json.parse(script.first().html())
    (data \ "name").as[String] should be("The Guardian")
    (data \ "logo").as[String] should include("152x152.png")

    val socialNetworks = (data \ "sameAs").as[List[String]]

    socialNetworks.size should be(4)
  }

}
