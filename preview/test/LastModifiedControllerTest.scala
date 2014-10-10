package test

import org.scalatest.{DoNotDiscover, FlatSpec, Matchers}
import play.api.test.Helpers._

@DoNotDiscover class LastModifiedControllerTest extends FlatSpec with Matchers with ConfiguredTestSuite{

  "LastModifiedController" should "report that the content is stale" in {
    val request = TestRequest("uk-news/2014/oct/03/alan-henning-isis-syria-video-murder?last-modified=2014-10-10T05%3A04%3A30%2B01%3A00")
    val result = controllers.LastModifiedController.render("uk-news/2014/oct/03/alan-henning-isis-syria-video-murder")(request)

    (contentAsJson(result) \ "status").as[String] should be ("stale")
  }

  it should "report that the content is fresh" in {
    val request = TestRequest("uk-news/2014/oct/03/alan-henning-isis-syria-video-murder?last-modified=2014-10-01T05%3A04%3A30%2B01%3A00")
    val result = controllers.LastModifiedController.render("uk-news/2014/oct/03/alan-henning-isis-syria-video-murder")(request)

    (contentAsJson(result) \ "status").as[String] should be ("fresh")
  }
}
