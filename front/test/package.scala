package test

import conf.Configuration
import org.fluentlenium.core.domain.FluentWebElement

object `package` {

  object HtmlUnit extends EditionalisedHtmlUnit(Configuration)

  implicit def webElement2rich(element: FluentWebElement) = new {
    lazy val href = element.getAttribute("href")
    def hasAttribute(name: String) = element.getAttribute(name) != null
  }
}