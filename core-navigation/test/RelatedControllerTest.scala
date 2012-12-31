package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec
import play.api.mvc.AsyncResult
import play.api.mvc.Result

class RelatedControllerTest extends FlatSpec with ShouldMatchers {

  "Related Controller" should "serve the correct headers when the article exists" in Fake {
    val result = controllers.RelatedController.render("UK", "uk/2012/aug/07/woman-torture-burglary-waterboard-surrey")(FakeRequest())

    val res = await(result.asInstanceOf[AsyncResult].result)
    status(res) should be(200)
    contentType(res).get should be("text/html")
    charset(res).get should be("utf-8")
    header("Cache-Control", res).get should be("public, max-age=900")
  }

  it should "serve the correct headers when given a callback parameter" in Fake {
    val request = FakeRequest(GET, "/related/UK/uk/2012/aug/07/woman-torture-burglary-waterboard-surrey?callback=foo")
    val Some(result) = routeAndCall(request)

    val res: Result = await(result.asInstanceOf[AsyncResult].result)
    status(res) should be(200)
    contentType(res).get should be("application/javascript")
    contentAsString(res) should startWith("foo({\"html\"") // the callback
  }

  it should "404 when article does not exist" in Fake {
    val result = controllers.RelatedController.render("UK", "related/i/am/not/here")(FakeRequest())
    status(await(result.asInstanceOf[AsyncResult].result)) should be(404)
  }

  it should "404 when article does not have related content" in Fake {
    val result = controllers.RelatedController.render("UK", "uk/2012/aug/29/eva-rausing-information-murder-olaf-palme")(FakeRequest())
    status(await(result.asInstanceOf[AsyncResult].result)) should be(404)
  }
}
