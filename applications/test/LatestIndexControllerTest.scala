package test

import controllers.LatestIndexController
import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}
import play.api.test.Helpers._

@DoNotDiscover class LatestIndexControllerTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  private val MovedPermanently = 301
  private val Found = 302
  val latestIndexController = new LatestIndexController

  it should "redirect to latest for a series" in {
    val result = latestIndexController.latest("football/series/thefiver")(TestRequest())
    status(result) should be(Found)
    header("Location", result).head should include ("/football/20")
  }

  it should "redirect to latest for a blog" in {
    val result = latestIndexController.latest("fashion/fashion-blog")(TestRequest())
    status(result) should be(Found)
    header("Location", result).head should include ("/fashion-blog/")
  }

  it should "redirect to the all page for keywords" in {
    val result = latestIndexController.latest("football/arsenal")(TestRequest())
    status(result) should be(MovedPermanently)
    header("Location", result).head should endWith ("/football/arsenal/all")
  }

  it should "redirect to the all page for a section" in {
    val result = latestIndexController.latest("books")(TestRequest())
    status(result) should be(MovedPermanently)
    header("Location", result).head should be ("/books/all")
  }

  it should "404 for a bad url" in {
    val result = latestIndexController.latest("books/not-here")(TestRequest())
    status(result) should be(404)
  }
}
