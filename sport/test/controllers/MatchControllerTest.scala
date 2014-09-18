package controllers

import play.api.test.Helpers._
import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}
import test._
import test.TestRequest

@DoNotDiscover class MatchControllerTest extends FlatSpec with Matchers with ConfiguredTestSuite {
  
  "MatchController" should "redirect to results when match is not found" in {
    val result = football.controllers.MatchController.renderMatchId("12345")(TestRequest())
    status(result) should be(302)
    header("Location", result).head should be ("/football/results")
  }
}