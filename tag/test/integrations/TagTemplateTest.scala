package integrations

import org.scalatest.{DoNotDiscover, FlatSpec, Matchers}
import test.ConfiguredTestSuite

@DoNotDiscover class TagTemplateTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  "Tag" should "render tag headline" in goTo("/world/turkey") { browser =>
    browser.el("[data-test-id=header-title]").text should be ("Turkey")
  }
}
