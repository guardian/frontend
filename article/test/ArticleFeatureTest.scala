package test

import conf.Configuration
import conf.switches.Switches._
import org.openqa.selenium.By
import org.scalatest.{DoNotDiscover, FeatureSpec, GivenWhenThen, Matchers}
import org.fluentlenium.core.filter.FilterConstructor._
import play.api.test.TestBrowser

import collection.JavaConverters._

@DoNotDiscover class ArticleFeatureTest extends FeatureSpec with GivenWhenThen with Matchers with ConfiguredTestSuite {

  implicit val config = Configuration

  feature("Article") {

    // Feature

    info("In order to experience all the wonderful words the Guardian write")
    info("As a Guardian reader")
    info("I want to read a version of the article optimised for my mobile devices")

    // Metrics

    info("Page views should *not* decrease.")
    info("Retain people on mobile (by reducing % of mobile traffic to www and clicks to the classic site)")

    // Scenarios

    scenario("Display a headline", ArticleComponents) {

      Given("I am on an article entitled 'Liu Xiang pulls up in opening race at second consecutive Olympics'")
      goTo("/sport/2012/aug/07/liu-xiang-injured-olympics") { browser =>
        import browser._

        Then("I should see the headline of the article")

        And("The article is marked up with the correct schema")
        val article = el("article[itemtype='http://schema.org/NewsArticle']")

        article.el("[itemprop=headline]").text should
          be("Liu Xiang pulls up in opening race at second consecutive Olympics")
      }
    }

    scenario("Display a short description of the article", ArticleComponents) {

      Given("I am on an article entitled 'Putting a price on the rivers and rain diminishes us all'")
      goTo("/commentisfree/2012/aug/06/price-rivers-rain-greatest-privatisation") { browser =>
        import browser._

        Then("I should see a short description of the article")
        el("[itemprop=description]").attribute("content") should
          be("George Monbiot: Payments for 'ecosystem services' look like the prelude to the greatest privatisation since enclosure")
      }
    }

    scenario("Have a meta description") {
      goTo("/sport/2012/jun/12/london-2012-olympic-opening-ceremony") { browser: TestBrowser =>
        import browser._
        el("meta[name=description]").attribute("content") should be("Director Danny Boyle reveals plans for London 2012 Olympic opening ceremony, including village cricket, maypoles and rain")
      }
    }

    scenario("Display the article author", ArticleComponents) {

      Given("I am on an article entitled 'TV highlights 09/08/2012'")
      goTo("/tv-and-radio/2012/aug/08/americas-animal-hoarder-the-churchills") { browser =>
        import browser._

        Then("I should see the names of the authors")
        el("[itemprop=author]").text should be("Ben Arnold")
        $("[itemprop=author]").last.text should be("Phelim O'Neill")

        And("I should see a link to the author's page")
        el("[itemprop=author] a[itemprop='sameAs']").attribute("href") should be(withHost("/profile/ben-arnold"))
        $("[itemprop=author] a[itemprop='sameAs']").last.attribute("href") should be(withHost("/profile/phelimoneill"))
      }
    }

    scenario("Display the byline image of the article author", ArticleComponents) {
      Given("I am on an article entitled 'This generational smugness about paedophilia is wrong'")
      goTo("/commentisfree/2014/feb/28/paedophilia-generation-mail-nccl") { browser =>
        import browser._

        Then("I should see a large byline image")
        $(".byline-img img").attribute("src") should include("2017/10/06/Jonathan-Freedland,-L.png")
      }
    }

    scenario("Keyword metadata", ArticleComponents) {

      Given("I am on an article entitled 'TV highlights 09/08/2012'")
      goTo("/tv-and-radio/2012/aug/08/americas-animal-hoarder-the-churchills") { browser =>
        import browser._

        Then("Keywords should be exposed")
        el("meta[name=keywords]").attribute("content") should be("Television,Television & radio,Culture,Proms 2012,Classical music,Proms,Music")

        And("News Keywords should be exposed")
        el("meta[name=news_keywords]").attribute("content") should be("Television,Television & radio,Culture,Proms 2012,Classical music,Proms,Music")
      }
    }

    scenario("Author metadata", ArticleComponents) {

      Given("I am on an article entitled 'TV highlights 09/08/2012'")
      goTo("/tv-and-radio/2012/aug/08/americas-animal-hoarder-the-churchills") { browser =>
        import browser._

        Then("the authors should be exposed as meta data")
        val authors = $("meta[name=author]")
        authors.first.attribute("content") should be("Ben Arnold")
        authors.last.attribute("content") should be("Mark Jones")

        And("it should handle escaping")
        authors.asScala(4).attribute("content") should be("Phelim O'Neill")
      }
    }

    scenario("Display the article image", ArticleComponents) {

      Given("I am on an article entitled 'Putting a price on the rivers and rain diminishes us all'")
      goTo("/commentisfree/2012/aug/06/price-rivers-rain-greatest-privatisation") { browser =>
        import browser._

        ImageServerSwitch.switchOn()

        Then("I should see the article's image")
        el("[itemprop='contentUrl']").attribute("src") should
          include("Gunnerside-village-Swaled")

//        And("I should see the image caption")
//        el("[itemprop='associatedMedia image'] [itemprop='description']").text should
//          be("Our rivers and natural resources are to be valued and commodified, a move that will benefit only the rich, argues George Monbiot. Photograph: Alamy")

        And("I should see the image url")
        el("[itemprop='associatedMedia image'] [itemprop=url]").attribute("content") should
          include("/img/static/sys-images/Guardian/Pix/pictures/2012/8/6/1344274684805/Gunnerside-village-Swaled-009.jpg?width=700&quality=85&auto=format&fit=max&s=")

        And("I should see the image width")
        el("[itemprop='associatedMedia image'] [itemprop=width]").attribute("content") should be("460")

        And("I should see the image height")
        el("[itemprop='associatedMedia image'] [itemprop=height]").attribute("content") should be("276")
      }
    }

    // scenario("Poster image on embedded video", ArticleComponents) {
    //   goTo("/world/2013/sep/25/kenya-mall-attack-bodies") { browser =>
    //     import browser._
    //     $("video").attribute("poster") should endWith("Westgate-shopping-centre--016.jpg")
    //   }
    // }

    scenario("Display the article publication date", ArticleComponents) {

      Given("I am on an article entitled 'Putting a price on the rivers and rain diminishes us all'")
      goTo("/commentisfree/2012/aug/06/price-rivers-rain-greatest-privatisation") { browser =>
        import browser._

        Then("I should see the publication date of the article")
        $(".content__dateline-wpd").text should be("Mon 6 Aug 2012 20.30 BST")
        $("time").attribute("datetime") should be("2012-08-06T20:30:00+0100")
      }
    }

    scenario("Articles should have the correct timezone for when they were published") {

      Given("I am on an article published on '2012-11-08'")
      And("I am on the 'UK' edition")
      goTo("/world/2012/nov/08/syria-arms-embargo-rebel") { browser =>
        import browser._
        Then("the date should be 'Thursday 8 November 2012 00.01 GMT'")
        $(".content__dateline time").text should be("Thu 8 Nov 2012 00.01 GMT")
      }

      Given("I am on an article published on '2012-11-08'")
      And("I am on the 'US' edition")
      US("/world/2012/nov/08/syria-arms-embargo-rebel") { browser =>
        import browser._
        Then("the date should be 'Wednesday 7 November 2012 19.01 GMT'")
        $(".content__dateline time").text should be("Wed 7 Nov 2012 19.01 EST")
      }

      Given("I am on an article published on '2012-08-19'")
      And("I am on the 'UK' edition")
      goTo("/business/2012/aug/19/shell-spending-security-nigeria-leak") { browser =>
        import browser._
        Then("the date should be 'Sunday 19 August 2012 18.38 BST'")
        $(".content__dateline time").text should be("Sun 19 Aug 2012 18.38 BST")
      }

      Given("I am on an article published on '2012-08-19'")
      And("I am on the 'US' edition")
      US("/business/2012/aug/19/shell-spending-security-nigeria-leak") { browser =>
        import browser._
        Then("the date should be 'Sunday 19 August 2012 13.38 BST'")
        $(".content__dateline time").text should be("Sun 19 Aug 2012 13.38 EDT")
      }

    }

//    scenario("Article body", ArticleComponents) {
//
//      Given("I am on an article entitled 'New Viking invasion at Lindisfarne'")
//      goTo("/uk/the-northerner/2012/aug/07/lindisfarne-vikings-northumberland-heritage-holy-island") { browser =>
//        import browser._
//
//        Then("I should see the body of the article")
//        $("[itemprop=articleBody]").text should startWith("This week Lindisfarne celebrates its long and frequently bloody Viking heritage")
//      }
//    }

    scenario("Article aside MPU", ArticleComponents) {

      Given("I am on an article entitled '10 of the best things to do in Tallinn'")
      And("I am on the 'UK' edition")
      goTo("/travel/2017/mar/20/10-best-things-to-do-tallinn-estonia-museums-cafe-art-beer") { browser =>
        import browser._

        $(".ad-slot--right").asScala.length should be(1)
        val adSlotRight = $(".ad-slot--right")

        Then("The article-aside MPU should have the correct sizes")
          adSlotRight.id should be("dfp-ad--right")
          adSlotRight.attribute("data-mobile") should be("1,1|2,2|300,250|300,274|300,600|fluid")
      }

      Given("I am on an article entitled '10 of the best things to do in Tallinn'")
      And("I am on the 'US' edition")
      US("/travel/2017/mar/20/10-best-things-to-do-tallinn-estonia-museums-cafe-art-beer") { browser =>
        import browser._

        val adSlotRight = $(".ad-slot--right")

        Then("The article-aside MPU should have the correct sizes")
          adSlotRight.id should be("dfp-ad--right")
          adSlotRight.attribute("data-mobile") should be("1,1|2,2|300,250|300,274|300,600|fluid|300,1050")
      }

      Given("I am on an immersive article, entitled 'Health insurance woes helped elect Trump, but his cure may be more painful'")
      goTo("/us-news/2017/mar/21/pennsylvania-healthcare-donald-trump-supporters") { browser =>
        import browser._

        val adSlotRight = $(".ad-slot--right")

        Then("The article-aside MPU should not be sticky")
          adSlotRight.id should be("dfp-ad--right")
          adSlotRight.attribute("class") should not include("js-sticky-mpu")
      }
    }

    scenario("In body pictures", ArticleComponents) {

      Given("I am on an article entitled 'A food revolution in Charleston, US'")
      goTo("/travel/2012/oct/11/charleston-food-gourmet-hotspot-barbecue") { browser =>
        import browser._

        Then("I should see pictures in the body of the article")

        $(".content__article-body .element-image").asScala.length should be(2)

        val inBodyImage = el(".content__article-body .element-image")

        ImageServerSwitch.switchOn()
        inBodyImage.$("[itemprop=contentUrl]").attribute("src") should
          include("sys-images/Travel/Late_offers/pictures/2012/10/11/1349951383662/Shops-in-Rainbow-Row-Char-001.jpg")

        And("I should see the image caption")
        inBodyImage.$("[itemprop=description]").text should
          be( """Shops in Rainbow Row, Charleston. Photograph: Getty Images""")
      }
    }

    scenario("Review stars", ArticleComponents) {

      Given("I am on a review entitled 'Slow West review – a lyrical ode to love on the wild frontier'")
      goTo("/film/2015/jun/28/slow-west-review-mark-kermode") { browser =>
        import browser._

        Then("I should see the star rating of the festival")
        And("The review is marked up with the correct schema")
        val review = el("article[itemtype='http://schema.org/Review']")

        review.$("[articleprop=reviewRating]").text should be("4 / 5 stars")
        review.$("[articleprop=ratingValue]").text should be("4")

        val reviewed = review.el("[articleprop=articleReviewed]")

        reviewed.attribute("articletype") should be("http://schema.org/Movie")
        reviewed.$("[articleprop=sameAs]").attribute("href") should be("http://www.imdb.com/title/tt3205376/")
      }
    }

    scenario("Articles that are also a different content type") {

      Given("An article that is also a video")
      goTo("/science/grrlscientist/2013/nov/02/british-birds-look-around-you-bbc-video") { browser =>
        import browser._

        Then("It should be rendered as an article")
        $("[itemprop=headline]").text should be("Birds of Britain | video")
      }
    }

    scenario("Articles should auto link to keywords") {

      Given("An article that has no in body links")
      goTo("/law/2014/jan/20/pakistan-drone-strike-relative-loses-gchq-court-case") { browser =>
        import browser._

        Then("It should automatically link to tags")
        val taglinks = $("a[data-link-name=auto-linked-tag]")

        taglinks.asScala.length should be(2)

        taglinks.asScala(0).text should be("GCHQ")
        taglinks.asScala(0).attribute("href") should endWith("/uk/gchq")

        taglinks.asScala(1).text should be("Pakistan")
      }
    }

    scenario("Articles should link section tags") {

      Given("An article that has no in body links")
      goTo("/environment/2014/jan/09/penguins-ice-walls-climate-change-antarctica") { browser =>
        import browser._

        Then("It should automatically link to tags")
        val taglinks = $("a[data-link-name=auto-linked-tag]")

        taglinks.asScala.map(_.text) should not contain "Science"
      }
    }

    scenario("Articles should link longest keywords first") {
      // so you don't overlap similar tags

      Given("An article that has no in body links")
      goTo("/uk-news/2013/dec/27/high-winds-heavy-rain-uk-ireland") { browser =>
        import browser._

        Then("It should automatically link to tags")
        val taglinks = $("a[data-link-name=auto-linked-tag]")

        taglinks.asScala.length should be(1)

        taglinks.asScala(0).text should be("Northern Ireland")
        taglinks.asScala(0).attribute("href") should endWith("/uk/northernireland")
      }
    }



//    scenario("Review body", ArticleComponents) {
//
//      // Nb, The schema.org markup for a review body is different to an article body
//
//      Given("I am on a review entitled 'Phill Jupitus is Porky the Poet in 27 Years On - Edinburgh festival review'")
//      goTo("/culture/2012/aug/07/phill-jupitus-edinburgh-review") { browser =>
//        import browser._
//
//        Then("I should see the star body")
//        $("[itemprop=reviewBody]").text should startWith("What's so funny?")
//      }
//    }

    scenario("correct placeholder for ad is rendered") {

      Given("the user navigates to a page")

      goTo("/environment/2012/feb/22/capitalise-low-carbon-future") { browser =>
        import browser._

        When("the page is rendered")

        Then("the ad slot placeholder is rendered")
        val adPlaceholder = $(".ad-slot--top-banner-ad")

        And("the placeholder has the correct data attributes")
        adPlaceholder.attribute("data-name") should be("top-above-nav")
        adPlaceholder.attribute("data-tablet") should be("1,1|2,2|728,90|88,71|fluid")
        adPlaceholder.attribute("data-desktop") should be("1,1|2,2|728,90|940,230|900,250|970,250|88,71|fluid")

        And("the placeholder has the correct class name")
        adPlaceholder.attribute("class") should include("js-ad-slot ad-slot ad-slot--top-above-nav ad-slot--top-banner-ad ad-slot--top-banner-ad-desktop")

        And("the placeholder has the correct analytics name")
        adPlaceholder.attribute("data-link-name") should be("ad slot top-above-nav")
      }
    }

    scenario("Video as main element should act as main media") {
      Given("I am on an article with a main video")
      goTo("/politics/2014/may/16/nigel-farage-lbc-interview-key-moments") { browser =>
        import browser._
        Then("the main media should contain a video")
        $(".media-primary video") should have size 1

        And("video meta name should be set")
        $("[itemprop='associatedMedia video'] [itemprop=name]").attribute("content") should be("Nigel Farage's LBC interview – the key moments")

        And("video meta thumbnailUrl should be set")
        $("[itemprop='associatedMedia video'] [itemprop=thumbnailUrl]").attribute("content") should
          include("img/static/sys-images/Guardian/Pix/audio/video/2014/5/16/1400240928538/Nigel-Farage-LBC-debate-i-014.jpg?width=640&quality=85&auto=format&fit=max&s=")

        And("video meta uploadDate should be set")
        $("[itemprop='associatedMedia video'] [itemprop=uploadDate]").attribute("content") should be("2014-05-16T16:09:34.000+01:00")
      }
    }

    scenario("SEO Thumbnail") {
      goTo("/society/2013/mar/26/failing-hospitals-nhs-jeremy-hunt") { browser =>
        import browser._
        Then("the main picture should be hidden")
        $("[itemprop='associatedMedia primaryImageOfPage']") should have size 0

        $("meta[name=thumbnail]").attribute("content") should include("sys-images/Guardian/Pix/pictures/2013/3/26/1364302888446/Jeremy-Hunt-005.jpg")
      }
    }

    scenario("Show embedded video in live blogs") {
      Given("I am on a live blog with an embedded video")
      goTo("/world/2013/jun/24/kevin-rudd-labour-politics-live") { browser =>
        import browser._
        Then("I should see the embedded video")
        $(".element-video").size should be(4)
      }
    }

    scenario("Show embedded tweets in live blogs") {
      Given("I am on a live blog with an embedded tweet")
      goTo("/world/2013/jun/24/kevin-rudd-labour-politics-live") { browser =>
        import browser._

        Then("I should see the embedded video")
        $(".element-tweet").size should be(12)
      }
    }

    scenario("Should include the first image of a tweet") {
      Given("I am on an article with a embedded Tweet")
      goTo("/world/2015/aug/22/hawker-hunter-plane-crash-shoreham-air-show-reports") { browser =>
        import browser._

        Then("I should see the first image of the tweet")
        el(".tweet").$("img").attribute("src") should include ("://pbs.twimg.com/media/CNBYttRWIAAHueY.jpg")
      }
    }

    scenario("Show primary picture on composer articles") {
      Given("I am on an article created in composer tools")
      goTo("/music/2016/may/19/rage-against-the-machine-chuck-d-b-real-supergroup-prophets-of-rage") { browser =>
        import browser._
        Then("The main picture should be show")
        $("[itemprop='contentUrl']") should have size 1
      }
    }

    scenario("Easily share an article via popular social media sites") {

      Given("I read an article and want to share it with my friends")

      goTo("/film/2012/nov/11/margin-call-cosmopolis-friends-with-kids-dvd-review") { browser =>
        import browser._

        val mailShareUrl = "mailto:?subject=Mark%20Kermode's%20DVD%20round-up&body=https%3A%2F%2Fwww.theguardian.com%2Ffilm%2F2012%2Fnov%2F11%2Fmargin-call-cosmopolis-friends-with-kids-dvd-review%3FCMP%3Dshare_btn_link"
        val fbShareUrl = "https://www.facebook.com/dialog/share?app_id=202314643182694&href=https%3A%2F%2Fwww.theguardian.com%2Ffilm%2F2012%2Fnov%2F11%2Fmargin-call-cosmopolis-friends-with-kids-dvd-review%3FCMP%3Dshare_btn_fb"
        val twitterShareUrl = "https://twitter.com/intent/tweet?text=Mark%20Kermode's%20DVD%20round-up&url=https%3A%2F%2Fwww.theguardian.com%2Ffilm%2F2012%2Fnov%2F11%2Fmargin-call-cosmopolis-friends-with-kids-dvd-review%3FCMP%3Dshare_btn_tw"

        Then("I should see buttons for my favourite social network")

        $(".social__item[data-link-name=email] .social__action").attribute("href") should be(mailShareUrl)
        $(".social__item[data-link-name=facebook] .social__action").attribute("href") should be(fbShareUrl)
        $(".social__item[data-link-name=twitter] .social__action").attribute("href") should be(twitterShareUrl)
      }
    }

    // http://www.w3.org/WAI/intro/aria
    scenario("Make the document accessible with ARIA support") {

      Given("I read an article")

      SearchSwitch.switchOn()

      goTo("/media/2015/aug/27/sky-sports-news-presenter-kirsty-gallacher-joins-strictly-line-up") { browser =>
        import browser._

        Then("I should see the main ARIA roles described")
        $("header").attribute("role") should be("banner")
        $(".l-footer__secondary").attribute("role") should be("contentinfo")
        $("nav").attribute("aria-label") should not be empty
        browser.find("nav").attribute("role") should be("navigation")
        $("#article").attribute("role") should be("main")
        $(".related").attribute("aria-labelledby") should be("related-content-head")
      }
    }

    scenario("Progressive related content") {
      Given("I visit a Guardian article page")
      goTo("/technology/askjack/2015/feb/05/how-should-i-upgrade-my-old-hi-fi-in-a-digital-world") { browser =>
        import browser._

        Then("There should be a placeholder for related content")
        val relatedLink = el("[data-test-id=related-content]")
        relatedLink.text should be (empty)
      }
    }

    scenario("Story package with a gallery trail") {

      Given("I'm on an article that has a gallery in its story package")
      goTo("/media/2015/aug/27/sky-sports-news-presenter-kirsty-gallacher-joins-strictly-line-up") { browser =>
        import browser._

        Then("I should see a fancy gallery trail")
        $(".fc-item--gallery") should have size 1
      }

    }

    scenario("Link to most popular") {
      Given("I'm on an article and JavaScript turned off")
      goTo("/global-development/poverty-matters/2013/jun/03/burma-rohingya-segregation") { browser =>
        import browser._

        Then("I should see link to most popular in the article section")
        $("[data-link-name=most-popular] a") should have size 1
      }
    }

    scenario("Show keywords in an article") {
      Given("I am on an article entitled 'Iran's Rouhani may meet Obama at UN after American president reaches out'")

      goTo("/world/2013/sep/15/obama-rouhani-united-nations-meeting") { browser =>
        import browser._

        Then("I should see links to keywords")
        $(".submeta__link").size should be(8)
      }
    }

    scenario("Don't show keywords in an article with only section tags (eg info/info) or no keywords") {
      Given("I am on an article entitled 'Removed: Eyeball-licking: the fetish that is making Japanese teenagers sick'")

      goTo("/info/2013/aug/26/2") { browser =>
        import browser._

        Then("I should not see a keywords list")
        $(".content__keywords *").size should be(0)
      }
    }

    scenario("Twitter cards") {
      Given("I am on an article entitled 'Iran's Rouhani may meet Obama at UN after American president reaches out'")
      goTo("/world/2013/sep/15/obama-rouhani-united-nations-meeting") { browser =>
        import browser._
        Then("I should see twitter cards")
        $("meta[name='twitter:site']").attributes("content").asScala.head should be("@guardian")
        $("meta[name='twitter:card']").attributes("content").asScala.head should be("summary_large_image")
        $("meta[name='twitter:app:url:googleplay']").attributes("content").asScala.head should startWith("guardian://www.theguardian.com/world")
        $("meta[name='twitter:image']").attributes("content").asScala.head should include("2013/9/15/1379275549160/Irans-President-Hassan-Ro-010.jpg")
      }
    }

    scenario("Twitter cards for live blogs") {
      Given("I am on an article that is a live blog")
      goTo("/us-news/live/2016/nov/11/donald-trump-news-us-politics-live") { browser =>
        import browser._
        Then("I should still see a large image twitter card")
        $("meta[name='twitter:site']").attributes("content").asScala.head should be("@guardian")
        $("meta[name='twitter:card']").attributes("content").asScala.head should be("summary_large_image")
        $("meta[name='twitter:app:url:googleplay']").attributes("content").asScala.head should startWith("guardian://www.theguardian.com/us-news")
      }
    }

    scenario("Canonical url") {
      Given("I am on an article entitled 'Iran's Rouhani may meet Obama at UN after American president reaches out'")
      goTo("/world/2013/sep/15/obama-rouhani-united-nations-meeting?view=mobile") { browser =>
        import browser._
        Then("There should be a canonical url")
        $("link[rel='canonical']").attribute("href") should endWith("/world/2013/sep/15/obama-rouhani-united-nations-meeting")
      }
    }

    scenario("Ensure that 'comment' always takes precedence before 'feature' when selecting article tone") {
      Given("I am on an article entitled 'Who would you like to see honoured by a blue plaque?'")

      goTo("/commentisfree/2013/jan/07/blue-plaque-english-heritage") { browser =>
        import browser._

        Then("I should see the comment tonal treatmemt")
        $(".content").attribute("class") should include("tone-comment")
      }
    }
  }
}
