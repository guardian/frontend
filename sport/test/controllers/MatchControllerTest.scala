package test

import football.controllers.MatchController
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import play.api.test.Helpers._
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover}

@DoNotDiscover class MatchControllerTest
    extends AnyFlatSpec
    with ConfiguredTestSuite
    with Matchers
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestWsClient
    with WithTestFootballClient
    with WithTestApplicationContext
    with WithTestExecutionContext
    with FootballTestData {

  lazy val matchController =
    new MatchController(testCompetitionsService, wsClient, play.api.test.Helpers.stubControllerComponents())

  "MatchController" should "redirect to results when match is not found" in {
    val result = matchController.renderMatchId("12345")(TestRequest())
    status(result) should be(302)
    header("Location", result).head should be("/football/results")
  }
}
