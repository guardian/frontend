package test

import org.scalatest.{ GivenWhenThen, FeatureSpec }

import controllers.front.ConfiguredEdition
import model.TrailblockDescription
import org.scalatest.matchers.ShouldMatchers

class ConfiguredEditionFeatureTest extends FeatureSpec with GivenWhenThen with ShouldMatchers {

  feature("Configured front") {

    scenario("Load front configuration for UK edition") {

      Given("I visit the Network Front")
      And("I am on the UK edition")
      Fake {
        val front = new ConfiguredEdition("UK", Nil) {
          override val configUrl = "http://s3-eu-west-1.amazonaws.com/aws-frontend-store/TMC/config/front-test.json"
        }

        front.refresh()
        front.warmup

        Then("I should see the configured feature trailblock")
        front.configuredTrailblocks.map(_.description) should be(Seq(TrailblockDescription("politics", "Politics", 3)))
      }
    }

    scenario("Load front configuration for US edition") {

      Given("I visit the Network Front")
      And("I am on the US edition")
      Fake {
        val front = new ConfiguredEdition("US", Nil) {
          override val configUrl = "http://s3-eu-west-1.amazonaws.com/aws-frontend-store/TMC/config/front-test.json"
        }

        front.refresh()
        front.warmup

        Then("I should see the configured feature trailblock")
        front.configuredTrailblocks.map(_.description) should be(Seq(TrailblockDescription("world/iraq", "Iraq", 3, showMore = true)))
      }
    }

    scenario("Survive loading bad configuration") {

      Given("I visit the Network Front")
      And("the feature trailblock has broken confiuration")
      Fake {
        val front = new ConfiguredEdition("US", Nil) {
          override val configUrl = "http://s3-eu-west-1.amazonaws.com/aws-frontend-store/TMC/config/front-bad-does-not-exist.json"
        }

        front.refresh()
        front.warmup

        Then("I the feature trailblock should collapse")
        front.configuredTrailblocks.map(_.description) should be(Nil)
      }
    }
  }
}
