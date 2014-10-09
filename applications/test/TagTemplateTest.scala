package test

import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}

@DoNotDiscover class TagTemplateTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  it should "render tag headline" in goTo("/world/turkey") { browser =>
    browser.$(".container__meta__title").first.getText should be ("Turkey")
  }
}
