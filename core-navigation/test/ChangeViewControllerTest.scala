package test

import play.api.test.Helpers._
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec

class ChangeViewControllerTest extends FlatSpec with ShouldMatchers {
  
  val callbackName = "aFunction"

  "ChangeViewController" should "redirect to correct page" in Fake {
    val result = controllers.ChangeViewController.render("mobile", "/foo/bar?view=mobile")(TestRequest())
    status(result) should be(302)
    header("Location", result) should be (Some("/foo/bar?view=mobile"))
  }

  it should "set a preference cookie" in Fake {
    val result = controllers.ChangeViewController.render("desktop", "/foo/bar?view=mobile")(TestRequest())
    val GU_VIEW = cookies(result).apply("GU_VIEW")

    GU_VIEW.maxAge should be (Some(60))
    GU_VIEW.value should be ("desktop")
  }

  it should "not cache" in Fake {
    val result = controllers.ChangeViewController.render("desktop", "/foo/bar?view=mobile")(TestRequest())

    header("Cache-Control", result) should be (Some("no-cache"))
    header("Pragma", result) should be (Some("no-cache"))
  }

  it should "not accept redirects to arbitrary domains" in Fake {
    val result = controllers.ChangeViewController.render("mobile", "http://www.bbc.co.uk/sport/0/football")(TestRequest())
    status(result) should be (403)
  }

  it should "not accept redirects to arbitrary protocol relative domains" in Fake {
    val result = controllers.ChangeViewController.render("mobile", "//www.bbc.co.uk/sport/0/football")(TestRequest())
    status(result) should be (403)
  }
}
