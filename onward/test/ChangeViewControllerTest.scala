package test

import play.api.test.Helpers.{cookies => playCookies, _}
import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}

@DoNotDiscover class ChangeViewControllerTest extends FlatSpec with Matchers with ConfiguredTestSuite {
  
  val callbackName = "aFunction"

  "ChangeViewController" should "redirect to correct page" in {
    val result = controllers.ChangeViewController.render("responsive", "/foo/bar")(TestRequest())
    status(result) should be(302)
    header("Location", result) should be (Some("/foo/bar"))
  }

  it should "set a preference cookie" in {
    val result = controllers.ChangeViewController.render("classic", "/foo/bar?view=responsive")(TestRequest())
    val GU_VIEW = playCookies(result).apply("GU_VIEW")

    GU_VIEW.maxAge should be (Some(5184000))  // 60 days, this is seconds
    GU_VIEW.value should be ("classic")
  }

  it should "not cache" in {
    val result = controllers.ChangeViewController.render("classic", "/foo/bar?view=responsive")(TestRequest())

    header("Cache-Control", result) should be (Some("no-cache"))
    header("Pragma", result) should be (Some("no-cache"))
  }

  it should "not accept redirects to arbitrary domains" in {
    val result = controllers.ChangeViewController.render("responsive", "http://www.bbc.co.uk/sport/0/football")(TestRequest())
    status(result) should be (403)
  }

  it should "not accept redirects to arbitrary protocol relative domains" in {
    val result = controllers.ChangeViewController.render("responsive", "//www.bbc.co.uk/sport/0/football")(TestRequest())
    status(result) should be (403)
  }
}
