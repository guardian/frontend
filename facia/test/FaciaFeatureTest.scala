package test

import org.scalatest.Matchers
import org.scalatest.{ GivenWhenThen, FeatureSpec }
import collection.JavaConversions._

class FaciaFeatureTest extends FeatureSpec with GivenWhenThen with Matchers {


  feature("Facia") {

    // Scenarios

    ignore("Display the news container") {

      Given("I am on the UK network front")
      HtmlUnit("/uk") { browser =>
        import browser._

        Then("I should see the new container")
        $("section[data-id='uk/news/regular-stories']").length should be(1)
      }
    }

  }
}
