package test

import org.scalatest.FeatureSpec
import org.scalatest.GivenWhenThen
import org.scalatest.matchers.ShouldMatchers
import model.Competition
import common._
import feed.Competitions;

class CompetitionsFeatureTest extends FeatureSpec with GivenWhenThen with ShouldMatchers {

  feature("Competitions") {

    scenario("Find Competitions") {

      given("I want to view fixtures")

      then("I should get all the competitions")

      Fake {
        Competitions.refresh()
        Competitions.warmup()

        val compeititons = Competitions.all
        // should get something back
        compeititons.size should be(2)
        // first item should be premiership competition (i.e. 100)
        compeititons(0) should be(Competition("100", "Barclays Premier League 12/13"))
        // second Npower
        compeititons(1) should be(Competition("101", "Npower Championship 12/13"))
      }

    }

  }

}