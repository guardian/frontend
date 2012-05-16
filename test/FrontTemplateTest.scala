package test

import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec
import scala.collection.JavaConversions._

class FrontTemplateTest extends FlatSpec with ShouldMatchers {

  "Front Template" should "render front metadata" in HtmlUnit("/pages/") { browser =>
    import browser._

    $("meta[name=page-id]").getAttributes("value").head should be("")
    $("meta[name=section]").getAttributes("value").head should be("")
    $("meta[name=api-url]").getAttributes("value").head should be("http://content.guardianapis.com")
    $("meta[name=web-title]").getAttributes("value").head should be("The Guardian")
  }
}