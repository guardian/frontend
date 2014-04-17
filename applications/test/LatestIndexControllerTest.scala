package test

import org.scalatest.{Matchers, FlatSpec}
import play.api.test.Helpers._

class LatestIndexControllerTest extends FlatSpec with Matchers {

  private val PermanentRedirect = 301
  private val TemporaryRedirect = 302

  it should "redirect to latest for a series" in Fake {
    val result = controllers.LatestIndexController.latest("football/series/thefiver")(TestRequest())
    status(result) should be(TemporaryRedirect)
    header("Location", result).head should include ("/football/20")
  }

  it should "redirect to latest for a blog" in Fake {
    val result = controllers.LatestIndexController.latest("fashion/fashion-blog")(TestRequest())
    status(result) should be(TemporaryRedirect)
    header("Location", result).head should include ("/fashion/fashion-blog/20")
  }

  it should "redirect to the all page for keywords" in Fake {
    val result = controllers.LatestIndexController.latest("football/arsenal")(TestRequest())
    status(result) should be(PermanentRedirect)
    header("Location", result).head should endWith ("/football/arsenal/all")
  }

  it should "redirect to the all page for a section" in Fake {
    val result = controllers.LatestIndexController.latest("books")(TestRequest())
    status(result) should be(PermanentRedirect)
    header("Location", result).head should endWith ("/books/all")
  }

  it should "404 for a bad url" in Fake {
    val result = controllers.LatestIndexController.latest("books/not-here")(TestRequest())
    status(result) should be(404)
  }
}
