package ab

import play.api.mvc.RequestHeader
import play.api.libs.typedmap.TypedKey
import java.util.concurrent.ConcurrentHashMap
import scala.jdk.CollectionConverters._

object ABTests {

  type ABTest = (String, String)
  type ABTestsHashMap = ConcurrentHashMap[ABTest, Unit]

  val abTestHeader = "X-GU-Server-AB-Tests"

  private val attrKey: TypedKey[ConcurrentHashMap[ABTest, Unit]] =
    TypedKey[ABTestsHashMap]("serverABTests")

  /** Decorates the request with the AB tests defined in the request header. The header should be in the format:
    * "testName1:variant1,testName2:variant2,..."
    */
  def decorateRequest(implicit request: RequestHeader): RequestHeader = {
    val tests = request.headers.get(abTestHeader).fold(Map.empty[String, String]) { tests =>
      tests
        .split(",")
        .collect {
          case test if test.split(":").length == 2 =>
            val parts = test.split(":")
            parts(0) -> parts(1)
        }
        .toMap
    }
    request.addAttr(
      attrKey,
      tests.foldLeft(new ABTestsHashMap) { case (map, (name, variant)) => map.put((name, variant), ()); map },
    )
  }

  /** Checks if the request is participating in a specific AB test.
    * @param testName
    *   The name of the AB test to check.
    * @return
    *   true if the request is participating in the test, false otherwise.
    */
  def isParticipating(implicit request: RequestHeader, testName: String): Boolean = {
    request.attrs.get(attrKey).exists(_.asScala.keys.exists { case (name, _) => name == testName })
  }

  /** Checks if the request is in a specific variant of an AB test.
    * @param testName
    *   The name of the AB test to check.
    * @param variant
    *   The variant to check.
    * @return
    *   true if the request is in the specified variant, false otherwise.
    */
  def isInVariant(implicit request: RequestHeader, testName: String, variant: String): Boolean = {
    request.attrs.get(attrKey).exists(_.containsKey((testName, variant)))
  }

  /** Retrieves all AB tests and their variants for the current request.
    * @return
    *   A map of test names to their variants.
    */
  def allTests(implicit request: RequestHeader): Map[String, String] = {
    request.attrs
      .get(attrKey)
      .map(_.asScala.keys.map { case (testName, variant) => testName -> variant }.toMap)
      .getOrElse(Map.empty)
  }

  /** Generates a JavaScript object string representation of all AB tests and their variants. This is set on the window
    * object for use in client-side JavaScript.
    * @return
    *   A string in the format: {"testName1":"variant1","testName2":"variant2",...}
    */
  def getJavascriptConfig(implicit request: RequestHeader): String = {
    allTests.toList
      .map({ case (key, value) => s""""${key}":"${value}"""" })
      .mkString(",")
  }
}
