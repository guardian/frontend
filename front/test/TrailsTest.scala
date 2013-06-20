package model

import org.scalatest.{GivenWhenThen, FeatureSpec}
import org.scalatest.matchers.ShouldMatchers
import common.editions.Uk
import test.Fake
import controllers.front.TrailblockAgent
import conf.ContentApi
import contentapi.QueryDefaults

class TrailsTest extends FeatureSpec with GivenWhenThen with ShouldMatchers with QueryDefaults {

  implicit val edition = Uk

  feature("Query Trailblock Description") {

    scenario("Should perform a custom query") {

      Given("I have a custom query through a QueryTrailblockDescription")
      Fake {
        val agent = TrailblockAgent(CustomTrailblockDescription("lifeandstyle", "Life and style", 5){
          EditorsPicsOrLeadContentAndLatest(ContentApi.item("football", Uk).pageSize(7).response)
        })

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
