package common

import org.scalatest.FlatSpec
import org.scalatest.matchers.ShouldMatchers

class ConfigurationTest extends FlatSpec with ShouldMatchers {

  "Configuration" should "expose guardian.page properties" in {
    val config = new Configuration("test")
    config.javascript.pageData should be (Map("guardian.page.bar" -> "hello world", "guardian.page.foo" -> "eight"))
  }
}
