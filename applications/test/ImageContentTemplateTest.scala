package test

import org.scalatest.Matchers
import org.scalatest.FlatSpec
import scala.collection.JavaConversions._
import common.UsesElasticSearch

class ImageContentTemplateTest extends FlatSpec with Matchers with UsesElasticSearch {

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
}
