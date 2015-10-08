package metadata

import org.jsoup.Jsoup
import org.scalatest.Matchers
import play.api.libs.json._
import play.api.mvc.Result
import play.api.test.Helpers._

import scala.concurrent.Future

object MetaDataMatcher extends Matchers  {

  def ensureOrganisation(result: Future[Result]) {
    status(result) should be(200)
    val stringResult = contentAsString(result)
    val body = Jsoup.parseBodyFragment(stringResult)

    val script = body.getElementsByAttributeValue("data-schema", "Organization")
    script.size() should be(1)

    val organisation: JsValue = Json.parse(script.first().html())
    (organisation \ "name").as[String] should be("The Guardian")
    (organisation \ "logo").as[String] should include("152x152.png")

    val socialNetworks = (organisation \ "sameAs").as[List[String]]

    socialNetworks.size should be(4)
  }

  def ensureWebPage(result: Future[Result], articleUrl: String) {
    val body = Jsoup.parseBodyFragment(contentAsString(result))
    status(result) should be(200)

    val script = body.getElementsByAttributeValue("data-schema", "WebPage")
    script.size() should be(0)

//    val appIndexer: JsValue = Json.parse(script.first().html())
//
//    (appIndexer \ "potentialAction" \ "target").as[String] should include(articleUrl)

  }

}
