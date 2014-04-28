package common

import org.scalatest.FlatSpec
import org.scalatest.Matchers
import java.io.{FileInputStream, File}
import org.apache.commons.codec.digest.DigestUtils
import org.apache.commons.configuration.MapConfiguration


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
    // the properties needed to run this project. Make sure you update it if there
    // are any required changes, update the hash below, and off you go.

    hash should be ("24bc8eff21de4cf3a9f6622a34a5027c")

  }

  "DFP Api configuration" should "not provide DFP credential object if no properties exist" in {
    val config = new GuardianConfiguration("test", webappConfDirectory = "test-env")
    config.dfpApi.configObject shouldBe empty
  }

  "DFP Api configuration" should "provide DFP credential object all properties are set" in {
    val config = new GuardianConfiguration("test", webappConfDirectory = "test-env-with-dfp-credentials")

    val configuration: MapConfiguration = config.dfpApi.configObject.get
    configuration.getString("api.dfp.clientSecret") should equal ("secretSquirrel")
  }
}
