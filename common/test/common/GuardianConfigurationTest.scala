package common

import org.scalatest.FlatSpec
import org.scalatest.matchers.ShouldMatchers

class GuardianConfigurationTest extends FlatSpec with ShouldMatchers {

  "Guardian Configuration" should "expose guardian.page properties" in {
    val config = new GuardianConfiguration("test", webappConfDirectory = "test-env")
    config.javascript.pageData should be(Map("guardian.page.bar" -> "hello world", "guardian.page.foo" -> "eight"))
  }
}
