package test

import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}

@DoNotDiscover class ImageContentTemplateTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  it should "render a cartoon" in goTo("/commentisfree/cartoon/2013/jul/15/iain-duncan-smith-benefits-cap") { browser =>
    import browser._
    el("[itemprop='headline']").text should be("Steve Bell on Iain Duncan Smith and the benefits cap – cartoon")
    el(".media-primary img").attribute("src") should include("Steve-Bell-cartoon")
  }

  it should "render a picture" in goTo("/artanddesign/picture/2013/oct/08/photography") { browser =>
    import browser._
    $("[itemprop='headline']").text should be("Early erotica - a picture from the past")
    el(".media-primary img").attribute("src") should include("French-Nude-in-Body-Stock")
  }
}
