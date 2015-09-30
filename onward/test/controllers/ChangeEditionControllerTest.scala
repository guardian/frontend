package controllers

import conf.switches.Switches
import play.api.test.Helpers.{cookies => playCookies, _}
import org.scalatest.{BeforeAndAfterEach, DoNotDiscover, Matchers, FlatSpec}
import test.{ConfiguredTestSuite, TestRequest}

@DoNotDiscover class ChangeEditionControllerTest extends FlatSpec with Matchers with ConfiguredTestSuite with BeforeAndAfterEach {

  val callbackName = "aFunction"

  override def afterEach(): Unit = {
    Switches.InternationalEditionSwitch.switchOff()
  }

  "ChangeEditionController" should "redirect to correct page" in {
    val result = controllers.ChangeEditionController.render("uk")(TestRequest())
    status(result) should be(302)
    header("Location", result) should be (Some("/uk"))
  }

  it should "set a preference cookie" in {
    val result = controllers.ChangeEditionController.render("au")(TestRequest())
    val GU_EDITION = playCookies(result).apply("GU_EDITION")

    GU_EDITION.maxAge.getOrElse(0) should be (5184000 +- 1)  // 60 days, this is seconds
    GU_EDITION.value should be ("AU")
  }

  it should "set the international cookie if enabled" in {

    Switches.InternationalEditionSwitch.switchOn()

    val result = controllers.ChangeEditionController.render("intl")(TestRequest())
    val GU_EDITION = playCookies(result).apply("GU_EDITION")

    GU_EDITION.maxAge.getOrElse(0) should be (5184000 +- 1)  // 60 days, this is seconds
    GU_EDITION.value should be ("INTL")

    header("Location", result).head should endWith ("/international")
  }

  it should "not set the international cookie if not enabled" in {

    Switches.InternationalEditionSwitch.switchOff()

    val result = controllers.ChangeEditionController.render("intl")(TestRequest())
    status(result) should be (404)
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
