import org.scalatest.matchers.ShouldMatchers
import org.scalatest.{ GivenWhenThen, FeatureSpec }
import test.HtmlUnit

class RelatedFeatureTest extends FeatureSpec with GivenWhenThen with ShouldMatchers {

  feature("Related links") {

    // Feature

    info("In order to continue reading more about the story")
    info("As a Guardian reader")
    info("I want to visit related links to the current article I am reading")

    // Metrics

    info("Increase average number of articles 'read' from 1.9% to 2.5%")

    // Features

    scenario("Shows related links for each article") {

      Given("there is an article 'Woman tortured during burglary tells of waterboarding ordeal'")
      HtmlUnit("/related/uk/2012/aug/07/woman-torture-burglary-waterboard-surrey") { browser =>
        import browser._

        Then("I should see the related links")
        $("li") should have length 10

      }
    }

    scenario("Shows article metadata for each related link") {

      Given("there is an article 'Woman tortured during burglary tells of waterboarding ordeal'")
      HtmlUnit("/related/uk/2012/aug/07/woman-torture-burglary-waterboard-surrey") { browser =>
        import browser._

        Then("I should see the headline, trail text for each of the first five related links")

        //We cannot guarantee what exactly gets returned from the content api as related is an algorithm
        //so just checking that items exist and not their values

        val article = findFirst("li")
        article.findFirst("a").getAttribute("href").length should be > 0
        article.findFirst("h3").getText.length should be > 0
        article.find(".trail__text").size should be > 0
        article.findFirst("time").getAttribute("data-timestamp") should be("1344426007000")

        findFirst("ul").find(".trail__headline") should have length 5
      }
    }

    scenario("Show the published dates for all trails") { // GFE-37

      Given("Shell spending millions of dollars on security in Nigeria, leaked data shows")
      HtmlUnit("/related/business/2012/aug/19/shell-spending-security-nigeria-leak") { browser =>
        import browser._

        Then("I see each trail block displays the published date of the corresponding article")

        $(".relative-timestamp") should have length 10

      }
    }

  }
}
