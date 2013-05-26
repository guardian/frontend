package test

import org.scalatest.{ GivenWhenThen, FeatureSpec }

import controllers.front.{TrailblockAgent, ConfiguredEdition}
import model.{ItemTrailblockDescription, TrailblockDescription}
import org.scalatest.matchers.ShouldMatchers
import common.editions.{Us, Uk}

class ConfiguredEditionFeatureTest extends FeatureSpec with GivenWhenThen with ShouldMatchers {

  feature("Configured front") {

    ignore("Load front configuration for UK edition") {

      Given("I visit the Network Front")
      And("I am on the UK edition")
      Fake {
        val front = new ConfiguredEdition(Uk, Nil) {
          override val configUrl = "http://s3-eu-west-1.amazonaws.com/aws-frontend-store/TMC/config/front-test.json"
        }

        front.refresh()
        loadOrTimeout(front)

        Then("I should see the configured feature trailblock")
        front.configuredTrailblocks.map(_.description) should be(Seq(ItemTrailblockDescription("politics", "Politics", 3)(Uk)))
      }
    }

    ignore("Load front configuration for US edition") {

      Given("I visit the Network Front")
      And("I am on the US edition")
      Fake {
        val front = new ConfiguredEdition(Us, Nil) {
          override val configUrl = "http://s3-eu-west-1.amazonaws.com/aws-frontend-store/TMC/config/front-test.json"
        }

        front.refresh()
        loadOrTimeout(front)

        Then("I should see the configured feature trailblock")
        front.configuredTrailblocks.map(_.description) should be(Seq(ItemTrailblockDescription("world/iraq", "Iraq", 3, showMore = true)(Us)))
      }
    }

    ignore("Survive loading bad configuration") {

      Given("I visit the Network Front")
      And("the feature trailblock has broken confiuration")
      Fake {
        val front = new ConfiguredEdition(Us, Nil) {
          override val configUrl = "http://s3-eu-west-1.amazonaws.com/aws-frontend-store/TMC/config/front-bad-does-not-exist.json"
        }

        front.refresh()

        Then("the feature trailblock should collapse")
        front.configuredTrailblocks.map(_.description) should be(Nil)
      }
    }
  }

  private def loadOrTimeout(front: ConfiguredEdition) {
    val start = System.currentTimeMillis()
    while (front.configuredTrailblocks.isEmpty) {
      if (System.currentTimeMillis - start > 10000) throw new RuntimeException("Agent should have loaded by now")
    }
  }
}
