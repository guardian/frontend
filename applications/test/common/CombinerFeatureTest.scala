package common

import org.scalatest.{ FeatureSpec, GivenWhenThen }
import org.scalatest.matchers.ShouldMatchers
import test.HtmlUnit
import collection.JavaConversions._

class CombinerFeatureTest extends FeatureSpec with GivenWhenThen with ShouldMatchers {

  feature("Combiner pages") {

    scenario("Should combine 2 tags") {

      Given("I visit a combiner page")

      HtmlUnit("/world/iraq+tone/comment") { browser =>
        import browser._
        val trails = $(".trailblock .trail")
        Then("I should see content tagged with both tags")
        trails.length should be(20)
      }
    }

    scenario("Should combine a section with a tag") {

      Given("I visit a combiner page")

      HtmlUnit("/science+technology/apple") { browser =>
        import browser._
        val trails = $(".trailblock .trail")
        Then("I should see content tagged with both the section and the tag")
        findFirst("h1").getText should be ("science + apple")
        trails.length should be > 10
      }
    }

    scenario("Tags in same section") {

      Given("I visit a combiner page with tags in the same section")

      HtmlUnit("/books/jkrowling+harrypotter") { browser =>
        import browser._
        val trails = $(".trailblock .trail")
        Then("I should see content tagged with both tags")
        trails.length should be > 10
      }
    }

    scenario("Series combiner in the same section") {

      Given("I visit a combiner page with a series tag in the same seciton")

      HtmlUnit("/lifeandstyle/series/quick-and-healthy-recipes+series/hugh-fearnley-whittingstall-quick-and-healthy-lunches") { browser =>
        import browser._
        val trails = $(".trailblock .trail")
        Then("I should see content tagged with both tags")
        trails.length should be > 5
      }
    }
  }
}


