package test

import org.scalatest.{Matchers,FlatSpec}
import scala.collection.JavaConversions._

class GalleryTemplateTest extends FlatSpec with Matchers {

  it should "render gallery headline" in HtmlUnit("/news/gallery/2012/may/02/picture-desk-live-kabul-burma") {
    browser =>
      browser.$("h1").first.getText should be("Picture desk live: the day's best news images")
  }

  it should "render gallery story package links" in HtmlUnit("/music/gallery/2012/jun/23/simon-bolivar-orchestra-dudamel-southbank-centre") { browser =>
    val linkUrls = browser.$("a").getAttributes("href")

    linkUrls should contain(HtmlUnit.withHost("/music/2010/sep/16/gustavo-dudamel-simon-bolivar-orchestra"))
  }

  it should "render captions" in HtmlUnit("/news/gallery/2012/may/02/picture-desk-live-kabul-burma") { browser =>
    import browser._
    $("p.gallery2__caption").getTexts.firstNonEmpty.get should include("A TV grab from state-owned French television station France 2 showing the debate between Francois Hollande and Nicolas Sarkozy for the 2012 French presidential election campaign")
  }

  it should "render all images in the gallery" in HtmlUnit("/news/gallery/2012/may/02/picture-desk-live-kabul-burma") { browser =>
    import browser._
    $(".gallery2__item:not(.gallery2__item--advert)").length should be (22)
  }

  it should "render adverts" in HtmlUnit("/news/gallery/2012/may/02/picture-desk-live-kabul-burma") { browser =>
    import browser._
    val ads = $(".gallery2__item--advert")
    ads.length should be (2)
    ads.get(0).find("#dfp-ad--inline1").length should be (1)
    ads.get(1).find("#dfp-ad--inline2").length should be (1)
  }

  it should "show the twitter card meta-data" in HtmlUnit("/music/gallery/2012/jun/23/simon-bolivar-orchestra-dudamel-southbank-centre") { browser =>
    import browser._
    $("meta[property='twitter:card']").getAttributes("content").head should be ("gallery")
    $("meta[property='twitter:title']").getAttributes("content").head should be ("Southbank Centre's Sounds Venezuela festival - in pictures")
    $("meta[property='twitter:image3:src']").getAttributes("content").head should endWith ("/Bassoons-in-the-Symphony--003.jpg")
  }

  it should "include the index parameter in direct links" in HtmlUnit("/music/gallery/2012/jun/23/simon-bolivar-orchestra-dudamel-southbank-centre?index=2") { browser =>
    browser.findFirst("link[rel='canonical']").getAttribute("href") should endWith("/music/gallery/2012/jun/23/simon-bolivar-orchestra-dudamel-southbank-centre?index=2")
  }

  it should "render link to gallery most view onward journey page" in HtmlUnit("/news/gallery/2012/may/02/picture-desk-live-kabul-burma") { browser =>
    import browser._
    $(".most-viewed-no-js").first.getText should be("More galleries")
  }
}
