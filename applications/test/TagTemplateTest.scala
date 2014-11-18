package test

import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}

@DoNotDiscover class TagTemplateTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  it should "render tag headline" in goTo("/world/turkey") { browser =>
    browser.$("[data-test-id=header-title]").first.getText should be ("Turkey")
  }
}
