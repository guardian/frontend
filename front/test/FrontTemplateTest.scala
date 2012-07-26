package test

import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec
import scala.collection.JavaConversions._

class FrontTemplateTest extends FlatSpec with ShouldMatchers {

  "Front Template" should "render front metadata" in HtmlUnit("/") { browser =>
    import browser._

    $("meta[name=page-id]").getAttributes("content").head should be("")
    $("meta[name=section]").getAttributes("content").head should be("")
    $("meta[name=api-url]").getAttributes("content").head should be("http://content.guardianapis.com")
    $("meta[name=web-title]").getAttributes("content").head should be("The Guardian")
    $("meta[name=edition]").getAttributes("content").head should be("UK")
  }
}