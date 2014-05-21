package test

import org.scalatest.Matchers
import org.scalatest.FlatSpec

class ImageContentTemplateTest extends FlatSpec with Matchers {

  it should "render a cartoon" in HtmlUnit("/commentisfree/cartoon/2013/jul/15/iain-duncan-smith-benefits-cap") {
    browser =>
      import browser._
      $("[itemprop='headline']").first.getText should be("Steve Bell on Iain Duncan Smith and the benefits cap – cartoon")
      $(".media-primary img").first.getAttribute("src") should endWith ("/Steve-Bell-cartoon-16.07.-001.jpg?width=620&height=-&quality=95")
  }
  
  it should "render a picture" in HtmlUnit("/artanddesign/picture/2013/oct/08/photography") {
    browser =>
      import browser._
      $("[itemprop='headline']").getText should be("Early erotica - a picture from the past")
      $(".media-primary img").first.getAttribute("src") should endWith ("/French-Nude-in-Body-Stock-015.jpg?width=620&height=-&quality=95")
  }
}
