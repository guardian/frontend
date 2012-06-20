package test

import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec
import scala.collection.JavaConversions._

class SectionTemplateTest extends FlatSpec with ShouldMatchers {

  "Front Template" should "render front metadata" in HtmlUnit("/uk") { browser =>
    import browser._

    $("meta[name=page-id]").getAttributes("content").head should be("uk")
    $("meta[name=section]").getAttributes("content").head should be("uk")
    $("meta[name=api-url]").getAttributes("content").head should be("http://content.guardianapis.com/uk")
    $("meta[name=web-title]").getAttributes("content").head should be("UK news")
  }

  it should "render front title" in HtmlUnit("/uk") { browser =>
    import browser._
    $("h1").first.getText should be("UK news")
  }
}