package test

import org.scalatest.matchers.ShouldMatchers
import collection.JavaConversions._
import org.scalatest.FlatSpec

class ArticleTemplateTest extends FlatSpec with ShouldMatchers {
  "Article Template" should "render article metadata" in HtmlUnit("/environment/2012/feb/22/capitalise-low-carbon-future") { browser =>
    import browser._

    $("meta[name=content-type]").getAttributes("value").head should be("Article")
    $("meta[name=edition]").getAttributes("value").head should be("UK")
    $("meta[name=api-url]").getAttributes("value").head should be("http://content.guardianapis.com/environment/2012/feb/22/capitalise-low-carbon-future")
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

  it should "render article tag links" in HtmlUnit("/environment/2012/feb/22/capitalise-low-carbon-future") { browser =>
    import browser._

    val linkNames = $("a").getTexts
    val linkUrls = $("a").getAttributes("href")

    linkNames should contain("Environment")
    linkUrls should contain("http://localhost:3333/environment/climate-change")
  }
}