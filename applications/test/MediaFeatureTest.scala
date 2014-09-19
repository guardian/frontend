package test

import org.scalatest.{DoNotDiscover, Matchers, GivenWhenThen, FeatureSpec}

@DoNotDiscover class MediaFeatureTest extends FeatureSpec with GivenWhenThen with Matchers with ConfiguredTestSuite {
  feature("Media") {

    info("In order to experience all the wonderful videos the Guardian publish")
    info("As a sighted Guardian reader")
    info("I want to view a version of the video optimised for my browser")

    scenario("Load HTML5 video formats") {
      Given("I am on a video page")
      goTo("/film/video/2013/aug/14/chloe-grace-moretz-kick-ass-2-video") { browser =>
        import browser._
        Then("the HTML5 video should be available")
        $(".player video") should have size (1)

        And("the proposed sources should be plenty")
        $(".player video source") should have size (5)
      }
    }

    scenario("Load video fallbacks") {
      Given("I am on a video page")
      goTo("/film/video/2013/aug/14/chloe-grace-moretz-kick-ass-2-video") { browser =>
        import browser._
        Then("the flash fallback should be available")
        $(".player object") should have size (1)

        And("the ultimate fallback should be an image")
        findFirst(".player object img").getAttribute("src") should endWith ("/Chloe-Grace-Moretz-talks--016.jpg")
      }
    }

    scenario("Include Guardian byline") {
      goTo("/film/video/2013/aug/14/chloe-grace-moretz-kick-ass-2-video") { browser =>
        browser.findFirst(".byline").getText should be ("Ben Child and Henry Barnes, theguardian.com")
      }
    }

    scenario("Include non Guardian byline") {
      goTo("/lifeandstyle/australia-food-blog/video/2014/feb/03/chia-mango-sorbet-video-recipe") { browser =>
        browser.findFirst(".byline").getText should be ("Guy Turland and Mark Alston, Source: Bondi Harvest Pty Ltd")
      }
    }

    scenario("The content is marked up with the correct schema") {
      goTo("/uk-news/video/2014/aug/06/qatar-airlines-flight-escorted-raf-fighter-jet-bomb-hoax-video") { browser =>
        import browser._

        val media = findFirst("figure[itemtype='http://schema.org/VideoObject']")

        And("It should have the associated meta data")

        media.findFirst("[itemprop=duration]").getAttribute("content") should be("PT66S")
        media.findFirst("[itemprop=width]").getAttribute("content") should be("480")
        media.findFirst("[itemprop=height]").getAttribute("content") should be("360")
        media.findFirst("[itemprop=headline]").getAttribute("content") should be("Qatar Airways flight escorted by RAF jet after bomb hoax - video")
      }
    }
  }
}
