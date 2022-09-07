package common

import org.scalatest.featurespec.AnyFeatureSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.{DoNotDiscover, GivenWhenThen}
import test.ConfiguredTestSuite

import scala.jdk.CollectionConverters._

@DoNotDiscover class CombinerFeatureTest
    extends AnyFeatureSpec
    with GivenWhenThen
    with Matchers
    with ConfiguredTestSuite {

  Feature("Combiner pages") {

    Scenario("Should combine 2 tags") {

      Given("I visit a combiner page")

      goTo("/world/iraq+tone/comment") { browser =>
        import browser._
        val trails = $(".fc-slice__item")
        Then("I should see content tagged with both tags")
        trails.asScala.length should be > 1
      }
    }

    Scenario("Should combine a section with a tag") {

      Given("I visit a combiner page")

      goTo("/science+technology/apple") { browser =>
        import browser._
        val trails = $(".fromage, .fc-slice__item, .linkslist__item")
        Then("I should see content tagged with both the section and the tag")
        $("[data-test-id=header-title]").texts().asScala.head.toLowerCase should be("science + apple")
        trails.asScala.length should be > 10
      }
    }

    Scenario("Tags in same section") {

      Given("I visit a combiner page with tags in the same section")

      goTo("/books/jkrowling+harrypotter") { browser =>
        import browser._
        val trails = $(".fromage, .fc-slice__item, .linkslist__item")
        Then("I should see content tagged with both tags")
        trails.asScala.length should be > 10
      }
    }

    Scenario("Series combiner in the same section") {

      Given("I visit a combiner page with a series tag in the same seciton")

      goTo(
        "/lifeandstyle/series/quick-and-healthy-recipes+series/hugh-fearnley-whittingstall-quick-and-healthy-lunches",
      ) { browser =>
        import browser._
        val trails = $(".fromage, .fc-slice__item, .linkslist__item")
        Then("I should see content tagged with both tags")
        trails.asScala.length should be > 5
      }
    }
  }
}
