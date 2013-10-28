package controllers

import play.api.test.Helpers._
import org.scalatest.Matchers
import org.scalatest.FlatSpec
import test.{TestRequest, Fake}

class MatchControllerTest extends FlatSpec with Matchers {
  
  "MatchController" should "redirect to results when match is not found" in Fake {
    val result = football.controllers.MatchController.renderMatchId("12345")(TestRequest())
    status(result) should be(302)
    header("Location", result).head should be ("/football/results")
  }
}