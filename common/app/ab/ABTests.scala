package ab

import play.api.mvc.RequestHeader

object ABTests {

  private val abTests = scala.collection.mutable.Map[String, String]()

  val abTestHeader = "X-GU-Server-AB-Tests"

  private def addTest(name: String, variant: String): Unit = {
    abTests += (name -> variant)
  }

  def setupTests(implicit request: RequestHeader): Unit = {
    request.headers.get(abTestHeader).foreach { tests =>
      tests.split(",").foreach { test =>
        val parts = test.split(":")
        if (parts.length == 2) {
          addTest(parts(0).trim, parts(1).trim)
        }
      }
    }
  }

  def isParticipating(testName: String): Boolean = {
    abTests.contains(testName)
  }

  def isInVariant(testName: String, variant: String): Boolean = {
    abTests.get(testName).contains(variant)
  }

  def allTests: Map[String, String] = {
    abTests.toMap
  }

  def getJavascriptConfig(): String = {
    abTests.toList
      .map({ case (key, value) => s""""${key}":"${value}"""" })
      .mkString(",")
  }
}
