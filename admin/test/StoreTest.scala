package test

import java.util.UUID
import tools.Store
import org.scalatest.{ GivenWhenThen, FeatureSpec }
import org.scalatest.Matchers

class StoreTest extends FeatureSpec with GivenWhenThen with Matchers {

  feature("Front configuration"){

    scenario("upload config to S3"){
      val store = new Store {
        override lazy val configKey = "TESTING/config/front.json"
        override lazy val switchesKey = "TESTING/config/switches.properties"
      }

      Given("I save the config")
      val unique =  UUID.randomUUID().toString
      store.putConfig(unique)

      Then("The configuration should be saved to S3")
      store.getConfig should be (Some(unique))
    }

    scenario("No config avaliable"){
      Given("I attempt to get the config from S3")
      And("no config is available")
      val store = new Store {
        override lazy val configKey = "TESTING/config/dummy.json"
      }

      Then("I should not see an error")
      store.getConfig should be (None)
    }
  }

  feature("Switchboard") {
    scenario("upload switchboard") {
      val store = new Store {
        override lazy val configKey = "TESTING/config/front.json"
        override lazy val switchesKey = "TESTING/config/switches.properties"
      }

      val unique =  UUID.randomUUID().toString
      store.putSwitches(unique)

      Then("The switchboard should be saved to S3")
      store.getSwitches should be (Some(unique))
    }
  }

  scenario("No switchboard avaliable"){
    Given("I attempt to get the switchboard from S3")
    And("no switchboard is available")
    val store = new Store {
      override lazy val configKey = "TESTING/config/dummy.json"
      override lazy val switchesKey = "TESTING/config/dummy.properties"
    }

    Then("I should not see an error")
    store.getSwitches should be (None)
  }
}
