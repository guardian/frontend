package test

import football.controllers.MatchController
import play.api.test.Helpers._
import org.scalatest.{DoNotDiscover, FlatSpec, Matchers}

@DoNotDiscover class MatchControllerTest
  extends FlatSpec
  with Matchers
  with FootballTestSuite {

  val matchController = new MatchController(competitionsService, testFootballClient)

  "MatchController" should "redirect to results when match is not found" in {
    val result = matchController.renderMatchId("12345")(TestRequest())
    status(result) should be(302)
    header("Location", result).head should be ("/football/results")
  }
}
