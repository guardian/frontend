package metadata

import org.jsoup.Jsoup
import org.scalatest.Matchers
import play.api.libs.json._
import play.api.mvc.Result
import play.api.test.Helpers._

import scala.concurrent.Future

object MetaDataMatcher extends Matchers  {

  lazy val appId = "409128287"
  val iosDomain = "ios-app://"

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
    script.size() should be(1)

    val appIndexer: JsValue = Json.parse(script.first().html())

    (appIndexer \ "potentialAction" \ "target").as[String] should include(articleUrl)

  }

  def ensureDeepLink(result: Future[Result]) {
    val body = Jsoup.parseBodyFragment(contentAsString(result))
    status(result) should be(200)
    val script = body.getElementsByAttributeValueStarting("href", iosDomain)
    script.size() should be(1)
  }

  def ensureNoDeepLink(result: Future[Result]) {
    val body = Jsoup.parseBodyFragment(contentAsString(result))
    status(result) should be(200)
    val script = body.getElementsByAttributeValueStarting("href", iosDomain)
    script.size() should be(0)
  }

  def ensureNoIosUrl(result: Future[Result]): Unit = {
    val body = Jsoup.parseBodyFragment(contentAsString(result))
    status(result) should be(200)

    val script = body.getElementsByAttributeValue("property", "ad:ios:url")
    script.size() should be(0)
  }

}
