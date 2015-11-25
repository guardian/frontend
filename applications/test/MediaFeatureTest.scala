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
        findFirst(".player object img").getAttribute("src") should include ("/Chloe-Grace-Moretz-talks--016.jpg")
      }
    }

    scenario("Have correct canonical url when 410 encountered") {
      Given("I am on a video page")
      goTo("/world/video/2008/dec/11/guantanamo-bay") { browser =>
        import browser._
        findFirst("link[rel='canonical']").getAttribute("href") should endWith ("/world")
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

        val media = findFirst("[itemtype='http://schema.org/VideoObject']")

        And("It should have the associated meta data")

        media.findFirst("[itemprop=duration]").getAttribute("content") should be("PT66S")
        media.findFirst("[itemprop=width]").getAttribute("content") should be("480")
        media.findFirst("[itemprop=height]").getAttribute("content") should be("360")
        media.findFirst("[itemprop=headline]").getText should be("Qatar Airways flight escorted by RAF jet after bomb hoax - video")
      }
    }

    scenario("Twitter cards should appear in video article meta data") {
      goTo("/world/video/2014/nov/05/easyjet-flight-aborts-landing-last-minute-video") { browser =>
        import browser._
        findFirst("meta[name='twitter:site']").getAttribute("content") should be("@guardian")
        findFirst("meta[name='twitter:app:url:googleplay']").getAttribute("content") should be("guardian://www.theguardian.com/world/video/2014/nov/05/easyjet-flight-aborts-landing-last-minute-video")
        findFirst("meta[name='twitter:card']").getAttribute("content") should be("summary_large_image")
      }
    }
  }
}
