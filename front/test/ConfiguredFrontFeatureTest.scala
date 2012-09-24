package test

import org.scalatest.{ GivenWhenThen, FeatureSpec }

import controllers.front.ConfiguredFront
import model.TrailblockDescription
import org.scalatest.matchers.ShouldMatchers

class ConfiguredFrontFeatureTest extends FeatureSpec with GivenWhenThen with ShouldMatchers {

  feature("Configured front") {

    scenario("Load front configuration") {

      given("I visit the Network Front")

      Fake {
        val front = new ConfiguredFront {
          override val configUrl = "http://s3-eu-west-1.amazonaws.com/aws-frontend-store/TMC/config/front-test.json"
        }

        front.refresh()
        front.await()

        then("I should see the configured feature trailblock")
        front("US").map(_.description) should be(Seq(TrailblockDescription("world/iraq", "Iraq", 3)))
        front("UK").map(_.description) should be(Seq(TrailblockDescription("politics", "Politics", 3)))
      }
    }
  }
}
