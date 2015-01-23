package test

import org.scalatest.{DoNotDiscover, Matchers, GivenWhenThen, FeatureSpec}
import football.controllers.MoreOnMatchController
import play.api.test.Helpers._
import play.api.test.FakeRequest

@DoNotDiscover class MoreOnMatchFeatureTest extends FeatureSpec with GivenWhenThen with Matchers with ConfiguredTestSuite {

  feature("Match Nav") {

    scenario("View content related to a match") {

      Given("I visit a match page")

      {
        val request = FakeRequest("GET", "/football/api/match-nav/2012/12/01/1006/65?callback=call").withHeaders("host" -> "localhost:9000")

        val result = MoreOnMatchController.matchNav("2012", "12", "01", "1006", "65")(request)

        status(result) should be(200)

        val body = contentAsString(result)

        Then("I should see the match report")
        body should include("/football/2012/dec/02/arsenal-swansea-match-report-michu")

        And("I should see the stats page")
        body should include("/football/match/")
      }
    }

    scenario("Non-existant match pages return status 404") {

      Given("I visit a non-existant match page")

      {
        val request = FakeRequest("GET", "football/api/match-nav/2010/01/01/1/2?callback=call").withHeaders("host" -> "localhost:9000")

        val result = MoreOnMatchController.matchNav("2010", "01", "01", "1", "2")(request)

        status(result) should be(404)
      }
    }
  }

  feature("More on match") {

    scenario("View content related to a match") {

      Given("I visit a match page")

      {
        val request = FakeRequest("GET", "/football/api/match-nav/1010?callback=call").withHeaders("host" -> "localhost:9000")

        val result = MoreOnMatchController.moreOn("1010")(request)

        status(result) should be(200)

        val body = contentAsString(result)

        Then("I should see the match report")
        body should include("/football/2012/dec/02/arsenal-swansea-match-report-michu")

        And("I should see the stats page")
        body should include("/football/match/")
      }
    }

    scenario("Non-existant match pages return status 404") {

      Given("I visit a non-existant match page")

      {
        val request = FakeRequest("GET", "/football/api/match-nav/bad-id?callback=call").withHeaders("host" -> "localhost:9000")

        val result = MoreOnMatchController.moreOn("bad-id")(request)

        status(result) should be(404)
      }
    }

  }
}
