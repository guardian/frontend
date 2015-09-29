package test

import conf.Configuration
import conf.switches.Switches
import conf.switches.Switches._
import org.openqa.selenium.By
import org.scalatest.{DoNotDiscover, Matchers, GivenWhenThen, FeatureSpec}
import org.fluentlenium.core.filter.FilterConstructor._
import collection.JavaConversions._

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
        val article = findFirst("article[itemtype='http://schema.org/NewsArticle']")

        article.findFirst("[itemprop=headline]").getText should
          be("Liu Xiang pulls up in opening race at second consecutive Olympics")
      }
    }

    scenario("Display a short description of the article", ArticleComponents) {

      Given("I am on an article entitled 'Putting a price on the rivers and rain diminishes us all'")
      goTo("/commentisfree/2012/aug/06/price-rivers-rain-greatest-privatisation") { browser =>
        import browser._

        Then("I should see a short description of the article")
        findFirst("[itemprop=description]").getAttribute("content") should
          be("George Monbiot: Payments for 'ecosystem services' look like the prelude to the greatest privatisation since enclosure")
      }
    }

    scenario("Have a meta description") {
      goTo("/sport/2012/jun/12/london-2012-olympic-opening-ceremony") { browser =>
        import browser._
        findFirst("meta[name=description]").getAttribute("content") should be("Director Danny Boyle reveals plans for London 2012 Olympic opening ceremony, including village cricket, maypoles and rain")
      }
    }

    scenario("Display the article author", ArticleComponents) {

      Given("I am on an article entitled 'TV highlights 09/08/2012'")
      goTo("/tv-and-radio/2012/aug/08/americas-animal-hoarder-the-churchills") { browser =>
        import browser._

        Then("I should see the names of the authors")
        $("[itemprop=author]")(0).getText should be("Ben Arnold")
        $("[itemprop=author]").last.getText should be("Phelim O'Neill")

        And("I should see a link to the author's page")
        $("[itemprop=author] a[itemprop='sameAs']")(0).getAttribute("href") should be(withHost("/profile/ben-arnold"))
        $("[itemprop=author] a[itemprop='sameAs']").last.getAttribute("href") should be(withHost("/profile/phelimoneill"))
      }
    }

    scenario("Display the byline image of the article author", ArticleComponents) {
      Given("I am on an article entitled 'This generational smugness about paedophilia is wrong'")
      goTo("/commentisfree/2014/feb/28/paedophilia-generation-mail-nccl") { browser =>
        import browser._

        Then("I should see a large byline image")
        $(".byline-img img").getAttribute("src") should include("Pix/pictures/2014/3/13/1394733740842/JonathanFreedland.png")
      }
    }

    scenario("Keyword metadata", ArticleComponents) {

      Given("I am on an article entitled 'TV highlights 09/08/2012'")
      goTo("/tv-and-radio/2012/aug/08/americas-animal-hoarder-the-churchills") { browser =>
        import browser._

        Then("Keywords should be exposed")
        findFirst("meta[name=keywords]").getAttribute("content") should be("Television,Television & radio,Culture,Proms 2012,Classical music,Proms,Music")

        And("News Keywords should be exposed")
        findFirst("meta[name=news_keywords]").getAttribute("content") should be("Television,Television & radio,Culture,Proms 2012,Classical music,Proms,Music")
      }
    }

    scenario("Author metadata", ArticleComponents) {

      Given("I am on an article entitled 'TV highlights 09/08/2012'")
      goTo("/tv-and-radio/2012/aug/08/americas-animal-hoarder-the-churchills") { browser =>
        import browser._

        Then("the authors should be exposed as meta data")
        val authors = $("meta[name=author]")
        authors.first.getAttribute("content") should be("Ben Arnold")
        authors.last.getAttribute("content") should be("Mark Jones")

        And("it should handle escaping")
        authors(4).getAttribute("content") should be("Phelim O'Neill")
      }
    }

    scenario("Display the article image", ArticleComponents) {

      Given("I am on an article entitled 'Putting a price on the rivers and rain diminishes us all'")
      goTo("/commentisfree/2012/aug/06/price-rivers-rain-greatest-privatisation") { browser =>
        import browser._

        ImageServerSwitch.switchOn()

        Then("I should see the article's image")
        findFirst("[itemprop='contentUrl']").getAttribute("src") should
          include("Gunnerside-village-Swaled")

        And("I should see the image caption")
        findFirst("[itemprop='associatedMedia image'] [itemprop=description]").getText should
          be("Our rivers and natural resources are to be valued and commodified, a move that will benefit only the rich, argues Goegr Monbiot. Photograph: Alamy")
      }
    }

    // scenario("Poster image on embedded video", ArticleComponents) {
    //   goTo("/world/2013/sep/25/kenya-mall-attack-bodies") { browser =>
    //     import browser._
    //     findFirst("video").getAttribute("poster") should endWith("Westgate-shopping-centre--016.jpg")
    //   }
    // }

    scenario("Display the article publication date", ArticleComponents) {

      Given("I am on an article entitled 'Putting a price on the rivers and rain diminishes us all'")
      goTo("/commentisfree/2012/aug/06/price-rivers-rain-greatest-privatisation") { browser =>
        import browser._

        Then("I should see the publication date of the article")
        findFirst(".content__dateline-wpd").getText should be("Monday 6 August 2012 20.30 BST")
        findFirst("time").getAttribute("datetime") should be("2012-08-06T20:30:00+0100")
      }
    }

    scenario("Live blogs should have a coverage start and end date", ArticleComponents) {

      Given("I am on a dead live blog")
      goTo("/books/live/2015/jul/13/go-set-a-watchman-launch-follow-it-live") { browser =>
        import browser._

        Then("I should see the start and end date of coverage")
        val liveBlogPosting = findFirst("[itemtype='http://schema.org/LiveBlogPosting']").getElement
        liveBlogPosting.findElement(By.cssSelector("[itemprop='coverageStartTime']")).getAttribute("content") should be("2015-07-14T11:20:37+0100")
        liveBlogPosting.findElement(By.cssSelector("[itemprop='coverageEndTime']")).getAttribute("content") should be("2015-07-14T11:21:27+0100")
      }
    }

    scenario("Articles should have the correct timezone for when they were published") {

      Given("I am on an article published on '2012-11-08'")
      And("I am on the 'UK' edition")
      goTo("/world/2012/nov/08/syria-arms-embargo-rebel") { browser =>
        import browser._
        Then("the date should be 'Thursday 8 November 2012 00.01 GMT'")
        findFirst(".content__dateline time").getText should be("Thursday 8 November 2012 00.01 GMT")
      }

      Given("I am on an article published on '2012-11-08'")
      And("I am on the 'US' edition")
      US("/world/2012/nov/08/syria-arms-embargo-rebel") { browser =>
        import browser._
        Then("the date should be 'Wednesday 7 November 2012 19.01 GMT'")
        findFirst(".content__dateline time").getText should be("Wednesday 7 November 2012 19.01 EST")
      }

      Given("I am on an article published on '2012-08-19'")
      And("I am on the 'UK' edition")
      goTo("/business/2012/aug/19/shell-spending-security-nigeria-leak") { browser =>
        import browser._
        Then("the date should be 'Sunday 19 August 2012 18.38 BST'")
        findFirst(".content__dateline time").getText should be("Sunday 19 August 2012 18.38 BST")
      }

      Given("I am on an article published on '2012-08-19'")
      And("I am on the 'US' edition")
      US("/business/2012/aug/19/shell-spending-security-nigeria-leak") { browser =>
        import browser._
        Then("the date should be 'Sunday 19 August 2012 13.38 BST'")
        findFirst(".content__dateline time").getText should be("Sunday 19 August 2012 13.38 EDT")
      }

    }

    scenario("Article body", ArticleComponents) {

      Given("I am on an article entitled 'New Viking invasion at Lindisfarne'")
      goTo("/uk/the-northerner/2012/aug/07/lindisfarne-vikings-northumberland-heritage-holy-island") { browser =>
        import browser._

        Then("I should see the body of the article")
        findFirst("[itemprop=articleBody]").getText should startWith("This week Lindisfarne celebrates its long and frequently bloody Viking heritage")
      }
    }

    scenario("In body pictures", ArticleComponents) {

      Given("I am on an article entitled 'A food revolution in Charleston, US'")
      goTo("/travel/2012/oct/11/charleston-food-gourmet-hotspot-barbecue") { browser =>
        import browser._

        Then("I should see pictures in the body of the article")

        $(".content__article-body .element-image").length should be(2)

        val inBodyImage = findFirst(".content__article-body .element-image")

        ImageServerSwitch.switchOn()
        inBodyImage.findFirst("[itemprop=contentUrl]").getAttribute("src") should
          include("sys-images/Travel/Late_offers/pictures/2012/10/11/1349951383662/Shops-in-Rainbow-Row-Char-001.jpg")

        And("I should see the image caption")
        inBodyImage.findFirst("[itemprop=description]").getText should
          be( """Shops in Rainbow Row, Charleston. Photograph: Getty Images""")
      }
    }

    scenario("Review stars", ArticleComponents) {

      Given("I am on a review entitled 'Slow West review – a lyrical ode to love on the wild frontier'")
      goTo("/film/2015/jun/28/slow-west-review-mark-kermode") { browser =>
        import browser._

        Then("I should see the star rating of the festival")
        And("The review is marked up with the correct schema")
        val review = findFirst("article[itemtype='http://schema.org/Review']")

        review.findFirst("[itemprop=reviewRating]").getText should be("4 / 5 stars")
        review.findFirst("[itemprop=ratingValue]").getText should be("4")

        val reviewed = review.findFirst("[itemprop=itemReviewed]")

        reviewed.getAttribute("itemtype") should be("http://schema.org/Movie")
        reviewed.findFirst("[itemprop=sameAs]").getAttribute("href") should be("http://www.imdb.com/title/tt3205376/")
      }
    }

    scenario("Articles that are also a different content type") {

      Given("An article that is also a video")
      goTo("/science/grrlscientist/2013/nov/02/british-birds-look-around-you-bbc-video") { browser =>
        import browser._

        Then("It should be rendered as an article")
        findFirst("[itemprop=headline]").getText should be("Birds of Britain | video")
      }
    }

    scenario("Articles should auto link to keywords") {

      Given("An article that has no in body links")
      goTo("/law/2014/jan/20/pakistan-drone-strike-relative-loses-gchq-court-case") { browser =>
        import browser._

        Then("It should automatically link to tags")
        val taglinks = $("a[data-link-name=auto-linked-tag]")

        taglinks.length should be(2)

        taglinks(0).getText should be("GCHQ")
        taglinks(0).getAttribute("href") should endWith("/uk/gchq")

        taglinks(1).getText should be("Pakistan")
      }
    }

    scenario("Articles should link section tags") {

      Given("An article that has no in body links")
      goTo("/environment/2014/jan/09/penguins-ice-walls-climate-change-antarctica") { browser =>
        import browser._

        Then("It should automatically link to tags")
        val taglinks = $("a[data-link-name=auto-linked-tag]")

        taglinks.map(_.getText) should not contain "Science"
      }
    }

    scenario("Articles should link longest keywords first") {
      // so you don't overlap similar tags

      Given("An article that has no in body links")
      goTo("/uk-news/2013/dec/27/high-winds-heavy-rain-uk-ireland") { browser =>
        import browser._

        Then("It should automatically link to tags")
        val taglinks = $("a[data-link-name=auto-linked-tag]")

        taglinks.length should be(1)

        taglinks(0).getText should be("Northern Ireland")
        taglinks(0).getAttribute("href") should endWith("/uk/northernireland")
      }
    }



    scenario("Review body", ArticleComponents) {

      // Nb, The schema.org markup for a review body is different to an article body

      Given("I am on a review entitled 'Phill Jupitus is Porky the Poet in 27 Years On - Edinburgh festival review'")
      goTo("/culture/2012/aug/07/phill-jupitus-edinburgh-review") { browser =>
        import browser._

        Then("I should see the star body")
        findFirst("[itemprop=reviewBody]").getText should startWith("What's so funny?")
      }
    }

    scenario("correct placeholder for ad is rendered") {

      Given("the user navigates to a page")

      StandardAdvertsSwitch.switchOn()

      goTo("/environment/2012/feb/22/capitalise-low-carbon-future") { browser =>
        import browser._

        When("the page is rendered")

        Then("the ad slot placeholder is rendered")
        val adPlaceholder = $(".ad-slot--top-banner-ad")

        And("the placeholder has the correct data attributes")
        adPlaceholder.getAttribute("data-name") should be("top-above-nav")
        adPlaceholder.getAttribute("data-mobile") should be("1,1|88,70|728,90")
        adPlaceholder.getAttribute("data-desktop") should be("1,1|88,70|728,90|940,230|900,250|970,250")

        And("the placeholder has the correct class name")
        adPlaceholder.getAttribute("class") should be("js-ad-slot ad-slot ad-slot--dfp ad-slot--top-above-nav ad-slot--top-banner-ad")

        And("the placeholder has the correct analytics name")
        adPlaceholder.getAttribute("data-link-name") should be("ad slot top-above-nav")
      }

      // put it back in the state we found it
      StandardAdvertsSwitch.switchOff()
    }

    scenario("Direct link to paragraph") {

      Given("I have clicked a direct link to paragrah 16 on the article 'Eurozone crisis live: Fitch downgrades Greece on euro exit fears'")

      goTo("/business/2012/may/17/eurozone-crisis-cameron-greece-euro-exit#block-16") { browser =>
        import browser._

        Then("I should see paragraph 16")
        findFirst("#block-16").getText should startWith("11.31am: Vince Cable, the business secretary")
      }
    }

    scenario("Video as main element should act as main media") {
      Given("I am on an article with a main video")
      goTo("/politics/2014/may/16/nigel-farage-lbc-interview-key-moments") { browser =>
        import browser._
        Then("the main media should contain a video")
        $(".media-primary video") should have size 1
      }
    }

    scenario("SEO Thumbnail") {
      goTo("/society/2013/mar/26/failing-hospitals-nhs-jeremy-hunt") { browser =>
        import browser._
        Then("the main picture should be hidden")
        $("[itemprop='associatedMedia primaryImageOfPage']") should have size 0

        findFirst("meta[name=thumbnail]").getAttribute("content") should include("sys-images/Guardian/Pix/pictures/2013/3/26/1364302888446/Jeremy-Hunt-005.jpg")
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
        findFirst(".tweet").findFirst("img").getAttribute("src") should include ("://pbs.twimg.com/media/CNBYttRWIAAHueY.jpg")
      }
    }

    scenario("Show primary picture on composer articles") {
      Given("I am on an article created in composer tools")
      goTo("/artanddesign/2013/apr/15/buildings-tall-architecture-guardianwitness") { browser =>
        import browser._
        Then("The main picture should be show")
        $("[itemprop='contentUrl']") should have size 1
      }
    }

    scenario("Easily share an article via popular social media sites") {

      Given("I read an article and want to share it with my friends")

      goTo("/film/2012/nov/11/margin-call-cosmopolis-friends-with-kids-dvd-review") { browser =>
        import browser._

        val mailShareUrl = "mailto:?subject=Mark%20Kermode's%20DVD%20round-up&body=http%3A%2F%2Fgu.com%2Fp%2F3bk2f%2Fsbl"
        val fbShareUrl = "https://www.facebook.com/dialog/share?app_id=202314643182694&href=http%3A%2F%2Fgu.com%2Fp%2F3bk2f%2Fsfb&redirect_uri=http%3A%2F%2Fgu.com%2Fp%2F3bk2f"
        val twitterShareUrl = "https://twitter.com/intent/tweet?text=Mark+Kermode%27s+DVD+round-up&url=http%3A%2F%2Fgu.com%2Fp%2F3bk2f%2Fstw"
        val gplusShareUrl = "https://plus.google.com/share?url=http%3A%2F%2Fgu.com%2Fp%2F3bk2f%2Fsgp&amp;hl=en-GB&amp;wwc=1"

        Then("I should see buttons for my favourite social network")
        findFirst(".social__item[data-link-name=email] .social__action").getAttribute("href") should be(mailShareUrl)
        findFirst(".social__item[data-link-name=facebook] .social__action").getAttribute("href") should be(fbShareUrl)
        findFirst(".social__item[data-link-name=twitter] .social__action").getAttribute("href") should be(twitterShareUrl)
        findFirst(".social__item[data-link-name=gplus] .social__action").getAttribute("href") should be(gplusShareUrl)
      }
    }

    // http://www.w3.org/WAI/intro/aria
    scenario("Make the document accessible with ARIA support") {

      Given("I read an article")

      SearchSwitch.switchOn()

      goTo("/world/2013/jan/27/brazil-nightclub-blaze-high-death-toll") { browser =>
        import browser._

        Then("I should see the main ARIA roles described")
        findFirst(".related").getAttribute("role") should be("complementary")
        findFirst("aside").getAttribute("role") should be("complementary")
        findFirst("header").getAttribute("role") should be("banner")
        findFirst(".l-footer__secondary").getAttribute("role") should be("contentinfo")
        findFirst("nav").getAttribute("role") should be("navigation")
        findFirst("nav").getAttribute("aria-label") should not be empty
        browser.find("nav", 1).getAttribute("role") should be("navigation")
        browser.find("nav", 1).getAttribute("aria-label") should not be empty
        findFirst("#article").getAttribute("role") should be("main")
        findFirst(".related").getAttribute("aria-labelledby") should be("related-content-head")
      }
    }

    scenario("Progressive related content") {
      Given("I visit a Guardian article page")
      goTo("/technology/askjack/2015/feb/05/how-should-i-upgrade-my-old-hi-fi-in-a-digital-world") { browser =>
        import browser._

        Then("There should be a placeholder for related content")
        val relatedLink = findFirst("[data-test-id=related-content]")
        relatedLink.getText() should be (empty)
      }
    }

    scenario("Story package with a gallery trail") {

      Given("I'm on an article that has a gallery in its story package")
      goTo("/global-development/poverty-matters/2013/jun/03/burma-rohingya-segregation") { browser =>
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
        $(".keyword-list a").size should be(16)
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
        $("meta[name='twitter:site']").getAttributes("content").head should be("@guardian")
        $("meta[name='twitter:card']").getAttributes("content").head should be("summary_large_image")
        $("meta[name='twitter:app:url:googleplay']").getAttributes("content").head should startWith("guardian://www.theguardian.com/world")

        // at the time of writing, Twitter does not like i.guim.co.uk
        // will see if I can get that fixed, but in the meantime this must be static.guim.co.uk
        $("meta[name='twitter:image']").getAttributes("content").head should be("http://static.guim.co.uk/sys-images/Guardian/Pix/GU_front_gifs/2013/9/15/1379275550234/Irans-President-Hassan-Ro-011.jpg")
      }
    }

    scenario("Canonical url") {
      Given("I am on an article entitled 'Iran's Rouhani may meet Obama at UN after American president reaches out'")
      goTo("/world/2013/sep/15/obama-rouhani-united-nations-meeting?view=mobile") { browser =>
        import browser._
        Then("There should be a canonical url")
        findFirst("link[rel='canonical']").getAttribute("href") should endWith("/world/2013/sep/15/obama-rouhani-united-nations-meeting")
      }
    }

    scenario("Ensure that 'comment' always takes precedence before 'feature' when selecting article tone") {
      Given("I am on an article entitled 'Who would you like to see honoured by a blue plaque?'")

      goTo("/commentisfree/2013/jan/07/blue-plaque-english-heritage") { browser =>
        import browser._

        Then("I should see the comment tonal treatmemt")
        $(".content").getAttribute("class") should include("tone-comment")
      }
    }

    scenario("Display breadcrumbs correctly") {
      Given("I am on a piece of content with a primary nav, secondary nav and a key woro")
      goTo("/books/2014/may/21/guardian-journalists-jonathan-freedland-ghaith-abdul-ahad-win-orwell-prize-journalism") { browser =>
        import browser._
        Then("I should see three breadcrumbs")
        $(".breadcrumb .signposting__item").size() should be(3)

        val link = browser.find(".breadcrumb .signposting__item a", withText().contains("Culture"))
        link.length should be > 0
        val link2 = browser.find(".breadcrumb .signposting__item a", withText().contains("Books"))
        link2.length should be > 0
        val link3 = browser.find(".breadcrumb .signposting__item a", withText().contains("Orwell prize"))
        link3.length should be > 0
      }

      Given("I am on a piece of content with a primary nav and a key woro")
      goTo("/commentisfree/2013/jan/07/blue-plaque-english-heritage") { browser =>
        import browser._
        Then("I should see three breadcrumbs")
        $(".breadcrumb .signposting__item").size() should be(2)

        val link = browser.find(".breadcrumb .signposting__item a", withText().contains("Opinion"))
        link.length should be > 0
        val link2 = browser.find(".breadcrumb .signposting__item a", withText().contains("Heritage"))
        link2.length should be > 0
      }

      Given("I am on a piece of content with no primary nav and a no key words")
      goTo("/observer-ethical-awards/shortlist-2014") { browser =>
        import browser._
        Then("I should see one breadcrumbs")
        $(".breadcrumb .signposting__item").size() should be(1)

        val link = browser.find(".breadcrumb .signposting__item a", withText().contains("Observer Ethical Awards"))
        link.length should be > 0
      }
    }

    scenario("Outbrain") {

      Given("I am on an article")
      OutbrainSwitch.switchOn()
      goTo("/society/2014/oct/15/lord-freud-unreserved-apology-comment-disabled-people-mimimu-wage") {
        browser =>
          import browser._
          Then("Then the Outbrain placeholder should be rendered")
          var outbrainPlaceholder = $(".js-outbrain")
          outbrainPlaceholder.length should be(1)
      }

      Given("I am on a live blog")
      goTo("/politics/blog/live/2014/oct/15/cameron-and-miliband-at-pmqs-politics-live-blog") {
        browser =>
          import browser._
          Then("Then the Outbrain placeholder should not be rendered")
          $(".js-outbrain").isEmpty should be(true)

      }

    }

  }
}
