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
        findFirst(".player object img").getAttribute("src") should be("http://i.gucode.co.uk/n/sys-images/Guardian/Pix/audio/video/2013/8/13/1376401925584/Chloe-Grace-Moretz-talks--016.jpg")
      }
    }
  }
}
