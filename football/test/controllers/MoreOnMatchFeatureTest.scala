package controllers

import org.scalatest.matchers.ShouldMatchers
import org.scalatest.{ GivenWhenThen, FeatureSpec }
import test.`package`.HtmlUnit

class MoreOnMatchFeatureTest extends FeatureSpec with GivenWhenThen with ShouldMatchers {

  feature("More on match") {

    scenario("View content related to a match") {

      given("I visit a match page")



      HtmlUnit("/football/api/match-nav/2012/12/01/1006/65") { browser =>
        import browser._

        then("I should see the match report")
        $("h3").getTexts should contain("Swansea's whole approach leaves Arsenal manager stuck for answers")

        and("I should see the squad sheet")
        $("h3").getTexts should contain("Arsenal v Swansea City: Squad sheets")

        and("I should see the Clockwatch blog")
        $("h3").getTexts should contain("Saturday clockwatch – as it happened")
      }
    }
  }
}
