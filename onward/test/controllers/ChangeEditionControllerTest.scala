package controllers

import conf.switches.Switches
import play.api.test.Helpers.{cookies => playCookies, _}
import org.scalatest.{BeforeAndAfterEach, DoNotDiscover, Matchers, FlatSpec}
import test.{ConfiguredTestSuite, TestRequest}

@DoNotDiscover class ChangeEditionControllerTest extends FlatSpec with Matchers with ConfiguredTestSuite with BeforeAndAfterEach {

  val callbackName = "aFunction"
  val oneYearInSeconds = 31536000


  "ChangeEditionController" should "redirect to correct page" in {
    val result = controllers.ChangeEditionController.render("uk")(TestRequest())
    status(result) should be(302)
    header("Location", result) should be (Some("/uk?INTCMP=CE_UK"))
  }

  it should "set a preference cookie" in {
    val result = controllers.ChangeEditionController.render("au")(TestRequest())
    val GU_EDITION = playCookies(result).apply("GU_EDITION")

    GU_EDITION.maxAge.getOrElse(0) should be (oneYearInSeconds +- 1)
    GU_EDITION.value should be ("AU")
  }

  it should "set the international cookie if enabled" in {

    val result = controllers.ChangeEditionController.render("int")(TestRequest())
    val GU_EDITION = playCookies(result).apply("GU_EDITION")

    GU_EDITION.maxAge.getOrElse(0) should be (oneYearInSeconds +- 1)
    GU_EDITION.value should be ("INT")

    header("Location", result).head should endWith ("/international?INTCMP=CE_INT")
  }

  it should "not cache" in {
    val result = controllers.ChangeEditionController.render("us")(TestRequest())

    header("Cache-Control", result) should be (Some("no-cache"))
    header("Pragma", result) should be (Some("no-cache"))
  }

  it should "not redirect to unknown editions" in {
    val result = controllers.ChangeEditionController.render("za")(TestRequest())
    status(result) should be (404)
  }
}
