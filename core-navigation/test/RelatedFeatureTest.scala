import org.scalatest.matchers.ShouldMatchers
import org.scalatest.{ GivenWhenThen, FeatureSpec }
import test.`package`._

class RelatedFeatureTest extends FeatureSpec with GivenWhenThen with ShouldMatchers {

  feature("Related links") {

    scenario("Shows related links for each article") {

      given("there is an article 'Woman tortured during burglary tells of waterboarding ordeal'")
      HtmlUnit("/related/UK/uk/2012/aug/07/woman-torture-burglary-waterboard-surrey") { browser =>
        import browser._

        then("I should see the related links")
        $("li") should have length 10

      }
    }

    scenario("Shows article metadata for each related link") {

      given("there is an article 'Woman tortured during burglary tells of waterboarding ordeal'")
      HtmlUnit("/related/UK/uk/2012/aug/07/woman-torture-burglary-waterboard-surrey") { browser =>
        import browser._

        then("I should see the headline, trail text for each of the first five related links")

        //We cannot guarantee what exactly gets returned from the content api as related is an algorithm
        //so just checking that items exist and not their values

        val article = findFirst("li")
        article.findFirst("a").getAttribute("href").length should be > 0
        article.findFirst("p").getText.length should be > 0
        article.findFirst(".trailtext").getText.length should be > 0
        article.findFirst(".relative-timestamp").getAttribute("data-timestamp") should be("1344360038000")

        find("li .trailtext") should have length 5

        and("I should see the pictures for the first three trails, where they exist")
        article.findFirst("img").getAttribute("src").length should be > 0

        and("I should see no images beyond first three trails")

        val trailWithImage = find("li", 7)
        trailWithImage.find("img") should have length 0

      }
    }

    scenario("Show the published dates for all trails") { // GFE-37

      given("Shell spending millions of dollars on security in Nigeria, leaked data shows")
      HtmlUnit("/related/UK/business/2012/aug/19/shell-spending-security-nigeria-leak") { browser =>
        import browser._

        then("I see each trail block displays the published date of the corresponding article")

        $(".relative-timestamp") should have length 10

      }
    }
  }
}
