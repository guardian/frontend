package test

import org.scalatest.Tag
import conf.HealthCheck

object ArticleComponents extends Tag("article components")

object `package` {

  object HtmlUnit extends EditionalisedHtmlUnit(HealthCheck.testPort.toString)
}