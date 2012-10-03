package test

import org.scalatest.matchers.ShouldMatchers
import org.scalatest.{ GivenWhenThen, FeatureSpec }
import collection.JavaConversions._
import org.fluentlenium.core.domain.FluentWebElement
import conf.Configuration

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

      given("I am on an article entitled 'Liu Xiang pulls up in opening race at second consecutive Olympics'")
      HtmlUnit("/sport/2012/aug/07/liu-xiang-injured-olympics") { browser =>
        import browser._

        then("I should see the headline of the article")

        and("The article is marked up with the correct schema")
        val article = findFirst("article[itemtype='http://schema.org/Article']")

        article.findFirst("[itemprop=headline]").getText should
          be("Liu Xiang pulls up in opening race at second consecutive Olympics")
      }
    }

    scenario("Display a short description of the article", ArticleComponents) {

      given("I am on an article entitled 'Putting a price on the rivers and rain diminishes us all'")
      HtmlUnit("/commentisfree/2012/aug/06/price-rivers-rain-greatest-privatisation") { browser =>
        import browser._

        then("I should see a short description of the article")
        findFirst("[itemprop=description]").getText should
          be("Payments for 'ecosystem services' look like the prelude to the greatest privatisation since enclosure")
      }
    }

    scenario("Display the article author", ArticleComponents) {

      given("I am on an article entitled 'TV highlights 09/08/2012'")
      HtmlUnit("/tv-and-radio/2012/aug/08/americas-animal-hoarder-the-churchills") { browser =>
        import browser._

        then("I should see the names of the authors")
        $("[itemprop=author]")(0).getText should be("Ben Arnold")
        $("[itemprop=author]").last.getText should be("Phelim O'Neill")

        and("I should see a link to the author's page")
        $("[itemprop=author] a[itemprop='url name']")(0).getAttribute("href") should be(WithHost("/profile/ben-arnold"))
        $("[itemprop=author] a[itemprop='url name']").last.getAttribute("href") should be(WithHost("/profile/phelimoneill"))
      }
    }

    scenario("Display the article image", ArticleComponents) {

      given("I am on an article entitled 'Putting a price on the rivers and rain diminishes us all'")
      HtmlUnit("/commentisfree/2012/aug/06/price-rivers-rain-greatest-privatisation") { browser =>
        import browser._

        then("I should see the article's image")
        findFirst("[itemprop='associatedMedia primaryImageOfPage'] img[itemprop=contentURL]").getAttribute("src") should
          be("http://static.guim.co.uk/sys-images/Guardian/Pix/pictures/2012/8/6/1344274679326/Gunnerside-village-Swaled-005.jpg")

        and("I should see the image caption")
        findFirst("[itemprop='associatedMedia primaryImageOfPage'] [itemprop=description]").getText should
          be("Our rivers and natural resources are to be valued and commodified, a move that will benefit only the rich, argues Goegr Monbiot. Photograph: Alamy")
      }
    }

    scenario("Display the article publication date", ArticleComponents) {

      given("I am on an article entitled 'Putting a price on the rivers and rain diminishes us all'")
      HtmlUnit("/commentisfree/2012/aug/06/price-rivers-rain-greatest-privatisation") { browser =>
        import browser._

        then("I should see the publication date of the article")
        //cannot use the fluentium to select a meta tag and then get its text
        findFirst(".dateline").getText should be("Monday 6 August 2012 19.30 GMT")
        findFirst("meta[itemprop=datePublished]").getAttribute("content") should be("2012-08-06")
      }
    }

    scenario("Article body", ArticleComponents) {

      given("I am on an article entitled 'New Viking invasion at Lindisfarne'")
      HtmlUnit("/uk/the-northerner/2012/aug/07/lindisfarne-vikings-northumberland-heritage-holy-island") { browser =>
        import browser._

        then("I should see the body of the article")
        findFirst("[itemprop=articleBody]").getText should startWith("This week Lindisfarne celebrates its long and frequently bloody Viking heritage")
      }
    }

    scenario("In body pictures", ArticleComponents) {

      given("I am on an article entitled 'New Viking invasion at Lindisfarne'")
      HtmlUnit("/uk/the-northerner/2012/aug/07/lindisfarne-vikings-northumberland-heritage-holy-island") { browser =>
        import browser._

        then("I should see pictures in the body of the article")
        val inBodyImage = $("[itemprop=associatedMedia]")(2)
        inBodyImage.findFirst("img[itemprop=contentURL]").getAttribute("src") should
          be("http://static.guim.co.uk/sys-images/Guardian/Pix/pictures/2012/8/7/1344330044209/Lindisfarne_longboat.jpg")

        and("I should see the image caption")
        inBodyImage.findFirst("[itemprop=description]").getText should
          be("""A longboat among the ruins. Pic by English Heritage""")
      }
    }

    scenario("Review stars", ArticleComponents) {

      given("I am on a review entitled 'Phill Jupitus is Porky the Poet in 27 Years On - Edinburgh festival review'")
      HtmlUnit("/culture/2012/aug/07/phill-jupitus-edinburgh-review") { browser =>
        import browser._

        then("I should see the star rating of the festival")
        and("The review is marked up with the correct schema")
        val review = findFirst("article[itemtype='http://schema.org/Review']")

        review.findFirst(".stars").getText should be("3 / 5 stars")
        review.findFirst("[itemprop=reviewRating]").getAttribute("content") should be("3")
      }
    }

    scenario("Review body", ArticleComponents) {

      // Nb, The schema.org markup for a review body is different to an article body

      given("I am on a review entitled 'Phill Jupitus is Porky the Poet in 27 Years On - Edinburgh festival review'")
      HtmlUnit("/culture/2012/aug/07/phill-jupitus-edinburgh-review") { browser =>
        import browser._

        then("I should see the star body")
        findFirst("[itemprop=reviewBody]").getText should startWith("What's so funny?")
      }
    }

    scenario("correct placeholder for ad is rendered") {

      given("the user navigates to a page")
      HtmlUnit("/environment/2012/feb/22/capitalise-low-carbon-future") { browser =>
        import browser._

        when("the page is rendered")

        then("the ad slot placeholder is rendered")
        val adPlaceholder = $("#ad-slot-top-banner-ad").first()

        and("the placeholder has the correct slot names")
        adPlaceholder.getAttribute("data-base") should be("x50")
        adPlaceholder.getAttribute("data-median") should be("x52")
        adPlaceholder.getAttribute("data-extended") should be("x54")

        and("the placeholder has the correct class name")
        adPlaceholder.getAttribute("class") should be("ad-slot")

        and("the placeholder has the correct analytics name")
        adPlaceholder.getAttribute("data-link-name") should be("ad slot top-banner-ad")
      }
    }

    scenario("Navigate to the desktop site (UK edition - www.guardian.co.uk)") {
      given("I'm on article entitled 'We must capitalise on a low-carbon future'")
      and("I am using the UK edition")
      HtmlUnit("/environment/2012/feb/22/capitalise-low-carbon-future") { browser =>
        import browser._

        then("I should see a link to the corresponding desktop article")
        findFirst("#main-site").getAttribute("href") should be("http://www.guardian.co.uk/environment/2012/feb/22/capitalise-low-carbon-future?mobile-redirect=false")
      }
    }

    scenario("Navigate to the desktop site (US edition - www.guardiannews.com)") {
      given("I'm on article entitled 'We must capitalise on a low-carbon future'")
      and("I am using the US edition")
      HtmlUnit.US("/environment/2012/feb/22/capitalise-low-carbon-future") { browser =>
        import browser._

        then("I should see a link to the corresponding desktop article")
        findFirst("#main-site").getAttribute("href") should
          be("http://www.guardiannews.com/environment/2012/feb/22/capitalise-low-carbon-future?mobile-redirect=false")
      }
    }

    scenario("Story package navigation") {

      given("I'm on an article entitled 'The investment strike is one the government would do well to bust'")

      HtmlUnit("/commentisfree/2012/aug/04/investment-strike-business-economy") { browser =>
        import browser._

        then("I should see navigation to related content")
        val related = $("#related-trails")
        $("[itemprop=relatedLink]").size() should be(5)
        val relatedLink = findFirst("[itemprop=relatedLink]")
        relatedLink.getText should be("Danny Alexander downplays UK's AAA credit rating")
        relatedLink.getAttribute("href") should be(WithHost("/politics/2012/aug/06/danny-alexander-downplays-aaa-rating"))

        and("I should see an image link to the related content")
        val imageLink = related.find("a").filter(hasLinkName(_, "trail image | item 1")).head
        imageLink.getAttribute("href") should be(WithHost("/politics/2012/aug/06/danny-alexander-downplays-aaa-rating"))
        imageLink.find("img").head.getAttribute("src") should
          be("http://static.guim.co.uk/sys-images/Business/Pix/pictures/2012/7/20/1342784451172/Chancellor-George-Osborne-003.jpg")
      }
    }

    scenario("Direct link to paragraph") {

      given("I have clicked a direct link to paragrah 16 on the article 'Eurozone crisis live: Fitch downgrades Greece on euro exit fears'")

      HtmlUnit("/business/2012/may/17/eurozone-crisis-cameron-greece-euro-exit#block-16") { browser =>
        import browser._

        then("I should see paragraph 16")
        findFirst("#block-16").getText should startWith("11.31am: Vince Cable, the business secretary")
      }
    }
  }

  private def hasLinkName(e: FluentWebElement, name: String) = e.getAttribute("data-link-name") == name
}
