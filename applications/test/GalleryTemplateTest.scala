package test

import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec
import scala.collection.JavaConversions._

class GalleryTemplateTest extends FlatSpec with ShouldMatchers {

  it should "render gallery headline" in HtmlUnit("/news/gallery/2012/may/02/picture-desk-live-kabul-burma") {
    browser =>
      import browser._
      $("h1").first.getText should be("Picture desk live: the day's best news images")
  }

  it should "render gallery story package links" in HtmlUnit("/music/gallery/2012/jun/23/simon-bolivar-orchestra-dudamel-southbank-centre") { browser =>
    import browser._
    val linkNames = $("a").getTexts
    val linkUrls = $("a").getAttributes("href")

    linkNames should contain("Dudamel's Beethoven challenge")
    linkUrls should contain(WithHost("/music/tomserviceblog/2012/jun/21/simon-bolivar-orchestra-dudamel-beethoven"))
  }

  it should "render caption and navigation on first image page" in HtmlUnit("/news/gallery/2012/may/02/picture-desk-live-kabul-burma") { browser =>
    import browser._
    $("p.caption").getTexts.firstNonEmpty.get should include("This little scout has been taking part in a parade marking International Workers' Day in Nigeria's commercial capital, Lagos")

    $("p.gallery-nav a.js-gallery-prev").getAttributes("href").toList should be(List("javascript:")) // and this is how it's hidden

    $("p.gallery-nav a.js-gallery-next").getTexts.toList should be(List("Next"))
    $("p.gallery-nav a.js-gallery-next").getAttributes("href").toList should be(List(WithHost("/news/gallery/2012/may/02/picture-desk-live-kabul-burma?index=2")))
  }

  it should "render caption and navigation on second image page" in HtmlUnit("/news/gallery/2012/may/02/picture-desk-live-kabul-burma?index=2") { browser =>
    import browser._
    $("p.caption").getTexts.toList(1) should include("Is Belgium's finance minister, Steven Vanackere, dazzling his colleagues with a tap dance?")

    $("p.gallery-nav a.js-gallery-prev").getTexts.toList should be(List("Previous"))
    $("p.gallery-nav a.js-gallery-prev").getAttributes("href").toList should be(List(WithHost("/news/gallery/2012/may/02/picture-desk-live-kabul-burma?index=1")))

    $("p.gallery-nav a.js-gallery-next").getTexts.toList should be(List("Next"))
    $("p.gallery-nav a.js-gallery-next").getAttributes("href").toList should be(List(WithHost("/news/gallery/2012/may/02/picture-desk-live-kabul-burma?index=3")))
  }

  it should "render caption and navigation on last image page" in HtmlUnit("/news/gallery/2012/may/02/picture-desk-live-kabul-burma?index=22") { browser =>
    import browser._
    $("p.caption").getTexts.toList.last should include("Socialist Party supporters watch live TV debate as their presidential")

    $("p.gallery-nav a.js-gallery-prev").getTexts.toList should be(List("Previous"))
    $("p.gallery-nav a.js-gallery-prev").getAttributes("href").toList should be(List(WithHost("/news/gallery/2012/may/02/picture-desk-live-kabul-burma?index=21")))

    $("p.gallery-nav a.js-gallery-next").getTexts.toList should be(List("Next"))
    $("p.gallery-nav a.js-gallery-next").getAttributes("href").toList should be(List(WithHost("/news/gallery/2012/may/02/picture-desk-live-kabul-burma?trail=true")))
  }
   
  it should "show the twitter card meta-data" in HtmlUnit("/music/gallery/2012/jun/23/simon-bolivar-orchestra-dudamel-southbank-centre") { browser =>
    import browser._
    $("meta[property='twitter:card']").getAttributes("content").head should be ("gallery")
    $("meta[property='twitter:title']").getAttributes("content").head should be ("Southbank Centre's Sounds Venezuela festival - in pictures")
    $("meta[property='twitter:image3:src']").getAttributes("content").head should endWith ("1340461458157/Simon-Bolivar-conducting--006.jpg")
  }
  
}
