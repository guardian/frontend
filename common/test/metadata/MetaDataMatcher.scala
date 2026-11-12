package metadata

import model.meta.Logo
import org.jsoup.Jsoup
import org.scalatest.matchers.should.Matchers
import play.api.libs.json._
import play.api.mvc.Result
import play.api.test.Helpers._

import scala.concurrent.Future

object MetaDataMatcher extends Matchers {

  lazy val appId = "409128287"
  val iosDomain = "ios-app://"

  def ensureDeepLink(result: Future[Result]): Unit = {
    val body = Jsoup.parseBodyFragment(contentAsString(result))
    status(result) should be(200)
    val script = body.getElementsByAttributeValueStarting("href", iosDomain)
    script.size() should be(1)
  }

  def ensureNoDeepLink(result: Future[Result]): Unit = {
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

  def ensureOldArticleMessage(result: Future[Result], articleUrl: String): Unit = {
    val body = Jsoup.parseBodyFragment(contentAsString(result))
    status(result) should be(200)

    val elements = body.getElementsByClass("old-article-message")
    elements.size() should be(2)
  }

  def ensureNoOldArticleMessage(result: Future[Result], articleUrl: String): Unit = {
    val body = Jsoup.parseBodyFragment(contentAsString(result))
    status(result) should be(200)

    val elements = body.getElementsByClass("old-article-message")
    elements.size() should be(0)
  }

}
