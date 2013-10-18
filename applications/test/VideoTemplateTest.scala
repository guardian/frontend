package test

import org.scalatest.Matchers
import org.scalatest.FlatSpec

class VideoTemplateTest extends FlatSpec with Matchers {
  //  "Article Template" should "render article metadata" in HtmlUnit("/environment/2012/feb/22/capitalise-low-carbon-future") { browser =>
  //    import browser._
  //
  //    $("meta[name=content-type]").getAttributes("content").head should be("Article")
  //    $("meta[name=edition]").getAttributes("content").head should be("UK")
  //    $("meta[name=api-url]").getAttributes("content").head should be("http://content.guardianapis.com/environment/2012/feb/22/capitalise-low-carbon-future")
  //  }
  //
  //  it should "render article headline and body" in HtmlUnit("/environment/2012/feb/22/capitalise-low-carbon-future") { browser =>
  //    import browser._
  //
  //    $("h1").first.getText should be("We must capitalise on a low-carbon future")
  //    $("article .article-body p").first.getText should include("David Cameron this week strongly defended onshore wind power")
  //  }
  //
  //  it should "render article story package links" in HtmlUnit("/environment/2012/feb/22/capitalise-low-carbon-future") { browser =>
  //    import browser._
  //
  //    val linkNames = $("a").getTexts
  //    val linkUrls = $("a").getAttributes("href")
  //
  //    linkNames should contain("David Cameron defends windfarm plans to Tory MPs")
  //    linkUrls should contain("http://localhost:3333/environment/2012/feb/21/cameron-defends-wind-farm-mps")
  //  }

  //code to render these in template is currently hidden

  //  it should "render article tag links" in HtmlUnit("/environment/2012/feb/22/capitalise-low-carbon-future") { browser =>
  //    import browser._
  //
  //    val linkNames = $("a").getTexts
  //    val linkUrls = $("a").getAttributes("href")
  //
  //    linkNames should contain("Environment")
  //    linkUrls should contain("http://localhost:3333/environment/climate-change")
  //  }
}