package test

import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}

@DoNotDiscover class TagTemplateTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  it should "render tag headline" in goTo("/world/turkey") { browser =>
    browser.el("[data-test-id=header-title]").text should be("Turkey")
  }
}
