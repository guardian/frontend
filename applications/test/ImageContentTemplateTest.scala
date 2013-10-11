package test

import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec
import scala.collection.JavaConversions._

class ImageContentTemplateTest extends FlatSpec with ShouldMatchers {

  it should "render a cartoon" in HtmlUnit("/commentisfree/cartoon/2013/jul/15/iain-duncan-smith-benefits-cap") {
    browser =>
      import browser._
      $("h1").first.getText should be("Steve Bell on Iain Duncan Smith and the benefits cap – cartoon")
      $("#article img").first.getAttribute("src") should endWith ("General/2013/7/15/1373927091862/Steve-Bell-cartoon-16.07.-001.jpg")
  }
  
  it should "render a picture" in HtmlUnit("/artanddesign/picture/2013/oct/08/photography") {
    browser =>
      import browser._
      $("h1").first.getText should be("Early erotica - a picture from the past")
      $("#article img").first.getAttribute("src") should endWith ("1381235669888/French-Nude-in-Body-Stock-010.jpg")
  }

  ignore should "show the twitter card meta-data" in HtmlUnit("/artanddesign/picture/2013/oct/10/photography-chicago-fire") {
    browser =>
      import browser._
      
      $("meta[property='twitter:card']").getAttributes("content").head should be ("photo")
      $("meta[property='twitter:image.src']").getAttributes("content").head should endWith ("1373927091862/Steve-Bell-cartoon-16.07.-001.jpg")
  }
  
}
