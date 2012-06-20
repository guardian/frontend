package test

import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec
import scala.collection.JavaConversions._

class TagTemplateTest extends FlatSpec with ShouldMatchers {

  "Tag Template" should "render tag metadata" in HtmlUnit("/world/turkey") { browser =>
    import browser._

    $("meta[name=page-id]").getAttributes("content").head should be("world/turkey")
    $("meta[name=section]").getAttributes("content").head should be("world")
    $("meta[name=api-url]").getAttributes("content").head should be("http://content.guardianapis.com/world/turkey")
    $("meta[name=web-title]").getAttributes("content").head should be("Turkey")
    $("meta[name=edition]").getAttributes("content").head should be("UK")
  }

  it should "render tag headline" in HtmlUnit("/world/turkey") { browser =>
    import browser._

    $("h1").first.getText should be("Turkey")
  }
}