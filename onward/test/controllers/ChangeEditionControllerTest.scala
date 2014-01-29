package controllers

import play.api.test.Helpers._
import org.scalatest.Matchers
import org.scalatest.FlatSpec
import test.{Fake, TestRequest}

class ChangeEditionControllerTest extends FlatSpec with Matchers {
  
  val callbackName = "aFunction"

  "ChangeEditionController" should "redirect to correct page" in Fake {
    val result = controllers.ChangeEditionController.render("uk")(TestRequest())
    status(result) should be(302)
    header("Location", result) should be (Some("/uk"))
  }

  it should "set a preference cookie" in Fake {
    val result = controllers.ChangeEditionController.render("au")(TestRequest())
    val GU_EDITION = cookies(result).apply("GU_EDITION")

    GU_EDITION.maxAge should be (Some(5184000))  // 60 days, this is seconds
    GU_EDITION.value should be ("AU")
  }

  it should "not cache" in Fake {
    val result = controllers.ChangeEditionController.render("us")(TestRequest())

    header("Cache-Control", result) should be (Some("no-cache"))
    header("Pragma", result) should be (Some("no-cache"))
  }

  it should "not redirect to unknown editions" in Fake {
    val result = controllers.ChangeEditionController.render("za")(TestRequest())
    status(result) should be (404)
  }
}
