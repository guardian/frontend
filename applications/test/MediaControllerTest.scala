package test

import play.api.test.Helpers._
import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}

@DoNotDiscover class MediaControllerTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  val videoUrl = "uk/video/2012/jun/26/queen-enniskillen-northern-ireland-video"
  val callbackName = "aFunction"

  "Media Controller" should "200 when content type is video" in {
    val result = controllers.MediaController.render(videoUrl)(TestRequest(videoUrl))
    status(result) should be(200)
  }

  it should "return JSONP when callback is supplied" in {
    val fakeRequest = TestRequest(s"${videoUrl}?callback=$callbackName")
      .withHeaders("host" -> "localhost:9000")

    val result = controllers.MediaController.render(videoUrl)(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/javascript; charset=utf-8")
    contentAsString(result) should startWith(s"""${callbackName}({\"config\"""")
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
    status(result) should be(410)
    contentAsString(result) should include("Sorry - this page has been removed.")
  }

  it should "provide canonical links to parent sections in 410 responses" in {
    val urlsToCanonicals = List(
      ("books/booksblog/2010/mar/15/girl-with-the-dragon-tattoo","books"),
      ("business/2014/sep/28/air-france-pilots-call-off-two-week-strike","business"),
      ("business/video/2009/sep/16/frankfurt-car-show-hybrid", "business"),
      ("commentisfree/cif-green/2010/may/10/deepwater-horizon-greens-collapse-civilisation", "commentisfree"),
      ("environment/cif-green/2009/jun/18/greenwash-biodegradeable-plastic-bags", "environment"),
      ("football/2014/sep/22/referee-apologises-liverpool-birmingham-women-super-league", "football"),
      ("football/blog/2013/sep/26/luis-figo-barcelona-madrid-sid-lowe", "football"),
      ("football/video/2014/jul/03/world-cup-2014-turtle-backs-brazil-beat-colombia-quarter-finals-video", "football"),
      ("film/2010/sep/24/lindsay-lohan-jail-us-california", "film"),
      ("film/video/2014/apr/11/tilda-swinton-gospel-according-to-saint-derek-jarman", "film"),
      ("global-development/2014/jul/16/central-african-republic-death-toll-msf", "global-development"),
      ("lifeandstyle/2010/jan/17/are-your-friends-making-you-fat", "lifeandstyle"),
      ("lifeandstyle/lostinshowbiz/2010/feb/22/sting-uzbekistan", "lifeandstyle"),
      ("media/greenslade/2010/jan/07/press-freedom-canada", "media"),
      ("music/musicblog/video/2014/apr/14/philharmonic-orchaestra-video", "music"),
      ("music/2013/dec/23/pussy-riot-maria-alyokhina-released", "music"),
      ("sport/2014/sep/29/max-verstappen-become-youngest-driver-f1-race-weekend-japanese-grand-prix", "sport"),
      ("sport/blog/2010/feb/14/richard-williams-italy-england-six-nations", "sport"),
      ("sport/video/2014/may/28/river-maldon-mud-race-essex-video", "sport"),
      ("tv-and-radio/2014/may/21/imagine-philip-roth-unleashed-tv-review", "tv-and-radio"),
      ("uk/2010/jan/29/blair-iraq-inquiry-chilcot-911-terrorist-threat", "uk"),
      ("uk-news/2013/oct/20/london-new-york-times-foreign-rich-property", "uk-news"),
      ("us-news/2014/oct/06/apache-helicopters-isis-vulnerable-antiaircraft-iraq-syria", "us-news"),
      ("world/2014/jun/13/military-blamed-planes-vanish-europe-air-traffic-control-radar", "world"),
      ("world/video/2009/jul/22/eclipse", "world")
    )
    urlsToCanonicals foreach  {
      case (url, canonical) => {
        val result = controllers.MediaController.render(url)(TestRequest(s"/$url"))
        status(result) should be(410)
        val resultContentAsString = contentAsString(result)
        resultContentAsString should include("Sorry - this page has been removed.")
        resultContentAsString should not include("link rel=\"canonical\" href=\"http:///" + url + "\"")
        resultContentAsString should include("link rel=\"canonical\" href=\"http:///" + canonical + "\"")
      }
    }
  }

}
