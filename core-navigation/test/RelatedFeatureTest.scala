import org.scalatest.matchers.ShouldMatchers
import org.scalatest.{ GivenWhenThen, FeatureSpec }
import test.`package`._

class RelatedFeatureTest extends FeatureSpec with GivenWhenThen with ShouldMatchers {

  feature("Related links") {

    // Feature

    info("In order to continue reading more about the story")
    info("As a Guardian reader")
    info("I want to visit related links to the current article I am reading")

    // Metrics

    info("Increase average number of articles 'read' from 1.9% to 2.5%")

    // TODO - scenarios pending Selenium set up
    /*
    scenario("Maximum of 10 related links - show 5, hide 5 - 'show more'")(pending)
    scenario("Number of 'more' items should be represented by a number")(pending)
    scenario("Appear *after* the comments")(pending)
    scenario("If has no Story Package, then show Related Links")(pending)
    scenario("Each item in the list should contain a relative date stamp - Eg, 'published 1 minute/hour/day ago'")(pending)
    scenario("Links in the story package should *not* contain the current article (deduplicated)")(pending)
*/
    // Features

    scenario("Shows related links for each article") {

      given("there is an article 'Woman tortured during burglary tells of waterboarding ordeal'")
      HtmlUnit("/related/uk/2012/aug/07/woman-torture-burglary-waterboard-surrey") { browser =>
        import browser._

        then("I should see the related links")
        $("li") should have length 10

      }
    }

    scenario("Shows article metadata for each related link") {

      given("there is an article 'Woman tortured during burglary tells of waterboarding ordeal'")
      HtmlUnit("/related/uk/2012/aug/07/woman-torture-burglary-waterboard-surrey") { browser =>
        import browser._

        then("I should see the headline, trail text for each of the first five related links")

        //We cannot guarantee what exactly gets returned from the content api as related is an algorithm
        //so just checking that items exist and not their values

        val article = findFirst("li")
        article.findFirst("a").getAttribute("href").length should be > 0
        article.findFirst("h3").getText.length should be > 0
        article.findFirst(".trail-text").getText.length should be > 0
        article.findFirst("time").getAttribute("data-timestamp") should be("1344426007000")

        find("li .trail-text") should have length 5

        and("I should see the pictures for the first three trails, where they exist")
        // FIXME - need consistent data, as image can go missing
        //article.findFirst("img").getAttribute("src").length should be > 0

      }
    }

    scenario("Show the published dates for all trails") { // GFE-37

      given("Shell spending millions of dollars on security in Nigeria, leaked data shows")
      HtmlUnit("/related/business/2012/aug/19/shell-spending-security-nigeria-leak") { browser =>
        import browser._

        then("I see each trail block displays the published date of the corresponding article")

        $(".relative-timestamp") should have length 10

      }
    }

  }
}
