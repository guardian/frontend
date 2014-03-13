package test

import org.scalatest.{BeforeAndAfter, Matchers, GivenWhenThen, FeatureSpec}
import collection.JavaConversions._
import conf.Switches

class FaciaFeatureTest extends FeatureSpec with GivenWhenThen with Matchers with BeforeAndAfter {

  before {
    Switches.PressedFacia.switchOn()
  }

  feature("Facia") {

    // Scenarios

    ignore("Display the news container") {

      Given("I am on the UK network front")
      HtmlUnit("/uk") { browser =>
        import browser._

        browser.webDriver.getPageSource.length should be > 0
        Then("I should see the news container")
        $("section[data-id='uk/news/regular-stories']").length should be(1)
      }
    }

    ignore("Render a tag page if it is not in config.json") {

      Given("I go to a tag page")
      HtmlUnit("/sport/cycling") { browser =>
        import browser._

        Then("I should see only the tag and most popular")
        $("section[data-id='sport/cycling/news/regular-stories']").length should be(1)
      }
    }

  }
}
