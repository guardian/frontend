package common

import org.scalatest.FlatSpec
import org.scalatest.Matchers
import java.io.{FileInputStream, File}
import org.apache.commons.codec.digest.DigestUtils


class GuardianConfigurationTest extends FlatSpec with Matchers {

  "Guardian Configuration" should "expose guardian.page properties" in {
    val config = new GuardianConfiguration("test", webappConfDirectory = "test-env")
    config.javascript.pageData should be(Map("guardian.page.bar" -> "hello world", "guardian.page.foo" -> "eight"))
  }

  it should "be easy for new developers to get started with properties" in {
    val sourceFile = new File("common/app/common/configuration.scala")
    val hash = DigestUtils.md5Hex(new FileInputStream(sourceFile))

    // If you are looking at this you probably changed the project's configuration.
    // There is a document (that would have been shared with you) that contains all
    // the properties needed to run this project. Make sure you update it to reflect
    // your changes, update the hash below, and off you go
    hash should be ("ac194d47097877892fcc73a77034eb3f")

  }
}
