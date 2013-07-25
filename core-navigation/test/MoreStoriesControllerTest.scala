package test

import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec
import play.api.test._
import play.api.test.Helpers._
import play.api.libs.json._
import play.api.mvc.Result
import feed.MostPopularAgent
import common.Edition
import com.gu.openplatform.contentapi.model.{Content => ApiContent}
import org.joda.time.DateTime
import model.Content

class MoreStoriesControllerTest extends FlatSpec with ShouldMatchers {
  
  val callbackName = "aFunction"
  val section = "football"

  val testContent = Seq(new Content(new ApiContent("the/id", None, None, new DateTime(), "the title", "http://www.guardian.co.uk/canonical",
    "http://foo.bar", elements = None)))
    
  private def unWrapJson(json: String): JsValue = {
    Json.parse(json.stripPrefix(callbackName + "(").stripSuffix(");"))
  }
  
  private def makeRequestFrontTrails(page: String): Result = {
    val fakeRequest = FakeRequest(GET, s"/front-trails/${page}?callback=${callbackName}")
        .withHeaders("host" -> "localhost:9000")
    controllers.MoreStoriesController.renderFrontTrails(page)(fakeRequest)
  }
  
  private def makeRequestMostViewed(page: String): Result = {
    val fakeRequest = FakeRequest(GET, s"/most-viewed/${page}?callback=${callbackName}")
        .withHeaders("host" -> "localhost:9000")
    controllers.MoreStoriesController.renderMostViewed(page)(fakeRequest)
  }
  
  private def extractStories(json: JsValue): Seq[JsValue] = {
    (json \ "stories").as[Seq[JsValue]]
  }

  "More Stories Controller" should "return a 200 JSONP response for front trails" in Fake {
    val result = makeRequestFrontTrails(section)
    status(result) should be(200)
    contentType(result).get should be("application/javascript")
    contentAsString(result) should startWith(s"""${callbackName}({\"stories\"""") // the callback

    val stories: Seq[JsValue] = extractStories(unWrapJson(contentAsString(result)))
    stories.size should be > (9)
  }

  it should "return a 200 JSONP response for most viewed" in Fake {
    val result = makeRequestMostViewed(section)
    status(result) should be(200)
    contentType(result).get should be("application/javascript")
    contentAsString(result) should startWith(s"""${callbackName}({\"stories\"""") // the callback

    val stories: Seq[JsValue] = extractStories(unWrapJson(contentAsString(result)))
    stories.size should be (19)
  }

  it should "return a 200 JSON response for most viewed when .json format requested" in Fake {
    val fakeRequest = FakeRequest(GET, s"/most-viewed/${section}.json")
      .withHeaders("host" -> "http://localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")

    val result = controllers.MoreStoriesController.renderMostViewed(section)(fakeRequest)
    status(result) should be(200)
    contentType(result).get should be("application/json")
    contentAsString(result) should startWith("{\"stories\"")

    val stories: Seq[JsValue] = extractStories(unWrapJson(contentAsString(result)))
    stories.size should be (19)
  }

  it should "return global most read if unknown page" in Fake {
    val result = makeRequestFrontTrails("a/bad/pasdfsdfge")
    val stories: Seq[JsValue] = extractStories(unWrapJson(contentAsString(result)))
    stories should contain(Json.toJson(Map("url" -> "/world/2013/jul/25/spain-train-crash-dead")))
  }
  
}