import org.scalatest.matchers.ShouldMatchers
import org.scalatest.{ GivenWhenThen, FeatureSpec }
import test.`package`._

class RelatedFeatureTest extends FeatureSpec with GivenWhenThen with ShouldMatchers {

  feature("Related links") {

    scenario("Shows related links") {

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

        then("I should see the headline, trail text for each related link")

        val article = findFirst("li")
        article.findFirst("a").getAttribute("href") should include("/uk/2009/oct/22/robbery-burglary-theft-rise-crime")
        article.findFirst("p").getText should be("Crime falls by 4%, latest figures show")
        article.findFirst(".trailtext").getText should be("Knife murders down by a third, but burglaries and robberies on the rise")

        and("I should see the pictures where they exist")
        article.findFirst("img").getAttribute("src") should be("http://static.guim.co.uk/sys-images/Money/Pix/pictures/2007/09/26/Burglar84.jpg")

        val articleWithNoPicture = find("li", 3)
        articleWithNoPicture.find("img") should have length 0

      }
    }

    scenario("Related links should *not* contain the current article")(pending)

  }
}

