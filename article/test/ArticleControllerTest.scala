package test

import controllers.ArticleController
import org.apache.commons.codec.digest.DigestUtils
import play.api.test._
import play.api.test.Helpers._
import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}
import scala.collection.JavaConversions._

@DoNotDiscover class ArticleControllerTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  val articleUrl = "environment/2012/feb/22/capitalise-low-carbon-future"
  val liveBlogUrl = "global/middle-east-live/2013/sep/09/syria-crisis-russia-kerry-us-live"
  val sudokuUrl = "lifeandstyle/2013/sep/09/sudoku-2599-easy"

  lazy val articleController = new ArticleController

  "Article Controller" should "200 when content type is article" in {
    val result = articleController.renderArticle(articleUrl)(TestRequest(articleUrl))
    status(result) should be(200)
  }

  it should "200 when content type is live blog" in {
    val result = articleController.renderArticle(liveBlogUrl)(TestRequest(liveBlogUrl))
    status(result) should be(200)
  }

  it should "count in body links" in {
    val result = articleController.renderArticle(liveBlogUrl)(TestRequest(liveBlogUrl))
    val body = contentAsString(result)
    body should include(""""inBodyInternalLinkCount":38""")
    body should include(""""inBodyExternalLinkCount":42""")
  }

  it should "200 when content type is sudoku" in {
    val result = articleController.renderArticle(sudokuUrl)(TestRequest(sudokuUrl))
    status(result) should be(200)
  }

  it should "not cache 404s" in {
    val result = articleController.renderArticle("oops")(TestRequest())
    status(result) should be(404)
    header("Cache-Control", result).head should be ("no-cache")
  }

  it should "redirect for short urls" in {
    val result = articleController.renderArticle("p/39heg")(TestRequest("/p/39heg"))
    status(result) should be (302)
    header("Location", result).head should be ("/uk/2012/aug/07/woman-torture-burglary-waterboard-surrey")
  }

  it should "return JSON when .json format is supplied" in {
    val fakeRequest = FakeRequest("GET", s"${articleUrl}.json")
      .withHeaders("Origin" -> "http://www.theorigin.com")

    val result = articleController.renderJson(articleUrl)(fakeRequest)
    status(result) should be(200)
    contentType(result).get should be("application/json")
    contentAsString(result) should startWith("{\"config\"")
  }

  it should "internal redirect unsupported content to classic" in {
    val result = articleController.renderArticle("world/video/2012/feb/10/inside-tibet-heart-protest-video")(TestRequest("world/video/2012/feb/10/inside-tibet-heart-protest-video"))
    status(result) should be(200)
    header("X-Accel-Redirect", result).get should be("/applications/world/video/2012/feb/10/inside-tibet-heart-protest-video")
  }

  val expiredArticle = "football/2012/sep/14/zlatan-ibrahimovic-paris-st-germain-toulouse"

  it should "return the latest blocks of a live blog" in {
    val lastUpdateBlock = "block-56d03169e4b074a9f6b35baa"
    val fakeRequest = FakeRequest(GET, s"/football/live/2016/feb/26/fifa-election-who-will-succeed-sepp-blatter-president-live.json?lastUpdate=${lastUpdateBlock}")
      .withHeaders("host" -> "localhost:9000")

    val result = articleController.renderLiveBlogJson("/football/live/2016/feb/26/fifa-election-who-will-succeed-sepp-blatter-president-live", Some(lastUpdateBlock), None, Some(true))(fakeRequest)
    status(result) should be(200)

    val content = contentAsString(result)

    // newer blocks
    content should include("block-56d03894e4b0bd5a0524cbab")
    content should include("block-56d039fce4b0d38537b1f61e")
    content should not include("56d04877e4b0bd5a0524cbe2")// at the moment it only tries 5 either way, reverse this test once we use blocks:published-since

    //this block
    content should not include lastUpdateBlock

    //older block
    content should not include "block-56d02bd2e4b0d38537b1f5fa"

  }

  it should "know which backend served the request" in {
    val result = route(app, TestRequest("/world/2014/sep/24/radical-cleric-islamic-state-release-british-hostage-alan-henning")).head
    status(result) should be (200)
    header("X-Gu-Backend-App", result).head should be ("test-project")
  }

  it should "infer a Surrogate-Key based on the path" in {

    val expectedSurrogateKey = DigestUtils.md5Hex("/stage/2015/jul/15/alex-edelman-steve-martin-edinburgh-fringe")

    val result = route(app, TestRequest("/stage/2015/jul/15/alex-edelman-steve-martin-edinburgh-fringe?index=7")).head
    header("Surrogate-Key", result).head should be (expectedSurrogateKey)
  }

  "International users" should "be in the International edition" in {
    val request = TestRequest("/world/2014/sep/24/radical-cleric-islamic-state-release-british-hostage-alan-henning")
      .withHeaders(
        "X-GU-Edition" -> "int"
      )
    val result = route(app, request).head
    contentAsString(result) should include ("\"edition\":\"INT\"")
  }

  "Interactive articles" should "provide a boot.js script element as a main embed" in goTo("/sport/2015/sep/11/how-women-in-tennis-achieved-equal-pay-us-open") { browser =>
    import browser._
    $(".media-primary > .element-interactive").getAttributes("data-interactive").head should endWith ("boot.js")
  }
}
