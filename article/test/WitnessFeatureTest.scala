package test

import org.scalatest.matchers.ShouldMatchers
import org.scalatest.{ GivenWhenThen, FeatureSpec }
import conf.Configuration

class WitnessFeatureTest extends FeatureSpec with GivenWhenThen with ShouldMatchers {

  implicit val config = Configuration

  /*
    NOTE: at the time of writing this test this data is not available in the API. As this is not live data
          this test will need to be redone when we refresh the test data.
  */
  feature("Witness") {

    scenario("Display a witness text embed") {

      given("I am on an article containing witness embeds")
      HtmlUnit("/books/2013/jan/09/test-witness-embeds") { browser =>
        import browser._

        val textEmbed = findFirst(".element-witness-text")

        then("I should see the brand logo")
        textEmbed.findFirst("i").getAttribute("title") should be("Guardian Witness")

        and("I should see the title")
        textEmbed.findFirst("h3").getText should be("Creation date test")

        and("I should see the text")
        textEmbed.findFirst("[itemprop=text]").getText should be("Blah blah")

        val metadata = textEmbed.findFirst(".element-witness--metadata")

        and("I should see the author avatar")
        metadata.findFirst("img").getAttribute("src") should be("http://n0tice-dev-static.s3.amazonaws.com/images/profile/tiny/903e5544e2c18866f5ed8aeb71dd77fd.jpg")

        and("I should see the author name")
        metadata.findFirst("[itemprop=name]").getText should be("TESTUSER1358502552586updated")

        and("I should see the embed date")
        metadata.findFirst("time").getText should be("12 January 2013, 17:19")
      }
    }

    scenario("Display a witness video embed") {

      given("I am on an article containing witness embeds")
      HtmlUnit("/books/2013/jan/09/test-witness-embeds") { browser =>
        import browser._

        val videoEmbed = findFirst(".element-witness-video")

        then("I should see the brand logo")
        videoEmbed.findFirst("i").getAttribute("title") should be("Guardian Witness")

        and("I should see the video")
        videoEmbed.findFirst("iframe").getAttribute("src") should be("http://www.youtube.com/embed/CxEmx6JnC_Q?wmode=opaque&feature=oembed")

        val metadata = videoEmbed.findFirst(".element-witness--metadata")

        and("I should see the author avatar")
        metadata.findFirst("img").getAttribute("src") should be("http://n0tice-dev-static.s3.amazonaws.com/images/profile/tiny/17ba723ff5e7889b.jpg")

        and("I should see the author name")
        metadata.findFirst("[itemprop=name]").getText should be("james")

        and("I should see the embed date")
        metadata.findFirst("time").getText should be("7 January 2013, 22:16")
      }
    }

    scenario("Display a witness image embed") {

      given("I am on an article containing witness embeds")
      HtmlUnit("/books/2013/jan/09/test-witness-embeds") { browser =>
        import browser._

        val imageEmbed = findFirst(".element-witness-image")

        then("I should see the brand logo")
        imageEmbed.findFirst("i").getAttribute("title") should be("Guardian Witness")

        and("I should see the image")
        imageEmbed.findFirst(".element-witness--main img").getAttribute("src") should be("http://n0tice-dev-static.s3.amazonaws.com/images/reports/microblogs/medium/2823888465bf19c077fb8b84a7e40fdc.jpg")

        val metadata = imageEmbed.findFirst(".element-witness--metadata")

        and("I should see the author avatar")
        metadata.findFirst("img").getAttribute("src") should be("http://n0tice-dev-static.s3.amazonaws.com/images/profile/tiny/17ba723ff5e7889b.jpg")

        and("I should see the author name")
        metadata.findFirst("[itemprop=name]").getText should be("james")

        and("I should see the embed date")
        metadata.findFirst("time").getText should be("7 January 2013, 22:16")
      }
    }
  }
}
