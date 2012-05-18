package test

import org.scalatest.matchers.ShouldMatchers
import collection.JavaConversions._
import org.scalatest.FlatSpec

class GalleryTemplateTest extends FlatSpec with ShouldMatchers {
  "Gallery Template" should "render article metadata" in HtmlUnit("/news/gallery/2012/may/02/picture-desk-live-kabul-burma") {
    browser =>
      import browser._

      $("meta[name=content-type]").getAttributes("value").head should be("Gallery")
      $("meta[name=api-url]").getAttributes("value").head should be("http://content.guardianapis.com/news/gallery/2012/may/02/picture-desk-live-kabul-burma")
  }

  it should "render gallery headline" in HtmlUnit("/news/gallery/2012/may/02/picture-desk-live-kabul-burma") {
    browser =>
      import browser._

      $("h1").first.getText should be("Picture desk live: the day's best news images")
  }

  it should "render gallery story package links" in HtmlUnit("/news/gallery/2012/may/02/picture-desk-live-kabul-burma") { browser =>
    import browser._

    val linkNames = $("a").getTexts
    val linkUrls = $("a").getAttributes("href")

    linkNames should contain("Madeleine McCann timeline")
    linkUrls should contain("http://localhost:3333/uk/2009/may/22/madeleine-mccann-timeline")
  }

  it should "render gallery tag links" in HtmlUnit("/news/gallery/2012/may/02/picture-desk-live-kabul-burma") { browser =>
    import browser._

    val linkNames = $("a").getTexts
    val linkUrls = $("a").getAttributes("href")

    linkNames should contain("World news")
    linkUrls should contain("http://localhost:3333/world/world")
  }

  it should "render caption and navigation on first image page" in HtmlUnit("/news/gallery/2012/may/02/picture-desk-live-kabul-burma") { browser =>
    import browser._

    $("p.caption").first.getText should include("A TV grab from state-owned French television station France 2 showing")

    val navNames = $("p.nav a").getTexts
    val navUrls = $("p.nav a").getAttributes("href")
    navNames.toList should be(List("Next"))
    navUrls.toList should be(List("http://localhost:3333/news/gallery/2012/may/02/picture-desk-live-kabul-burma?index=2"))
  }

  it should "render caption and navigation on second image page" in HtmlUnit("/news/gallery/2012/may/02/picture-desk-live-kabul-burma?index=2") { browser =>
    import browser._

    $("p.caption").first.getText should include("Socialist Party supporters watch live TV debate as their presidential")

    val navNames = $("p.nav a").getTexts
    val navUrls = $("p.nav a").getAttributes("href")
    navNames.toList should be(List("Previous", "Next"))
    navUrls.toList should be(List(
      "http://localhost:3333/news/gallery/2012/may/02/picture-desk-live-kabul-burma?index=1",
      "http://localhost:3333/news/gallery/2012/may/02/picture-desk-live-kabul-burma?index=3"
    ))
  }

  it should "render caption and navigation on last image page" in HtmlUnit("/news/gallery/2012/may/02/picture-desk-live-kabul-burma?index=22") { browser =>
    import browser._

    $("p.caption").first.getText should include("This little scout has been taking part in a parade")

    val navNames = $("p.nav a").getTexts
    val navUrls = $("p.nav a").getAttributes("href")
    navNames.toList should be(List("Previous", "Next"))
    navUrls.toList should be(List(
      "http://localhost:3333/news/gallery/2012/may/02/picture-desk-live-kabul-burma?index=21",
      "http://localhost:3333/news/gallery/2012/may/02/picture-desk-live-kabul-burma?trail=true"
    ))
  }

  it should "render caption and navigation on trail page" in HtmlUnit("/news/gallery/2012/may/02/picture-desk-live-kabul-burma?trail=true") { browser =>
    import browser._

    // TODO: Decide what goes here.
    $("p.trail").first.getText should include("Trail page here...")
  }
}