package navigation

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import play.api.libs.json.{JsValue, Json}

import java.nio.file.Files
import java.nio.file.Files.createTempFile
import java.nio.file.Path

class NavigationDataTest extends AnyFlatSpec with Matchers {

  "navigation.json used by DCR" should "not change unintentionally" in {
    val referenceJson: JsValue = Json.parse(getClass.getResourceAsStream("/reference-navigation.json"))
    val actualJson = NavigationData.nav

    assert(
      actualJson.equals(referenceJson), {
        val tempFile = createTempFile("navigation-", ".json")
        Files.writeString(tempFile, Json.prettyPrint(actualJson))

        s"""
        |The data in navigation.json (used by DCR) has changed!
        |
        |If this is intentional (eg you're adding a new Section or Edition):
        |* Please update the test resource file 'reference-navigation.json' by copying over the new version from
        |  $tempFile
        |  Unfortunately this file is space indented but reference-navigation.json is tab indented, so you might try
        |  running `cat $tempFile | jq --tab > common/test/resources/reference-navigation.json` to convert spaces to tabs.
        |
        |If this is unintentional:
        |* Please check that you're not breaking the data used by DCR! See
        |  https://github.com/guardian/frontend/pull/21409
        |""".stripMargin
      },
    )
  }
}
