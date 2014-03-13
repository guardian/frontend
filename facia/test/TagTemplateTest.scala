package test

import org.scalatest.Matchers
import org.scalatest.FlatSpec

class TagTemplateTest extends FlatSpec with Matchers {

  it should "render tag headline" in HtmlUnit("/world/turkey") { browser =>
    import browser._

    $(".container__title").first.getText should be ("Turkey")
  }
}
