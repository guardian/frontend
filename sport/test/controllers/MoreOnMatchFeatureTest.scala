package test

import org.scalatest._
import football.controllers.MoreOnMatchController
import org.scalatest.featurespec.AnyFeatureSpec
import org.scalatest.matchers.should.Matchers
import play.api.test.Helpers._
import play.api.test.FakeRequest

@DoNotDiscover class MoreOnMatchFeatureTest
    extends AnyFeatureSpec
    with GivenWhenThen
    with Matchers
    with ConfiguredTestSuite
    with FootballTestData
    with WithTestFootballClient
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestWsClient
    with WithTestContentApiClient {

  lazy val moreOnMatchController = new MoreOnMatchController(
    testCompetitionsService,
    testContentApiClient,
    play.api.test.Helpers.stubControllerComponents(),
  )

  Feature("Match Nav") {

    Scenario("View content related to a match") {

      Given("I visit a match page")

      {
        val request = FakeRequest("GET", "/football/api/match-nav/2012/12/01/1006/65?callback=call").withHeaders(
          "host" -> "localhost:9000",
        )

        val result = moreOnMatchController.matchNav("2012", "12", "01", "1006", "65")(request)

        status(result) should be(200)

        val body = contentAsString(result)

        Then("I should see the match report")
        body should include("/football/2012/dec/02/arsenal-swansea-match-report-michu")

        And("I should see the stats page")
        body should include("/football/match/")
      }
    }

    Scenario("Non-existant match pages return status 404") {

      Given("I visit a non-existant match page")

      {
        val request = FakeRequest("GET", "football/api/match-nav/2010/01/01/1/2?callback=call").withHeaders(
          "host" -> "localhost:9000",
        )

        val result = moreOnMatchController.matchNav("2010", "01", "01", "1", "2")(request)

        status(result) should be(404)
      }
    }
  }

  Feature("More on match") {

    Scenario("View content related to a match") {

      Given("I visit a match page")

      {
        val request =
          FakeRequest("GET", "/football/api/match-nav/1010?callback=call").withHeaders("host" -> "localhost:9000")

        val result = moreOnMatchController.moreOn("1010")(request)

        status(result) should be(200)

        val body = contentAsString(result)

        Then("I should see the match report")
        body should include("/football/2012/dec/02/arsenal-swansea-match-report-michu")

        And("I should see the stats page")
        body should include("/football/match/")
      }
    }

    Scenario("Non-existant match pages return status 404") {

      Given("I visit a non-existant match page")

      {
        val request =
          FakeRequest("GET", "/football/api/match-nav/bad-id?callback=call").withHeaders("host" -> "localhost:9000")

        val result = moreOnMatchController.moreOn("bad-id")(request)

        status(result) should be(404)
      }
    }

  }
}
