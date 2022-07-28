package test

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.DoNotDiscover
import org.scalatest.matchers.should.Matchers

@DoNotDiscover class TagTemplateTest extends AnyFlatSpec with Matchers with ConfiguredTestSuite {

  it should "render tag headline" in goTo("/world/turkey") { browser =>
    browser.el("[data-test-id=header-title]").text should be("Turkey")
  }
}
