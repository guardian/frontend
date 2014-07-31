package test

object `package` {

  object HtmlUnit extends EditionalisedHtmlUnit(conf.HealthCheck.testPort.toString)
}