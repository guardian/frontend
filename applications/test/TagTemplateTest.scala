package test

import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec
import scala.collection.JavaConversions._

class TagTemplateTest extends FlatSpec with ShouldMatchers {

  it should "render tag headline" in HtmlUnit("/world/turkey") { browser =>
    import browser._

    $("h2 a").first.getText should be ("Turkey")
  }
}
