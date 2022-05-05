package common

import com.fasterxml.jackson.core.JsonParseException
import com.gu.contentapi.client.model.v1._
import model.SimpleContentPage
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import play.api.libs.json.JsValue
import play.api.test.Helpers._
import play.twirl.api.Html
import test.{TestRequest, WithTestApplicationContext}

import scala.concurrent.Future

class CommonPackageTest extends AnyFlatSpec with Matchers with WithTestApplicationContext {

  trait PackageTestScope {
    val article = model.Content(
      Content(
        id = "/content",
        sectionId = None,
        sectionName = None,
        webPublicationDate = None,
        webTitle = "webTitle",
        webUrl = "webUrl",
        apiUrl = "apiUrl",
        tags = Nil,
        elements = None,
        fields = None,
      ),
    )
    val contentPage = SimpleContentPage(article)
  }

  "renderEmail" should "render an email result page" in new PackageTestScope {
    val html = Html("")
    val result = Future.successful(common.renderEmail(html, contentPage)(TestRequest(), testApplicationContext))
    status(result) shouldBe 200
    assertThrows[JsonParseException](contentAsJson(result))
    contentAsString(result) should include("<html")
  }

  "renderEmail" should "render an email json result page" in new PackageTestScope {
    val html = Html("")
    val result = Future.successful(
      common.renderEmail(html, contentPage)(TestRequest("/content/email.emailjson"), testApplicationContext),
    )

    val jsonResult: JsValue = contentAsJson(result)
    val (key, value) = jsonResult.as[Map[String, String]].head
    key shouldBe "body"
    value should include("<html")
  }

  "renderEmail" should "render an email txt result page" in new PackageTestScope {
    val html = Html("")
    val result = Future.successful(
      common.renderEmail(html, contentPage)(TestRequest("/content/email.emailtxt"), testApplicationContext),
    )

    val jsonResult: JsValue = contentAsJson(result)
    val (key, value) = jsonResult.as[Map[String, String]].head
    key shouldBe "body"
    value should not include "<html"
  }

}
