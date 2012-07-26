package test

import org.scalatest.matchers.ShouldMatchers
import collection.JavaConversions._
import org.scalatest.FlatSpec
import org.fluentlenium.core.domain.{ FluentWebElement, FluentList }

class ArticleTemplateTest extends FlatSpec with ShouldMatchers {
  "Article Template" should "render article metadata" in HtmlUnit("/environment/2012/feb/22/capitalise-low-carbon-future") { browser =>
    import browser._

    $("meta[name=content-type]").getAttributes("content").head should be("Article")
    $("meta[name=edition]").getAttributes("content").head should be("UK")
    $("meta[name=api-url]").getAttributes("content").head should be("http://content.guardianapis.com/environment/2012/feb/22/capitalise-low-carbon-future")

  }

  it should "render main picture correctly" in HtmlUnit("/sport/2012/jul/26/london-2012-north-korea-flag") { browser =>
    import browser._

    val mainPicture = $("article figure img")
    mainPicture.getAttributes("data-width").head should be("460")
    mainPicture.getAttributes("data-fullsrc").head should be("http://static.guim.co.uk/sys-images/Guardian/Pix/pictures/2012/7/26/1343289713632/North-Korea-womens-footba-010.jpg")
    mainPicture.getAttributes("src").head should be("http://static.guim.co.uk/sys-images/Guardian/Pix/pictures/2012/7/26/1343289709306/North-Korea-womens-footba-006.jpg")
  }

  it should "render article headline and body" in HtmlUnit("/environment/2012/feb/22/capitalise-low-carbon-future") { browser =>
    import browser._

    $("h1").first.getText should be("We must capitalise on a low-carbon future")
    $("article .article-body p").first.getText should include("David Cameron this week strongly defended onshore wind power")
  }

  it should "render article story package links" in HtmlUnit("/environment/2012/feb/22/capitalise-low-carbon-future") { browser =>
    import browser._

    val linkNames = $("a").getTexts
    val linkUrls = $("a").getAttributes("href")

    linkNames should contain("David Cameron defends windfarm plans to Tory MPs")
    linkUrls should contain("http://localhost:3333/environment/2012/feb/21/cameron-defends-wind-farm-mps")
  }

}