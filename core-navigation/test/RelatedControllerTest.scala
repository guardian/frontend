package test

import conf.Switches
import play.api.test._
import play.api.test.Helpers._
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec

class RelatedControllerTest extends FlatSpec with ShouldMatchers {
  
  val article = "uk/2012/aug/07/woman-torture-burglary-waterboard-surrey"
  val badArticle = "i/am/not/here"
  val articleWithoutRelated = "uk/2012/aug/29/eva-rausing-information-murder-olaf-palme"
  val callback = "aFunction"

  "Related Controller" should "serve the correct headers when the article exists" in Fake {
    val fakeRequest = TestRequest()
      .withHeaders("Accept" -> "text/html")

    Switches.DoubleCacheTimesSwitch.switchOff()

    val result = controllers.RelatedController.render(article)(fakeRequest)
    status(result) should be(200)
    contentType(result).get should be("text/html")
    charset(result).get should be("utf-8")
    header("Cache-Control", result).get should be("public, max-age=900, stale-while-revalidate=900, stale-if-error=345600")
  }

  it should "serve the correct headers when given a callback parameter" in Fake {
    val fakeRequest = FakeRequest(GET, s"/related/${article}?callback=$callback")
      .withHeaders("host" -> "http://localhost:9000")
        
    val Some(result) = route(fakeRequest)
    status(result) should be(200)
    contentType(result).get should be("application/javascript")
    contentAsString(result) should startWith(s"""${callback}({\"html\"""") // the callback
  }

  it should "serve JSON when .json format is supplied" in Fake {
    val fakeRequest = FakeRequest(GET, s"/related/${article}.json")
      .withHeaders("host" -> "http://localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")
        
    val Some(result) = route(fakeRequest)
    status(result) should be(200)
    contentType(result).get should be("application/json")
    contentAsString(result) should startWith("{\"html\"")
  }

  it should "404 when article does not exist" in Fake {
    val result = controllers.RelatedController.render(badArticle)(TestRequest())
    status(result) should be(404)
  }

  it should "404 when article does not have related content" in Fake {
    val result = controllers.RelatedController.render(articleWithoutRelated)(TestRequest())
    status(result) should be(404)
  }
}
