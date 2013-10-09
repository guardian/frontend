package test

import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec
import scala.collection.JavaConversions._

class SectionTemplateTest extends FlatSpec with ShouldMatchers {

  it should "render front title" in HtmlUnit("/uk-news") { browser =>
    import browser._
    $("h1").first.getText should be ("uk news")
  }
}
