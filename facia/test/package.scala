package test

import org.fluentlenium.core.domain.FluentWebElement

object `package` {

  object Fake extends FakeApp

  object HtmlUnit extends EditionalisedHtmlUnit

  implicit class WebElement2rich(element: FluentWebElement) {
    lazy val href = element.getAttribute("href")
    def hasAttribute(name: String) = element.getAttribute(name) != null
  }
}