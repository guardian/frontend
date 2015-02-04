package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}

@DoNotDiscover class ArticleControllerTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  val articleUrl = "environment/2012/feb/22/capitalise-low-carbon-future"
  val liveBlogUrl = "global/middle-east-live/2013/sep/09/syria-crisis-russia-kerry-us-live"
  val sudokuUrl = "lifeandstyle/2013/sep/09/sudoku-2599-easy"

  "Article Controller" should "200 when content type is article" in {
    val result = controllers.ArticleController.renderArticle(articleUrl)(TestRequest(articleUrl))
    status(result) should be(200)
  }

  it should "200 when content type is live blog" in {
    val result = controllers.ArticleController.renderArticle(liveBlogUrl)(TestRequest(liveBlogUrl))
    status(result) should be(200)
  }

  it should "count in body links" in {
    val result = controllers.ArticleController.renderArticle(liveBlogUrl)(TestRequest(liveBlogUrl))
    val body = contentAsString(result)
    body should include(""""inBodyInternalLinkCount":38""")
    body should include(""""inBodyExternalLinkCount":42""")
  }

  it should "200 when content type is sudoku" in {
    val result = controllers.ArticleController.renderArticle(sudokuUrl)(TestRequest(sudokuUrl))
    status(result) should be(200)
  }

  it should "not cache 404s" in {
    val result = controllers.ArticleController.renderArticle("oops")(TestRequest())
    status(result) should be(404)
    header("Cache-Control", result).head should be ("no-cache")
  }

  it should "redirect for short urls" in {
    val result = controllers.ArticleController.renderArticle("p/39heg")(TestRequest("/p/39heg"))
    status(result) should be (302)
    header("Location", result).head should be ("/uk/2012/aug/07/woman-torture-burglary-waterboard-surrey")
  }

  it should "return JSON when .json format is supplied" in {
    val fakeRequest = FakeRequest("GET", s"${articleUrl}.json")
      .withHeaders("Origin" -> "http://www.theorigin.com")

    val result = controllers.ArticleController.renderArticle(articleUrl)(fakeRequest)
    status(result) should be(200)
    contentType(result).get should be("application/json")
    contentAsString(result) should startWith("{\"config\"")
  }

  it should "internal redirect unsupported content to classic" in {
    val result = controllers.ArticleController.renderArticle("world/video/2012/feb/10/inside-tibet-heart-protest-video")(TestRequest("world/video/2012/feb/10/inside-tibet-heart-protest-video"))
    status(result) should be(200)
    header("X-Accel-Redirect", result).get should be("/applications/world/video/2012/feb/10/inside-tibet-heart-protest-video")
  }

  val expiredArticle = "football/2012/sep/14/zlatan-ibrahimovic-paris-st-germain-toulouse"

  it should "return the latest blocks of a live blog" in {
    val fakeRequest = FakeRequest(GET, "/environment/blog/2013/jun/26/barack-obama-climate-action-plan.json?lastUpdate=block-51cae3aee4b02dad15c7494e")
      .withHeaders("host" -> "localhost:9000")

    val result = controllers.ArticleController.renderLatest("environment/blog/2013/jun/26/barack-obama-climate-action-plan", Some("block-51cae3aee4b02dad15c7494e"))(fakeRequest)
    status(result) should be(200)

    val content = contentAsString(result)

    // newer blocks
    content should include("block-51cb058fe4b0a53e53280c8d")
    content should include("block-51cafaa9e4b0e2a9937599df")

    //this block
    content should not include "block-51cae3aee4b02dad15c7494e"

    //older block
    content should not include "block-51caab7be4b08c78ea33d49d"

  }

  it should "know which backend served the request" in {
    val result = route(app, TestRequest("/world/2014/sep/24/radical-cleric-islamic-state-release-british-hostage-alan-henning")).head
    status(result) should be (200)
    header("X-Gu-Backend-App", result).head should be ("test-project")
  }
}
