package common

import org.scalatest.{DoNotDiscover, FeatureSpec, GivenWhenThen, Matchers}
import test.ConfiguredTestSuite
import collection.JavaConversions._

@DoNotDiscover class CombinerFeatureTest extends FeatureSpec with GivenWhenThen with Matchers with ConfiguredTestSuite {

  feature("Combiner pages") {

    scenario("Should combine 2 tags") {

      Given("I visit a combiner page")

      goTo("/world/iraq+tone/comment") { browser =>
        import browser._
        val trails = $(".fc-slice__item")
        Then("I should see content tagged with both tags")
        trails.length should be > 1
      }
    }

    scenario("Should combine a section with a tag") {

      Given("I visit a combiner page")

      goTo("/science+technology/apple") { browser =>
        import browser._
        val trails = $(".fromage, .fc-slice__item, .linkslist__item")
        Then("I should see content tagged with both the section and the tag")
        $("[data-test-id=header-title]").text.toLowerCase should be ("science + apple")
        trails.length should be > 10
      }
    }

    scenario("Tags in same section") {

      Given("I visit a combiner page with tags in the same section")

      goTo("/books/jkrowling+harrypotter") { browser =>
        import browser._
        val trails = $(".fromage, .fc-slice__item, .linkslist__item")
        Then("I should see content tagged with both tags")
        trails.length should be > 10
      }
    }

    scenario("Series combiner in the same section") {

      Given("I visit a combiner page with a series tag in the same seciton")

      goTo("/lifeandstyle/series/quick-and-healthy-recipes+series/hugh-fearnley-whittingstall-quick-and-healthy-lunches") { browser =>
        import browser._
        val trails = $(".fromage, .fc-slice__item, .linkslist__item")
        Then("I should see content tagged with both tags")
        trails.length should be > 5
      }
    }
  }
}


