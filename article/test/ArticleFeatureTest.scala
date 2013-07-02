package test

import conf.Configuration
import conf.Switches._
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.{ GivenWhenThen, FeatureSpec }
import collection.JavaConversions._

class ArticleFeatureTest extends FeatureSpec with GivenWhenThen with ShouldMatchers {

  implicit val config = Configuration

  feature("Article") {

    // Feature 

    info("In order to experience all the wonderful words the Guardian write")
    info("As a Guardian reader")
    info("I want to read a version of the article optimised for my mobile devices")

    // Metrics 

    info("Page views should *not* decrease.")
    info("Retain people on mobile (by reducing % of mobile traffic to www and clicks to the desktop site)")

    // Scenarios

    scenario("Display a headline", ArticleComponents) {

      Given("I am on an article entitled 'Liu Xiang pulls up in opening race at second consecutive Olympics'")
      HtmlUnit("/sport/2012/aug/07/liu-xiang-injured-olympics") { browser =>
        import browser._

        Then("I should see the headline of the article")

        And("The article is marked up with the correct schema")
        val article = findFirst("article[itemtype='http://schema.org/Article']")

        article.findFirst("[itemprop=headline]").getText should
          be("Liu Xiang pulls up in opening race at second consecutive Olympics")
      }
    }

    scenario("Display a short description of the article", ArticleComponents) {

      Given("I am on an article entitled 'Putting a price on the rivers and rain diminishes us all'")
      HtmlUnit("/commentisfree/2012/aug/06/price-rivers-rain-greatest-privatisation") { browser =>
        import browser._

        Then("I should see a short description of the article")
        findFirst("[itemprop=description]").getText should
          be("Payments for 'ecosystem services' look like the prelude to the greatest privatisation since enclosure")
      }
    }

    scenario("Display the article author", ArticleComponents) {

      Given("I am on an article entitled 'TV highlights 09/08/2012'")
      HtmlUnit("/tv-and-radio/2012/aug/08/americas-animal-hoarder-the-churchills") { browser =>
        import browser._

        Then("I should see the names of the authors")
        $("[itemprop=author]")(0).getText should be("Ben Arnold")
        $("[itemprop=author]").last.getText should be("Phelim O'Neill")

        And("I should see a link to the author's page")
        $("[itemprop=author] a[itemprop='url name']")(0).getAttribute("href") should be(WithHost("/profile/ben-arnold"))
        $("[itemprop=author] a[itemprop='url name']").last.getAttribute("href") should be(WithHost("/profile/phelimoneill"))
      }
    }

    scenario("Display the article image", ArticleComponents) {

      Given("I am on an article entitled 'Putting a price on the rivers and rain diminishes us all'")
      HtmlUnit("/commentisfree/2012/aug/06/price-rivers-rain-greatest-privatisation") { browser =>
        import browser._

        ImageServerSwitch.switchOn

        Then("I should see the article's image")
        findFirst("[itemprop='associatedMedia primaryImageOfPage'] img[itemprop=contentURL]").getAttribute("src") should
          endWith("sys-images/Guardian/Pix/pictures/2012/8/6/1344274679326/Gunnerside-village-Swaled-005.jpg")

        And("I should see the image caption")
        findFirst("[itemprop='associatedMedia primaryImageOfPage'] [itemprop=description]").getText should
          be("Our rivers and natural resources are to be valued and commodified, a move that will benefit only the rich, argues Goegr Monbiot. Photograph: Alamy")
      }
    }

    scenario("Display the article publication date", ArticleComponents) {

      Given("I am on an article entitled 'Putting a price on the rivers and rain diminishes us all'")
      HtmlUnit("/commentisfree/2012/aug/06/price-rivers-rain-greatest-privatisation") { browser =>
        import browser._

        Then("I should see the publication date of the article")
        findFirst(".dateline").getText should be("Monday 6 August 2012 20.30 BST")
        findFirst("time").getAttribute("datetime") should be("2012-08-06T20:30:00Z")
      }
    }

    scenario("Articles should have the correct timezone for when they were published") {

      Given("I am on an article published on '2012-11-10'")
      And("I am on the 'UK' edition")
      HtmlUnit("/world/2012/nov/08/syria-arms-embargo-rebel") { browser =>
        import browser._
        Then("the date should be 'Thursday 8 November 2012 00.01 GMT'")
        findFirst(".dateline time").getText should be("Thursday 8 November 2012 00.01 GMT")
      }

      Given("I am on an article published on '2012-11-10'")
      And("I am on the 'US' edition")
      HtmlUnit.US("/world/2012/nov/08/syria-arms-embargo-rebel") { browser =>
        import browser._
        Then("the date should be 'Wednesday 7 November 2012 19.01 GMT'")
        findFirst(".dateline time").getText should be("Wednesday 7 November 2012 19.01 EST")
      }

      Given("I am on an article published on '2012-08-19'")
      And("I am on the 'UK' edition")
      HtmlUnit("/business/2012/aug/19/shell-spending-security-nigeria-leak") { browser =>
        import browser._
        Then("the date should be 'Sunday 19 August 2012 18.38 BST'")
        findFirst(".dateline time").getText should be("Sunday 19 August 2012 18.38 BST")
      }

      Given("I am on an article published on '2012-08-19'")
      And("I am on the 'US' edition")
      HtmlUnit.US("/business/2012/aug/19/shell-spending-security-nigeria-leak") { browser =>
        import browser._
        Then("the date should be 'Sunday 19 August 2012 13.38 BST'")
        findFirst(".dateline time").getText should be("Sunday 19 August 2012 13.38 EDT")
      }

    }

    scenario("Article body", ArticleComponents) {

      Given("I am on an article entitled 'New Viking invasion at Lindisfarne'")
      HtmlUnit("/uk/the-northerner/2012/aug/07/lindisfarne-vikings-northumberland-heritage-holy-island") { browser =>
        import browser._

        Then("I should see the body of the article")
        findFirst("[itemprop=articleBody]").getText should startWith("This week Lindisfarne celebrates its long and frequently bloody Viking heritage")
      }
    }

    scenario("In body pictures", ArticleComponents) {

      Given("I am on an article entitled 'A food revolution in Charleston, US'")
      HtmlUnit("/travel/2012/oct/11/charleston-food-gourmet-hotspot-barbecue") { browser =>
        import browser._

        Then("I should see pictures in the body of the article")

        $("figure[itemprop=associatedMedia]").length should be(2)

        val inBodyImage = findFirst("figure[itemprop=associatedMedia]")

        ImageServerSwitch.switchOn
        inBodyImage.getAttribute("class") should include("img-extended")
        inBodyImage.findFirst("[itemprop=contentURL]").getAttribute("src") should
          endWith("sys-images/Travel/Late_offers/pictures/2012/10/11/1349951383662/Shops-in-Rainbow-Row-Char-001.jpg")

        And("I should see the image caption")
        inBodyImage.findFirst("[itemprop=description]").getText should
          be("""Shops in Rainbow Row, Charleston. Photograph: Getty Images""")
      }
    }

    scenario("Review stars", ArticleComponents) {

      Given("I am on a review entitled 'Phill Jupitus is Porky the Poet in 27 Years On - Edinburgh festival review'")
      HtmlUnit("/culture/2012/aug/07/phill-jupitus-edinburgh-review") { browser =>
        import browser._

        Then("I should see the star rating of the festival")
        And("The review is marked up with the correct schema")
        val review = findFirst("article[itemtype='http://schema.org/Review']")

        review.findFirst(".stars").getText should be("3 / 5 stars")
        review.findFirst("[itemprop=reviewRating]").getAttribute("content") should be("3")
      }
    }

    scenario("Review body", ArticleComponents) {

      // Nb, The schema.org markup for a review body is different to an article body

      Given("I am on a review entitled 'Phill Jupitus is Porky the Poet in 27 Years On - Edinburgh festival review'")
      HtmlUnit("/culture/2012/aug/07/phill-jupitus-edinburgh-review") { browser =>
        import browser._

        Then("I should see the star body")
        findFirst("[itemprop=reviewBody]").getText should startWith("What's so funny?")
      }
    }

    scenario("correct placeholder for ad is rendered") {

      Given("the user navigates to a page")
      HtmlUnit("/environment/2012/feb/22/capitalise-low-carbon-future") { browser =>
        import browser._

        When("the page is rendered")

        Then("the ad slot placeholder is rendered")
        val adPlaceholder = $(".ad-slot-top-banner-ad").first()

        And("the placeholder has the correct slot names")
        adPlaceholder.getAttribute("data-base") should be("Top2")
        adPlaceholder.getAttribute("data-median") should be("Top")
        adPlaceholder.getAttribute("data-extended") should be("x54")

        And("the placeholder has the correct class name")
        adPlaceholder.getAttribute("class") should be("ad-slot ad-slot-top-banner-ad")

        And("the placeholder has the correct analytics name")
        adPlaceholder.getAttribute("data-link-name") should be("ad slot top-banner-ad")
      }
    }

    scenario("Navigate to the desktop site (UK edition - www.guardian.co.uk)") {
      Given("I'm on article entitled 'We must capitalise on a low-carbon future'")
      And("I am using the UK edition")
      HtmlUnit("/environment/2012/feb/22/capitalise-low-carbon-future") { browser =>
        import browser._

        Then("I should see a link to the corresponding desktop article")
        findFirst("#main-site").getAttribute("href") should be("http://www.guardian.co.uk/environment/2012/feb/22/capitalise-low-carbon-future?mobile-redirect=false")
      }
    }

    scenario("Navigate to the desktop site (US edition - www.guardiannews.com)") {
      Given("I'm on article entitled 'We must capitalise on a low-carbon future'")
      And("I am using the US edition")
      HtmlUnit.US("/environment/2012/feb/22/capitalise-low-carbon-future") { browser =>
        import browser._

        Then("I should see a link to the corresponding desktop article")
        findFirst("#main-site").getAttribute("href") should
          be("http://www.guardiannews.com/environment/2012/feb/22/capitalise-low-carbon-future?mobile-redirect=false")
      }
    }

    scenario("Story package navigation") {

      Given("I'm on an article entitled 'Iraq war logs reveal 15,000 previously unlisted civilian deaths'")

      HtmlUnit("/world/2010/oct/22/true-civilian-body-count-iraq") { browser =>
        import browser._

        Then("I should see navigation to related content")
        $("[itemprop=relatedLink]").size() should be(29)
      }
    }

    scenario("Story package ordered by date published") {

      Given("I'm on an article entitled 'Iraq war logs reveal 15,000 previously unlisted civilian deaths'")

      HtmlUnit("/world/2010/oct/22/true-civilian-body-count-iraq") { browser =>
        import browser._

        Then("I should see the related content ordered")
        val relatedContent = $("[itemprop=relatedLink]")
        relatedContent.get(0).getText should be("Iraq war logs: experts' views")
        relatedContent.get(1).getText should be("Iraq war logs: media reaction around the world")
        relatedContent.get(2).getText should be("Iraq war logs: 'The US was part of the Wolf Brigade operation against us'")
        relatedContent.get(3).getText should be("Iraq war logs: Prisoner beaten to death days after British handover to police")
        relatedContent.get(4).getText should be("Iraq war logs: These crimes were not secret, they were tolerated")
      }
    }

    scenario("Direct link to paragraph") {

      Given("I have clicked a direct link to paragrah 16 on the article 'Eurozone crisis live: Fitch downgrades Greece on euro exit fears'")

      HtmlUnit("/business/2012/may/17/eurozone-crisis-cameron-greece-euro-exit#block-16") { browser =>
        import browser._

        Then("I should see paragraph 16")
        findFirst("#block-16").getText should startWith("11.31am: Vince Cable, the business secretary")
      }
    }

    scenario("Primary image upgrades to high resolution") {

      Given("I am on an aricle")
      HtmlUnit("/film/2012/nov/11/margin-call-cosmopolis-friends-with-kids-dvd-review") { browser =>
        import browser._

        Then("the primary image's 'data-force-upgrade' attribute should be 'true'")
        findFirst("#article figure img").getAttribute("data-force-upgrade") should be("true")
      }
    }

    scenario("Hide main picture if video is at start of article") {
      Given("I am on an article with a video at the start of the body")
      HtmlUnit("/society/2013/mar/26/failing-hospitals-nhs-jeremy-hunt") { browser =>
        import browser._
        Then("the main picture should be hidden")
        $("[itemprop='associatedMedia primaryImageOfPage']") should have size (0)

        And("the embedded video should have a poster")
        findFirst("video").getAttribute("poster") should be("http://cdn.theguardian.tv/mainwebsite/poster/2013/3/26/130326HuntReform_7409761.jpg")
      }
    }

    scenario("Show main picture if video is further down article") {
      Given("I am on an article with a video further down inside the body")
      HtmlUnit("/music/musicblog/2013/mar/28/glastonbury-2013-lineup-everybody-happy") { browser =>
        import browser._

        Then("the main picture should be shown")
        $("[itemprop='associatedMedia primaryImageOfPage']") should have size (1)

        And("the embedded video should have a poster")
        findFirst("video").getAttribute("poster") should be("http://cdn.theguardian.tv/bc/281851582/281851582_1019162777001_110624Glastothreewords-4863219.jpg?pubId=281851582")
      }
    }

    scenario("Show embedded video in live blogs"){
      Given("I am on a live blog with an embedded video")
      HtmlUnit("/world/2013/jun/24/kevin-rudd-labour-politics-live"){ browser =>
        import browser._
        Then("I should see the embedded video")
        $(".element-video").size should be (4)
      }
    }

    scenario("Show embedded tweets in live blogs"){
      Given("I am on a live blog with an embedded tweet")
      HtmlUnit("/world/2013/jun/24/kevin-rudd-labour-politics-live"){ browser =>
        import browser._

        Then("I should see the embedded video")
        $(".element-tweet").size should be (12)
      }
    }

    scenario("Show primary picture on composer articles") {
      Given("I am on an article created in composer tools")
      HtmlUnit("/artanddesign/2013/apr/15/buildings-tall-architecture-guardianwitness") { broswer =>
        import broswer._
        Then("The main picture should be show")
        $("[itemprop='associatedMedia primaryImageOfPage']") should have size (1)
      }
    }

    scenario("Easily share an article via popular social media sites") {

      Given("I read an article and want to share it with my friends")
      
      SocialSwitch.switchOn
      
      HtmlUnit("/film/2012/nov/11/margin-call-cosmopolis-friends-with-kids-dvd-review") { browser =>
        import browser._

        val mailShareUrl = "mailto:?subject=Mark%20Kermode%27s%20DVD%20round-up&body=http%3A%2F%2Fwww.guardian.co.uk%2Ffilm%2F2012%2Fnov%2F11%2Fmargin-call-cosmopolis-friends-with-kids-dvd-review"
        val fbShareUrl = "http://m.facebook.com/dialog/feed?app_id=180444840287&display=touch&redirect_uri=http%3A%2F%2Fwww.guardian.co.uk%2Ffilm%2F2012%2Fnov%2F11%2Fmargin-call-cosmopolis-friends-with-kids-dvd-review&link=http%3A%2F%2Fwww.guardian.co.uk%2Ffilm%2F2012%2Fnov%2F11%2Fmargin-call-cosmopolis-friends-with-kids-dvd-review&ref=responsive"
        val twitterShareUrl = "https://twitter.com/intent/tweet?text=Mark+Kermode%27s+DVD+round-up&url=http%3A%2F%2Fwww.guardian.co.uk%2Ffilm%2F2012%2Fnov%2F11%2Fmargin-call-cosmopolis-friends-with-kids-dvd-review"
        val gplusShareUrl = "https://plus.google.com/share?url=http%3A%2F%2Fwww.guardian.co.uk%2Ffilm%2F2012%2Fnov%2F11%2Fmargin-call-cosmopolis-friends-with-kids-dvd-review&hl=en-GB&wwc=1"

        Then("I should see buttons for my favourite social network")
        findFirst(".social__item--mail .social__action").getAttribute("href") should be(mailShareUrl)
        findFirst(".social__item--fb .social__action").getAttribute("href") should be(fbShareUrl)
        findFirst(".social__item--twitter .social__action").getAttribute("href") should be(twitterShareUrl)
        findFirst(".social__item--gplus .social__action").getAttribute("href") should be(gplusShareUrl)
      }
      
      Given("I want to track the responsive share buttons using Facebook Insights")
      
      SocialSwitch.switchOn

      HtmlUnit("/film/2012/nov/11/margin-call-cosmopolis-friends-with-kids-dvd-review") { browser =>
        import browser._

        val fbShareTrackingToken = "ref=responsive"

        Then("I should pass Facebook a tracking token")
        findFirst(".social__item--fb .social__action").getAttribute("href") should include(fbShareTrackingToken)
      }


    }
    
    // http://www.w3.org/WAI/intro/aria
    scenario("Make the document accessible with ARIA support") {

      Given("I read an article")
      
      SocialSwitch.switchOn
      SearchSwitch.switchOn
      
      HtmlUnit("/world/2013/jan/27/brazil-nightclub-blaze-high-death-toll") { browser =>
        import browser._

        Then("I should see the main ARIA roles described")
        findFirst(".related-trails").getAttribute("role") should be("complementary")
        findFirst("aside").getAttribute("role") should be("complementary")
        findFirst(".js-popular").getAttribute("role") should be("complementary")
        findFirst("header").getAttribute("role") should be("banner")
        findFirst("footer").getAttribute("role") should be("contentinfo")
        findFirst("nav").getAttribute("role") should be("navigation")
        findFirst("nav").getAttribute("aria-label") should be("Guardian sections")
        findFirst("#article").getAttribute("role") should be("main")
        findFirst(".trailblock").getAttribute("role") should be("complementary")
        findFirst(".trailblock").getAttribute("aria-labelledby") should be("related-content-head")
        
      }
    }


    scenario("Story package with a gallery trail") {

      Given("I'm on an article that has a gallery in its story package")
      HtmlUnit("/global-development/poverty-matters/2013/jun/03/burma-rohingya-segregation") { browser =>
        import browser._

        Then("I should see a fancy gallery trail")
        $(".trail--gallery") should have size (1)

        And("it should have 3 thumbnails")
        $(".gallerythumbs__item") should have size (3)

        And("should show a total image count of 12")
        $(".trail__count--imagecount").getText should be("12 images")
      }


    }

  }
}
