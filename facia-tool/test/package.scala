package test

object `package` {
  object HtmlUnit extends EditionalisedHtmlUnit(controllers.HealthCheck.testPort.toString)
}
