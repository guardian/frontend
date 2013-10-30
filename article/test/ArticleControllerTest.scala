package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.Matchers
import org.scalatest.FlatSpec
import conf.Switches

class ArticleControllerTest extends FlatSpec with Matchers {
  
  val articleUrl = "/environment/2012/feb/22/capitalise-low-carbon-future"
  val liveBlogUrl = "/global/middle-east-live/2013/sep/09/syria-crisis-russia-kerry-us-live"
  val sudokuUrl = "/lifeandstyle/2013/sep/09/sudoku-2599-easy"
  val callbackName = "aFunction"

  "Article Controller" should "200 when content type is article" in Fake {
    val result = controllers.ArticleController.renderArticle(articleUrl)(TestRequest(articleUrl))
    status(result) should be(200)
  }

  it should "200 when content type is live blog" in Fake {
    val result = controllers.ArticleController.renderArticle(liveBlogUrl)(TestRequest(liveBlogUrl))
    status(result) should be(200)
  }

  it should "200 when content type is sudoku" in Fake {
    val result = controllers.ArticleController.renderArticle(sudokuUrl)(TestRequest(sudokuUrl))
    status(result) should be(200)
  }

  it should "redirect for short urls" in Fake {
    val result = controllers.ArticleController.renderArticle("p/39heg")(TestRequest("/p/39heg"))
    status(result) should be (302)
    header("Location", result).head should be ("/uk/2012/aug/07/woman-torture-burglary-waterboard-surrey")
  }

  it should "redirect for short urls with Twitter suffix" in Fake {
    val result = controllers.ArticleController.renderArticle("p/39heg/tw")(TestRequest("/p/39heg/tw"))
    status(result) should be (302)
    header("Location", result).head should be ("/uk/2012/aug/07/woman-torture-burglary-waterboard-surrey")
  }

  it should "return JSONP when callback is supplied" in Fake {
    val fakeRequest = FakeRequest(GET, s"${articleUrl}?callback=$callbackName")

    val result = controllers.ArticleController.renderArticle(articleUrl)(fakeRequest)
    status(result) should be(200)
    contentType(result).get should be("application/javascript")
    contentAsString(result) should startWith(s"""$callbackName({\"config\"""")
  }

  it should "return JSON when .json format is supplied" in Fake {
    val fakeRequest = FakeRequest("GET", s"${articleUrl}.json")
      .withHeaders("Origin" -> "http://www.theorigin.com")
      
    val result = controllers.ArticleController.renderArticle(articleUrl)(fakeRequest)
    status(result) should be(200)
    contentType(result).get should be("application/json")
    contentAsString(result) should startWith("{\"config\"")
  }

  it should "redirect to desktop when content type is not supported in app" in Fake {
    val result = controllers.ArticleController.renderArticle("/world/interactive/2013/mar/04/choose-a-pope-interactive-guide")(TestRequest("/world/interactive/2013/mar/04/choose-a-pope-interactive-guide"))
    status(result) should be(303)
    header("Location", result).get should be("http://www.theguardian.com/world/interactive/2013/mar/04/choose-a-pope-interactive-guide?view=desktop")
  }

  it should "internal redirect unsupported content to desktop" in Fake {
    val result = controllers.ArticleController.renderArticle("world/video/2012/feb/10/inside-tibet-heart-protest-video")(TestRequest("world/video/2012/feb/10/inside-tibet-heart-protest-video"))
    status(result) should be(200)
    header("X-Accel-Redirect", result).get should be("/type/video/world/video/2012/feb/10/inside-tibet-heart-protest-video")
  }

  val expiredArticle = "football/2012/sep/14/zlatan-ibrahimovic-paris-st-germain-toulouse"

  it should "display an expired message for expired content" in Fake {
    val result = controllers.ArticleController.renderArticle(expiredArticle)(TestRequest(s"/$expiredArticle"))
    status(result) should be(410)
    contentAsString(result) should include("Zlatan Ibrahimovic shines as Paris St Germain ease past Toulouse")
    contentAsString(result) should include("This content has been removed as our copyright has expired.")
  }

  it should "return JSONP for expired content" in Fake {
    val fakeRequest = FakeRequest(GET, s"/${expiredArticle}?callback=${callbackName}")
      .withHeaders("host" -> "localhost:9000")

    val result = controllers.ArticleController.renderArticle(expiredArticle)(fakeRequest)
    status(result) should be(200)
    contentType(result).get should be("application/javascript")
    contentAsString(result) should startWith(s"""${callbackName}({\"config\"""") // the callback
  }

  it should "return the latest blocks of a live blog" in Fake {
    val fakeRequest = FakeRequest(GET, "environment/blog/2013/jun/26/barack-obama-climate-action-plan.json?lastUpdate=block-51cae3aee4b02dad15c7494e")
      .withHeaders("host" -> "localhost:9000")

    val result = controllers.ArticleController.renderLatest("environment/blog/2013/jun/26/barack-obama-climate-action-plan.json", Some("block-51cae3aee4b02dad15c7494e"))(fakeRequest)
    status(result) should be(200)

    val content = contentAsString(result)

    // newer blocks
    content should include("block-51cb058fe4b0a53e53280c8d")
    content should include("block-51cafaa9e4b0e2a9937599df")

    //this block
    content should not include("block-51cae3aee4b02dad15c7494e")

    //older block
    content should not include("block-51caab7be4b08c78ea33d49d")

  }
}