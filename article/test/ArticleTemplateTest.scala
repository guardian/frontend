package test

import org.scalatest.matchers.ShouldMatchers
import collection.JavaConversions._
import org.scalatest.FlatSpec
import org.fluentlenium.core.domain.{ FluentWebElement, FluentList }

class ArticleTemplateTest extends FlatSpec with ShouldMatchers {

  implicit val config = conf.Configuration

  "Article Template" should "render article metadata" in HtmlUnit("/environment/2012/feb/22/capitalise-low-carbon-future") { browser =>
    import browser._

    $("meta[name=content-type]").getAttributes("content").head should be("Article")
    $("meta[name=edition]").getAttributes("content").head should be("UK")
    $("meta[name=api-url]").getAttributes("content").head should be("http://content.guardianapis.com/environment/2012/feb/22/capitalise-low-carbon-future")

  }

  it should "gu.comrender main picture correctly" in HtmlUnit("/money/2012/jul/27/natwest-bank-debit-card") { browser =>
    import browser._

    val mainPicture = $("article figure img")
    mainPicture.getAttributes("data-width").head should be("460")
    mainPicture.getAttributes("data-fullsrc").head should be("http://static.guim.co.uk/sys-images/Guardian/Pix/cartoons/2012/7/27/1343382483210/NatWest-notice-apologisin-008.jpg")
    mainPicture.getAttributes("src").head should be("http://static.guim.co.uk/sys-images/Guardian/Pix/cartoons/2012/7/27/1343382478399/NatWest-notice-apologisin-004.jpg")
  }

  it should "render a story package" in HtmlUnit("/politics/2012/jul/25/george-osborne-under-pressure-economy") { browser =>
    import browser._

    val thumbnailFromStoryPackage = $("#related-trails a img").filter(_.getAttribute("src") == "http://static.guim.co.uk/sys-images/Guardian/About/General/2012/7/25/1343206659188/George-Osborne-Downing-St-003.jpg").head
    thumbnailFromStoryPackage.getAttribute("alt") should be("Shock 0.7% fall in UK GDP deepens double-dip recession")
    thumbnailFromStoryPackage.getAttribute("title") should be("Shock 0.7% fall in UK GDP deepens double-dip recession")

    val linkFromStoryPackage = $("#related-trails a").filter(_.getAttribute("href").endsWith("/business/2012/jul/25/shock-gdp-fall-deepens-double-dip-recession"))(1)
    linkFromStoryPackage.getText should be("Shock 0.7% fall in UK GDP deepens double-dip recession")
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
    linkUrls should contain(WithHost("/environment/2012/feb/21/cameron-defends-wind-farm-mps"))
  }
}