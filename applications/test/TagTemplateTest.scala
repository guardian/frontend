package test

import org.scalatest.{Matchers, FlatSpec}

class TagTemplateTest extends FlatSpec with Matchers {

  it should "render tag headline" in HtmlUnit("/world/turkey") { browser =>
    browser.$(".container__title").first.getText should be ("Turkey")
  }
}
