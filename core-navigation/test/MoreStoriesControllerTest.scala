package test

import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec
import play.api.test._
import play.api.test.Helpers._
import play.api.libs.json._
import play.api.mvc.Result

class MoreStoriesControllerTest extends FlatSpec with ShouldMatchers {
  
  val callbackName = "moreStories"
  val section = "football"
    
  private def unWrapJson(json: String): JsValue = {
    Json.parse(json.stripPrefix(callbackName + "(").stripSuffix(");"))
  }
  
  private def makeRequestFrontTrails(page: String): Result = {
    val fakeRequest = FakeRequest(GET, s"/front-trails/${page}?callback=${callbackName}").withHeaders("host" -> "localhost:9000")
    controllers.MoreStoriesController.render(page, "frontTrails")(fakeRequest)
  }
  
  private def makeRequestMostViewed(page: String): Result = {
    val fakeRequest = FakeRequest(GET, s"/most-viewed/${page}?callback=${callbackName}").withHeaders("host" -> "localhost:9000")
    controllers.MoreStoriesController.render(page, "mostViewed")(fakeRequest)
  }
  
  private def extractStories(json: JsValue): Seq[JsValue] = {
    (json \ "stories").as[Seq[JsValue]]
  }

  "More Stories Controller" should "return a 200 JSONP response for front trails" in Fake {
    val result = makeRequestFrontTrails(section)
    status(result) should be(200)
    contentType(result).get should be("application/javascript")
    contentAsString(result) should startWith(callbackName + "({\"stories\"") // the callback
    
    val stories: Seq[JsValue] = extractStories(unWrapJson(contentAsString(result)))
    stories.size should be (15)
  }

  it should "return a 200 JSONP response for most viewed" in Fake {
    val result = makeRequestMostViewed(section)
    status(result) should be(200)
    contentType(result).get should be("application/javascript")
    contentAsString(result) should startWith(callbackName + "({\"stories\"") // the callback
    
    val stories: Seq[JsValue] = extractStories(unWrapJson(contentAsString(result)))
    stories.size should be (20)
  }

  it should "return global most read if unknown page" in Fake {
    val result = makeRequestFrontTrails("a/bad/page")

    val stories: Seq[JsValue] = extractStories(unWrapJson(contentAsString(result)))
    stories.size should be > (20)
    stories.head should not be(Json.toJson(Map("url" -> "/foo")))
  }
  
}