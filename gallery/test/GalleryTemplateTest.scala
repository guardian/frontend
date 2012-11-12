package test

import org.scalatest.matchers.ShouldMatchers
import collection.JavaConversions._
import org.scalatest.FlatSpec
import conf.Configuration
import common.GuardianConfiguration

class GalleryTemplateTest extends FlatSpec with ShouldMatchers {

  implicit val config = Configuration

  private val host = "http://" + Configuration.edition.ukHost

  it should "render gallery headline" in HtmlUnit("/news/gallery/2012/may/02/picture-desk-live-kabul-burma") {
    browser =>
      import browser._

      $("h1").first.getText should be("Picture desk live: the day's best news images")
  }

  it should "render gallery story package links" in HtmlUnit("/music/gallery/2012/jun/23/simon-bolivar-orchestra-dudamel-southbank-centre") { browser =>
    import browser._

    val linkNames = $("a").getTexts
    val linkUrls = $("a").getAttributes("href")

    linkNames should contain("Big Noise orchestra's classical music proves instrumental in social change")
    linkUrls should contain(WithHost("/music/2012/jun/24/simon-bolivar-dudamel-review"))
  }

  it should "render caption and navigation on first image page" in HtmlUnit("/news/gallery/2012/may/02/picture-desk-live-kabul-burma") { browser =>
    import browser._

    $("p.caption").getTexts.firstNonEmpty.get should include("A TV grab from state-owned French television station France 2 showing")

    $("p.gallery-nav a#js-gallery-prev").getTexts.toList should be(List("")) // "" because it is hidden
    $("p.gallery-nav a#js-gallery-prev").getAttributes("href").toList should be(List("javascript:")) // and this is how it's hidden

    $("p.gallery-nav a#js-gallery-next").getTexts.toList should be(List("Next"))
    $("p.gallery-nav a#js-gallery-next").getAttributes("href").toList should be(List(WithHost("/news/gallery/2012/may/02/picture-desk-live-kabul-burma?index=2")))
  }

  it should "render caption and navigation on second image page" in HtmlUnit("/news/gallery/2012/may/02/picture-desk-live-kabul-burma?index=2") { browser =>
    import browser._

    $("p.caption").getTexts.firstNonEmpty.get should include("Socialist Party supporters watch live TV debate as their presidential")

    $("p.gallery-nav a#js-gallery-prev").getTexts.toList should be(List("Previous"))
    $("p.gallery-nav a#js-gallery-prev").getAttributes("href").toList should be(List(WithHost("/news/gallery/2012/may/02/picture-desk-live-kabul-burma?index=1")))

    $("p.gallery-nav a#js-gallery-next").getTexts.toList should be(List("Next"))
    $("p.gallery-nav a#js-gallery-next").getAttributes("href").toList should be(List(WithHost("/news/gallery/2012/may/02/picture-desk-live-kabul-burma?index=3")))
  }

  it should "render caption and navigation on last image page" in HtmlUnit("/news/gallery/2012/may/02/picture-desk-live-kabul-burma?index=22") { browser =>
    import browser._

    $("p.caption").getTexts.firstNonEmpty.get should include("This little scout has been taking part in a parade")

    $("p.gallery-nav a#js-gallery-prev").getTexts.toList should be(List("Previous"))
    $("p.gallery-nav a#js-gallery-prev").getAttributes("href").toList should be(List(WithHost("/news/gallery/2012/may/02/picture-desk-live-kabul-burma?index=21")))

    $("p.gallery-nav a#js-gallery-next").getTexts.toList should be(List("Next"))
    $("p.gallery-nav a#js-gallery-next").getAttributes("href").toList should be(List(WithHost("/news/gallery/2012/may/02/picture-desk-live-kabul-burma?trail=true")))
  }

  /*
  it should "render caption and navigation on trail page" in HtmlUnit("/news/gallery/2012/may/02/picture-desk-live-kabul-burma?trail=true") { browser =>
    import browser._

    // TODO: Decide what goes here.
    $("p.trail").first.getText should include("Trail page here...")
  }
  */
}
