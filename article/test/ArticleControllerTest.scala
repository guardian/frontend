package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec

class ArticleControllerTest extends FlatSpec with ShouldMatchers {

  "Article Controller" should "200 when content type is article" in Fake {
    val result = controllers.ArticleController.render("environment/2012/feb/22/capitalise-low-carbon-future")(TestRequest())
    status(result) should be(200)
  }

  it should "redirect to desktop when content type is not supported in app" in Fake {
    val result = controllers.ArticleController.render("/world/interactive/2013/mar/04/choose-a-pope-interactive-guide")(TestRequest())
    status(result) should be(303)
    header("Location", result).get should be("http://www.guardian.co.uk/world/interactive/2013/mar/04/choose-a-pope-interactive-guide?mobile-redirect=false")
  }

  it should "internal redirect unsupported content to desktop" in Fake {
    val result = controllers.ArticleController.render("world/video/2012/feb/10/inside-tibet-heart-protest-video")(TestRequest())
    status(result) should be(200)
    header("X-Accel-Redirect", result).get should be("/type/video/world/video/2012/feb/10/inside-tibet-heart-protest-video")
  }

  it should "display an expired message for expired content" in Fake {
    val result = controllers.ArticleController.render("football/2012/sep/14/zlatan-ibrahimovic-paris-st-germain-toulouse")(TestRequest())
    status(result) should be(410)
    contentAsString(result) should include("Zlatan Ibrahimovic shines as Paris St Germain ease past Toulouse")
    contentAsString(result) should include("This content has been removed as our copyright has expired.")
  }
}