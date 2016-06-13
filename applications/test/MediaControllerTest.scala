package test

import play.api.test.Helpers._
import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}

@DoNotDiscover class MediaControllerTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  val videoUrl = "uk/video/2012/jun/26/queen-enniskillen-northern-ireland-video"
  val videoUrlWithDodgyOctpusUrl = "football/video/2015/feb/10/manchester-united-louis-van-gaal-long-ball-video"

  "Media Controller" should "200 when content type is video" in {
    val result = controllers.MediaController.render(videoUrl)(TestRequest(videoUrl))
    status(result) should be(200)
  }

  it should "return JSON when .json format is supplied" in {
    val fakeRequest = TestRequest(s"${videoUrl}.json")
      .withHeaders("host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")

    val result = controllers.MediaController.render(videoUrl)(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/json; charset=utf-8")
    contentAsString(result) should startWith("{\"config\"")
  }

  it should "internal redirect when content type is not video" in {
    val result = controllers.MediaController.render("uk/2012/jun/27/queen-martin-mcguinness-shake-hands")(TestRequest("/uk/2012/jun/27/queen-martin-mcguinness-shake-hands"))
    status(result) should be(200)
    header("X-Accel-Redirect", result).get should be("/type/article/uk/2012/jun/27/queen-martin-mcguinness-shake-hands")
  }

  it should "display an expired message for expired content" in {
    val result = controllers.MediaController.render("world/video/2008/dec/11/guantanamo-bay")(TestRequest("/world/video/2008/dec/11/guantanamo-bay"))
    status(result) should be(200)
    contentAsString(result) should include("Sorry - this page has been removed.")
  }

  it should "render videos tagged as podcasts" in {
    val result = controllers.MediaController.render("football/video/2014/dec/05/football-weekly-live-in-london-video")(TestRequest("/football/video/2014/dec/05/football-weekly-live-in-london-video"))
    status(result) should be(200)
    contentAsString(result) should include(""""isPodcast":false""")
  }

  it should("strip newline characters out of src urls for videos") in {
     val result = controllers.MediaController.render(videoUrlWithDodgyOctpusUrl)(TestRequest(videoUrlWithDodgyOctpusUrl))
     status(result) should be (200)
     contentAsString(result) should include ("https://multimedia.guardianapis.com/interactivevideos/video.php?octopusid=10040285&amp;format=video/m3u8")

  }
}
