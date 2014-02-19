package test

import org.scalatest.Matchers
import org.scalatest.{ GivenWhenThen, FeatureSpec }

class VideoFeatureTest extends FeatureSpec with GivenWhenThen with Matchers {
  feature("Video") {

    info("In order to experience all the wonderful videos the Guardian publish")
    info("As a sighted Guardian reader")
    info("I want to view a version of the video optimised for my browser")

    scenario("Load HTML5 video formats") {
      Given("I am on a video page")
      HtmlUnit("/film/video/2013/aug/14/chloe-grace-moretz-kick-ass-2-video") { browser =>
        import browser._
        Then("the HTML5 video should be available")
        $(".player video") should have size (1)

        And("the proposed sources should be plenty")
        $(".player video source") should have size (5)
      }
    }

    scenario("Load video fallbacks") {
      Given("I am on a video page")
      HtmlUnit("/film/video/2013/aug/14/chloe-grace-moretz-kick-ass-2-video") { browser =>
        import browser._
        Then("the flash fallback should be available")
        $(".player object") should have size (1)

        And("the ultimate fallback should be an image")
        findFirst(".player object img").getAttribute("src") should endWith ("/Chloe-Grace-Moretz-talks--027.jpg?width=620&height=-&quality=95")
      }
    }

    scenario("Include Guardian byline") {
      HtmlUnit("/film/video/2013/aug/14/chloe-grace-moretz-kick-ass-2-video") { browser =>
        browser.findFirst(".byline").getText should be ("Ben Child and Henry Barnes, theguardian.com")
      }
    }

    scenario("Include non Guardian byline") {
      HtmlUnit("/lifeandstyle/australia-food-blog/video/2014/feb/03/chia-mango-sorbet-video-recipe") { browser =>
        browser.findFirst(".byline").getText should be ("Guy Turland and Mark Alston, Source: Bondi Harvest Pty Ltd")
      }
    }
  }
}
