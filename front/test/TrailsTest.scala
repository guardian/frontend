package model

import org.scalatest.{GivenWhenThen, FeatureSpec}
import org.scalatest.Matchers
import common.editions.Uk
import test.Fake
import controllers.front.TrailblockAgent
import conf.ContentApi
import contentapi.QueryDefaults
import org.scalatest.concurrent.Eventually
import org.scalatest.time.SpanSugar

class TrailsTest extends FeatureSpec with GivenWhenThen with Matchers with QueryDefaults with Eventually with SpanSugar{

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
    eventually (timeout(5.seconds), interval(1.second)) { agent.trailblock should be ('defined) }
  }
}
