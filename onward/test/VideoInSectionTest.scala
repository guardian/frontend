package test

import controllers.MediaInSectionController
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover, FlatSpec, Matchers}
import play.api.test.Helpers._

@DoNotDiscover class VideoInSectionTest
  extends FlatSpec
  with Matchers
  with ConfiguredTestSuite
  with BeforeAndAfterAll
  with WithTestWsClient
  with WithTestContentApiClient {

  lazy val mediaInSectionController = new MediaInSectionController(testContentApiClient)

  "Video In Section controller" should "provide a tag combiner link" in {
    val result = mediaInSectionController.renderSectionMedia("video", "football")(TestRequest())
    status(result) should be (200)
    contentAsString(result) should include ("href=\"/football/football+content/video\"")
    contentAsString(result) should include ("more football videos")
  }

  "Video In Section controller" should "exclude videos in the series specified" in {
    val result = mediaInSectionController.renderSectionMediaWithSeries("video", "fashion", "theguardian/series/how-to-dress")(TestRequest())
    status(result) should be (200)
    contentAsString(result) should not include "fashion-tips"
  }
}
