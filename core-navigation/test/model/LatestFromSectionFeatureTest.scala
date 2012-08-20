package model

import org.scalatest.matchers.ShouldMatchers
import org.scalatest.{ GivenWhenThen, FeatureSpec }
import test.`package`._

class LatestFromSectionFeatureTest extends FeatureSpec with GivenWhenThen with ShouldMatchers {

  feature("Latest from section") {

    scenario("Shows latest links from a science") {

      given("there is an article in science")
      HtmlUnit("/section/latest/UK/science") {
        browser =>
          import browser._

          then("I should see the latest links from Science")
          $("li") should have length 10

      }
    }

    scenario("Shows latest links from network front") {
      given("I am on the network front")
      HtmlUnit("/section/latest/UK") {
        browser =>
          import browser._

          then("I should see the latest links")
          $("li") should have length 10
      }
    }

    scenario("Shows latest links for a section in US edition") {
      given("I am on comment is free in the US edition")
      HtmlUnit("/section/latest/US/commentisfree") {
        browser =>
          import browser._

          then("I should see the latest links from comment is free")
          $("li") should have length 10
      }
    }
  }
}

