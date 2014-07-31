package test

import conf.HealthCheck

object `package` {
  object HtmlUnit extends EditionalisedHtmlUnit(HealthCheck.testPort.toString)
}
