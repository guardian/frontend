package controllers

import org.scalatest.flatspec.AnyFlatSpec
import play.api.test.Helpers.{cookies => playCookies, _}
import org.scalatest.{BeforeAndAfterEach, DoNotDiscover}
import org.scalatest.matchers.should.Matchers
import test.{ConfiguredTestSuite, TestRequest}

@DoNotDiscover class ChangeEditionControllerTest
    extends AnyFlatSpec
    with Matchers
    with ConfiguredTestSuite
    with BeforeAndAfterEach {

  val callbackName = "aFunction"
  val oneYearInSeconds = 31536000

  lazy val changeEditionController = new ChangeEditionController(play.api.test.Helpers.stubControllerComponents())

  "ChangeEditionController" should "redirect to correct page" in {
    val result = changeEditionController.render("uk")(TestRequest())
    status(result) should be(302)
    header("Location", result) should be(Some("/uk?INTCMP=CE_UK"))
  }

  it should "set a preference cookie" in {
    val result = changeEditionController.render("au")(TestRequest())
    val GU_EDITION = playCookies(result).apply("GU_EDITION")

    GU_EDITION.maxAge.getOrElse(0) should be(oneYearInSeconds +- 1)
    GU_EDITION.value should be("AU")
  }

  it should "set the international cookie if enabled" in {

    val result = changeEditionController.render("int")(TestRequest())
    val GU_EDITION = playCookies(result).apply("GU_EDITION")

    GU_EDITION.maxAge.getOrElse(0) should be(oneYearInSeconds +- 1)
    GU_EDITION.value should be("INT")

    header("Location", result).head should endWith("/international?INTCMP=CE_INT")
  }

  it should "not cache" in {
    val result = changeEditionController.render("us")(TestRequest())

    header("Cache-Control", result) should be(Some("private, no-store, no-cache"))
  }

  it should "not redirect to unknown editions" in {
    val result = changeEditionController.render("za")(TestRequest())
    status(result) should be(404)
  }
}
