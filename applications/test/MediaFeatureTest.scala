package test

import org.scalatest.{DoNotDiscover, Matchers, GivenWhenThen, FeatureSpec}

@DoNotDiscover class MediaFeatureTest extends FeatureSpec with GivenWhenThen with Matchers with ConfiguredTestSuite {
  feature("Media (video)") {

    info("In order to experience all the wonderful videos the Guardian publish")
    info("As a sighted Guardian reader")
    info("I want to view a version of the video optimised for my browser")

    scenario("Load HTML5 video formats") {
      Given("I am on a video page")
      goTo("/film/video/2013/aug/14/chloe-grace-moretz-kick-ass-2-video") { browser =>
        import browser._
        Then("the HTML5 video should be available")
        $(".player video") should have size 1

        And("the proposed sources should be plenty")
        $(".player video source") should have size 5
      }
    }

    scenario("Have correct canonical url when 410 encountered") {
      Given("I am on a video page")
      goTo("/world/video/2008/dec/11/guantanamo-bay") { browser =>
        import browser._
        el("link[rel='canonical']").attribute("href") should endWith("/world")
      }
    }

    scenario("Include Guardian byline") {
      goTo("/film/video/2013/aug/14/chloe-grace-moretz-kick-ass-2-video") { browser =>
        import browser._
        el(".byline").text should be("Ben Child and Henry Barnes, theguardian.com")
      }
    }

    scenario("Include non Guardian byline") {
      goTo("/lifeandstyle/australia-food-blog/video/2014/feb/03/chia-mango-sorbet-video-recipe") { browser =>
        browser.$(".byline").text should be("Guy Turland and Mark Alston, Source: Bondi Harvest Pty Ltd")
      }
    }

    scenario("The content is marked up with the correct schema") {
      goTo("/uk-news/video/2014/aug/06/qatar-airlines-flight-escorted-raf-fighter-jet-bomb-hoax-video") { browser =>
        import browser._

        val media = el("[itemtype='http://schema.org/VideoObject']")

        And("It should have the associated meta data")

        media.el("[itemprop=duration]").attribute("content") should be("PT66S")
        media.el("[itemprop=width]").attribute("content") should be("480")
        media.el("[itemprop=height]").attribute("content") should be("360")
        media.el("[itemprop=headline]").text should be(
          "Qatar Airways flight escorted by RAF jet after bomb hoax - video",
        )
      }
    }

    scenario("Twitter cards should appear in video article meta data") {
      goTo("/world/video/2014/nov/05/easyjet-flight-aborts-landing-last-minute-video") { browser =>
        import browser._
        el("meta[name='twitter:site']").attribute("content") should be("@guardian")
        el("meta[name='twitter:app:url:googleplay']").attribute("content") should be(
          "guardian://www.theguardian.com/world/video/2014/nov/05/easyjet-flight-aborts-landing-last-minute-video",
        )
        el("meta[name='twitter:card']").attribute("content") should be("summary_large_image")
      }
    }
  }
}
