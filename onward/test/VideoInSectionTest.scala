package test

import org.scalatest.{Matchers, FlatSpec}
import play.api.test.Helpers._

class VideoInSectionTest extends FlatSpec with Matchers {

  "Video In Section controller" should "provide a tag combiner link" in Fake {
    val result = controllers.VideoInSectionController.renderSectionVideos("football")(TestRequest())
    status(result) should be (200)
    contentAsString(result) should include ("href=\"/football/football+content/video\">More Football videos")
  }

  "Video In Section controller" should "exclude videos in the series specified" in Fake {
    val result = controllers.VideoInSectionController.renderSectionVideosWithSeries("fashion", "theguardian/series/how-to-dress")(TestRequest())
    status(result) should be (200)
    contentAsString(result) should not include ("fashion-tips")
  }
}