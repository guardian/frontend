package model

import org.scalatest.{GivenWhenThen, FeatureSpec}
import org.scalatest.matchers.ShouldMatchers
import common.editions.{Us, Uk}
import test.Fake
import controllers.front.{ConfiguredEdition, TrailblockAgent}
import conf.ContentApi

class TrailsTest extends FeatureSpec with GivenWhenThen with ShouldMatchers {

  implicit val edition = Uk

  feature("Query Trailblock Description") {

    scenario("Should perform a custom query") {

      Given("I have a custom query through a QueryTrailblockDescription")
      Fake {
        val agent = TrailblockAgent(QueryTrailblockDescription("lifeandstyle", "Life and style", 5,
          customQuery = () => ContentApi.item("football", Uk).pageSize(7)))

        agent.refresh()
        loadOrTimeout(agent)

        val trails = agent.trailblock.get.trails

        Then("I should get the section and the size I requested")
        trails should have length (7)
        trails.head.section should be ("football")
      }
    }
  }

  private def loadOrTimeout(agent: TrailblockAgent) {
    val start = System.currentTimeMillis()
    while (!agent.trailblock.isDefined) {
      if (System.currentTimeMillis - start > 10000) throw new RuntimeException("Agent should have loaded by now")
    }
  }
}
