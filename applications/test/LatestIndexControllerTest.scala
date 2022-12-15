package test

import controllers.LatestIndexController
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover}
import play.api.test.Helpers._

@DoNotDiscover class LatestIndexControllerTest
    extends AnyFlatSpec
    with Matchers
    with ConfiguredTestSuite
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestWsClient
    with WithTestContentApiClient {

  private val MovedPermanently = 301
  private val Found = 302
  private val SeeOther = 303
  lazy val latestIndexController =
    new LatestIndexController(testContentApiClient, play.api.test.Helpers.stubControllerComponents())

  private val seriesTagPath = "football/series/thefiver"

  it should "redirect to latest for a series" in {
    val result = latestIndexController.latest(seriesTagPath)(TestRequest())
    status(result) should be(Found)
    header("Location", result).head should include("/football/20")
  }

  it should "redirect while indicating that the redirecting url should not appear in Google Search results" in {
    val result = latestIndexController.latest(seriesTagPath)(TestRequest())
    // We've noticed /latest paths appearing in Google Search results - probably as a result of using /latest in
    // standfirsts etc. Inadvertently this gives these redirect urls search-rank authority. It's possible that as a
    // result /latest may be cannibalising the search authority of liveblogs that take series tags (due to the
    // association of latest liveblog with the redirect).
    // https://developers.google.com/search/docs/crawling-indexing/block-indexing
    header("X-Robots-Tag", result).head should include("noindex")
  }

  it should "redirect to latest email for a blog" in {
    val result = latestIndexController.latest("fashion/fashion-blog")(TestRequest("/fashion/fashion-blog/email"))
    status(result) should be(SeeOther)
    header("Location", result).head should include("/fashion-blog/")
    header("Location", result).head should endWith("/email")
  }

  it should "redirect to latest emailjson for a blog" in {
    val result =
      latestIndexController.latest("fashion/fashion-blog")(TestRequest("/fashion/fashion-blog/email.emailjson"))
    status(result) should be(OK)
    header("X-Accel-Redirect", result).head should include("/fashion-blog/")
    header("X-Accel-Redirect", result).head should endWith("/email.emailjson")
  }

  it should "redirect to latest emailtxt for a blog" in {
    val result =
      latestIndexController.latest("fashion/fashion-blog")(TestRequest("/fashion/fashion-blog/email.emailtxt"))
    status(result) should be(OK)
    header("X-Accel-Redirect", result).head should include("/fashion-blog/")
    header("X-Accel-Redirect", result).head should endWith("/email.emailtxt")
  }

  it should "redirect with URL parameter format=email-headline for a blog" in {
    val result =
      latestIndexController.latest("fashion/fashion-blog")(TestRequest("/fashion/fashion-blog/email/headline.txt"))
    status(result) should be(OK)
    header("X-Accel-Redirect", result).head should include("/fashion-blog/")
    header("X-Accel-Redirect", result).head should endWith("/email/headline.txt")
  }

  it should "redirect to latest for a blog" in {
    val result = latestIndexController.latest("fashion/fashion-blog")(TestRequest())
    status(result) should be(Found)
    header("Location", result).head should include("/fashion-blog/")
  }

  it should "redirect to the all page for keywords" in {
    val result = latestIndexController.latest("football/arsenal")(TestRequest())
    status(result) should be(MovedPermanently)
    header("Location", result).head should endWith("/football/arsenal/all")
  }

  it should "redirect to the all page for a section" in {
    val result = latestIndexController.latest("books")(TestRequest())
    status(result) should be(MovedPermanently)
    header("Location", result).head should be("/books/all")
  }

  it should "404 for a bad url" in {
    val result = latestIndexController.latest("books/not-here")(TestRequest())
    status(result) should be(404)
  }
}
