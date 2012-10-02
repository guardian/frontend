package test

import org.scalatest.FeatureSpec
import org.scalatest.GivenWhenThen
import org.scalatest.matchers.ShouldMatchers
import model.Competition
import common._
import feed.{ FixtureAgent, Competitions }
import conf.FootballClient;

class CompetitionsFeatureTest extends FeatureSpec with GivenWhenThen with ShouldMatchers {

  feature("Competitions") {

    scenario("Load fixtures") {
      given("I want to display fixtures")

      then("I should be able to load fixtures")

      Fake {
        val agent = new FixtureAgent("100")
        agent.refresh()
        agent.await
        val fixtures = agent()
        fixtures.foreach(println)
        FootballClient.competitions.foreach(c => println(c.name))


        fail("not implemented")
        fail("not implemented")
      }
    }
  }

}