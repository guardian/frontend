package test

import org.scalatest.FeatureSpec
import org.scalatest.GivenWhenThen
import org.scalatest.matchers.ShouldMatchers
import controllers.TrailblockAgent

class FrontFeatureTest extends FeatureSpec with GivenWhenThen with ShouldMatchers {

  feature("Network Front") {

    scenario("display top stories") {
      given("I visit the Network Front")

      Fake {

        //in real life these will always be editors picks only (content api does not do latest for front)
        val agent = TrailblockAgent("", "Top Stories", 5, "UK")

        agent.refresh()
        agent.await(2000)

        val trails = agent.trailblock.get.trails

        then("I should see the Top Stories")
        //we cannot really guarantee a length here
        //but it is unlikely to ever be < 10
        trails.length should be > 10
      }
    }

    scenario("load latest trails if there are no editors picks for a block") {
      given("I visit the Network Front")

      Fake {

        //in real life this tag will have no editors picks
        val agent = TrailblockAgent("lifeandstyle/seasonal-food", "Seasonal food", 5, "UK")

        agent.refresh()
        agent.await(2000)

        val trails = agent.trailblock.get.trails

        then("I should see the latest trails for a block that has no editors picks")
        trails should have length (20) //if only latest you just get 20 latest, hence exact length
      }
    }

    scenario("load editors picks and latest") {
      given("I visit the Network Front")

      Fake {

        //in real life this will be a combination of editors picks + latest
        val agent = TrailblockAgent("sport", "Sport", 5, "UK")

        agent.refresh()
        agent.await(2000)

        val trails = agent.trailblock.get.trails

        then("I should see a combination of editors picks and latest")
        trails.length should be > 20 //if it is a combo you get editors picks + 20 latest, hence > 20
      }
    }
  }
}
