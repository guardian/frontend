package test

import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec
import scala.collection.JavaConversions._

class ImageContentTemplateTest extends FlatSpec with ShouldMatchers {

  it should "render a picture" in HtmlUnit("FIXME") {
    browser =>
      import browser._
      $("h1").first.getText should be("FIXME")
      $("img").first.getAttribute("src") should be("FIXME")
  }

  it should "show the twitter card meta-data" in HtmlUnit("FIXME") { browser =>
    import browser._
    $("meta[property='twitter:card']").getAttributes("content").head should be ("photo")
  }
  
}
