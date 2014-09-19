package test

import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}

@DoNotDiscover class ImageContentTemplateTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  it should "render a cartoon" in goTo("/commentisfree/cartoon/2013/jul/15/iain-duncan-smith-benefits-cap") {
    browser =>
      import browser._
      $("[itemprop='headline']").first.getText should be("Steve Bell on Iain Duncan Smith and the benefits cap – cartoon")
      $(".media-primary img").first.getAttribute("src") should include ("Steve-Bell-cartoon")
  }
  
  it should "render a picture" in goTo("/artanddesign/picture/2013/oct/08/photography") {
    browser =>
      import browser._
      $("[itemprop='headline']").getText should be("Early erotica - a picture from the past")
      $(".media-primary img").first.getAttribute("src") should include ("French-Nude-in-Body-Stock")
  }
}
