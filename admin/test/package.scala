package test

import controllers.HealthCheck

object `package` {
  object HtmlUnit extends EditionalisedHtmlUnit(HealthCheck.testPort.toString)
}
