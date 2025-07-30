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

  def isParticipating(implicit request: RequestHeader, testName: String): Boolean = {
    request.attrs.get(attrKey).exists(_.contains((testName)))
  }

  def isInVariant(implicit request: RequestHeader, testName: String, variant: String): Boolean = {
    request.attrs.get(attrKey).exists(_.contains((testName, variant)))
  }

  def allTests(implicit request: RequestHeader): Map[String, String] = {
    request.attrs
      .get(attrKey)
      .map(_.asScala.keys.map { case (testName, variant) => testName -> variant }.toMap)
      .getOrElse(Map.empty)
  }

  def getJavascriptConfig(implicit request: RequestHeader): String = {
    allTests.toList
      .map({ case (key, value) => s""""${key}":"${value}"""" })
      .mkString(",")
  }
}
