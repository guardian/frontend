package test

import org.scalatest.matchers.ShouldMatchers
import org.scalatest.{ GivenWhenThen, FeatureSpec }
import controllers.MoreOnMatchController
import play.api.test.Helpers._
import play.api.test.FakeRequest

class MoreOnMatchFeatureTest extends FeatureSpec with GivenWhenThen with ShouldMatchers {

  val theMatch =

  feature("More on match") {

    scenario("View content related to a match") {

      Given("I visit a match page")

      FakeWithTestData {
        val request = FakeRequest("GET", "/football/foo?callback=call").withHeaders("host" -> "localhost:9000")

        val result = MoreOnMatchController.matchNav("2012", "12", "01", "1006", "65")(request)

        status(result) should be(200)

        val body = contentAsString(result)

        Then("I should see the match report")
        body should include("/football/2012/dec/02/arsenal-swansea-match-report-michu")

        And("I should see the stats page")
        body should include("/football/match/")
      }
    }
  }
}
