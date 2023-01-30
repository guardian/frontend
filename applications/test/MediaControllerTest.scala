package test

import controllers.MediaController
import play.api.test.Helpers._
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover}
import org.jsoup.Jsoup
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import scala.util.matching.Regex

@DoNotDiscover class MediaControllerTest
    extends AnyFlatSpec
    with Matchers
    with ConfiguredTestSuite
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestWsClient
    with WithTestApplicationContext
    with WithTestContentApiClient {

  val videoUrl = "uk/video/2012/jun/26/queen-enniskillen-northern-ireland-video"
  val videoUrlWithDodgyOctpusUrl = "football/video/2015/feb/10/manchester-united-louis-van-gaal-long-ball-video"
  lazy val mediaController = new MediaController(testContentApiClient, play.api.test.Helpers.stubControllerComponents())

  "Media Controller" should "200 when content type is video" in {
    val result = mediaController.render(videoUrl)(TestRequest(videoUrl))
    status(result) should be(200)
  }

  it should "return JSON when .json format is supplied" in {
    val fakeRequest = TestRequest(s"$videoUrl.json")
      .withHeaders("host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")

    val result = mediaController.render(videoUrl)(fakeRequest)
    status(result) should be(200)
    contentType(result) shouldBe Some("application/json")
    contentAsString(result) should startWith("{\"config\"")
  }

  it should "internal redirect when content type is not video" in {
    val result = mediaController.render("uk/2012/jun/27/queen-martin-mcguinness-shake-hands")(
      TestRequest("/uk/2012/jun/27/queen-martin-mcguinness-shake-hands"),
    )
    status(result) should be(200)
    header("X-Accel-Redirect", result).get should be("/type/article/uk/2012/jun/27/queen-martin-mcguinness-shake-hands")
  }

  it should "display an expired message for expired content" in {
    val result = mediaController.render("world/video/2008/dec/11/guantanamo-bay")(
      TestRequest("/world/video/2008/dec/11/guantanamo-bay"),
    )
    status(result) should be(410)
    contentAsString(result) should include("Sorry - this page has been removed.")
  }

  it should "render videos tagged as podcasts" in {
    val result = mediaController.render("football/video/2014/dec/05/football-weekly-live-in-london-video")(
      TestRequest("/football/video/2014/dec/05/football-weekly-live-in-london-video"),
    )
    status(result) should be(200)
    contentAsString(result) should include(""""isPodcast":false""")
  }

  it should "strip newline characters out of src urls for videos" in {
    val result = mediaController.render(videoUrlWithDodgyOctpusUrl)(TestRequest(videoUrlWithDodgyOctpusUrl))
    status(result) should be(200)
    contentAsString(result) should include(
      "https://multimedia.guardianapis.com/interactivevideos/video.php?octopusid=10040285&amp;format=video/m3u8",
    )
  }

  it should "add video sources in a specific order" in {
    val path = "us-news/video/2016/aug/20/trump-calls-for-black-votes-what-do-you-have-to-lose-video"
    val result = mediaController.render(path)(TestRequest(path))
    status(result) should be(200)

    val html = Jsoup.parse(contentAsString(result))

    val videoEl = html.getElementsByTag("video")
    val sources = videoEl.select("source")

    sources.size() should be(3)

    sources.get(0).attr("type") should equal("video/m3u8")
    sources.get(1).attr("type") should equal("video/mp4")
    sources.get(2).attr("type") should equal("video/webm")

  }

  val audioUrl = "/news/audio/2019/may/16/facing-up-europe-far-right-podcast"

  "Media Controller" should "200 when content type is audio" in {
    val result = mediaController.render(audioUrl)(TestRequest(audioUrl))
    status(result) should be(200)
  }

}
