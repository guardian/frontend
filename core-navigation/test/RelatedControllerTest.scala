package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec

class RelatedControllerTest extends FlatSpec with ShouldMatchers {

  "Related Controller" should "serve the correct headers when the article exists" in Fake {
    val result = controllers.RelatedController.render("uk/2012/aug/07/woman-torture-burglary-waterboard-surrey")(TestRequest())
    status(result) should be(200)
    contentType(result).get should be("text/html")
    charset(result).get should be("utf-8")
    header("Cache-Control", result).get should be("public, max-age=900, stale-while-revalidate=900, stale-if-error=7200")
  }

  it should "serve the correct headers when given a callback parameter" in Fake {
    val request = FakeRequest(GET, "/related/uk/2012/aug/07/woman-torture-burglary-waterboard-surrey?callback=foo").withHeaders("host" -> "http://localhost:9000")
    val Some(result) = route(request)

    status(result) should be(200)
    contentType(result).get should be("application/javascript")
    contentAsString(result) should startWith("foo({\"html\"") // the callback
  }

  it should "404 when article does not exist" in Fake {
    val result = controllers.RelatedController.render("related/i/am/not/here")(TestRequest())
    status(result) should be(404)
  }

  it should "404 when article does not have related content" in Fake {
    val result = controllers.RelatedController.render("uk/2012/aug/29/eva-rausing-information-murder-olaf-palme")(TestRequest())
    status(result) should be(404)
  }
}
